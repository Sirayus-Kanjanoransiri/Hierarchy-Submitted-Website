// Student routes module
const express = require('express');
const router = express.Router();
const pool = require('./db.js');

// ============================
//   MULTER CONFIG (ระบบจัดการไฟล์อัปโหลด)
// ============================
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// สร้างโฟลเดอร์สำหรับเก็บสลิปอัตโนมัติ (ถ้ายังไม่มี)
const uploadDir = path.join(__dirname, '../../public/uploads/receipts');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ตั้งค่าที่เก็บไฟล์และชื่อไฟล์
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // ตั้งชื่อไฟล์ใหม่ให้ไม่ซ้ำกัน เช่น slip-167890123.jpg
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'slip-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// ============================
//        REGISTER ROUTE
//   ลงทะเบียนนักศึกษาใหม่
// ============================
router.post('/register', async (req, res) => {
  const {
    student_id, password, full_name, department_id, email,
    address_no, address_moo, address_soi, address_street,
    address_subdistrict, address_district, address_province, address_postcode
  } = req.body;

  console.log('Received registration data:', req.body); 

  // ---- VALIDATE REQUIRED FIELDS ----
  if (!student_id || !password || !full_name || !department_id || !email) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  try {
    // ---- CREATE NEW STUDENT RECORD ----
    await pool.query(
      'INSERT INTO students (student_id, password, full_name, department_id, email, address_no, address_moo, address_soi, address_street, address_subdistrict, address_district, address_province, address_postcode, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [student_id, password, full_name, department_id, email, address_no || null, address_moo || null, address_soi || null,
        address_street || null, address_subdistrict || null, address_district || null, address_province || null, address_postcode || null, '0']
    );
    res.json({ message: 'ลงทะเบียนสำเร็จ รอการอนุมัติจากแอดมิน' });
  } catch (error) {
    console.error('pool Error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'รหัสนักศึกษานี้ถูกใช้งานแล้ว' });
    }
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ============================
//   GET STUDENT BY STUDENT_ID
// ============================
router.get('/user/:student_id', async (req, res) => {
  const { student_id } = req.params;

  try {
    const query = `
      SELECT 
        s.id,
        s.student_id,
        s.full_name,
        s.email,
        s.department_id,
        s.advisor_id,
        s.status,
        s.address_no,
        s.address_moo,
        s.address_soi,
        s.address_street,
        s.address_subdistrict,
        s.address_district,
        s.address_province,
        s.address_postcode,
        d.department_name,
        d.faculty_id,
        f.faculty_name
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN faculty f ON d.faculty_id = f.id
      WHERE s.student_id = ?
    `;

    const [rows] = await pool.query(query, [student_id]);

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('pool Error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ============================
//   SENDING SUBMISSION FORM DATA 
// ============================
router.post('/api/submissions', async (req, res) => {
  const { student_id, form_id, form_data } = req.body;
  let conn;

  try {
    // ต้องใช้ Transaction เพราะถ้าพังกลางคิว จะได้ยกเลิกทั้งหมดได้
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 1. ดึงกฎการเดินเอกสาร (Workflow) จากตาราง form_workflows ให้ถูกต้อง
    const [flows] = await conn.query(`
      SELECT step_order, role_id
      FROM form_workflows
      WHERE form_id = ?
      ORDER BY step_order ASC
    `, [form_id]);

    if (flows.length === 0) {
      throw new Error('ไม่พบเส้นทางการอนุมัติ (Workflow) สำหรับฟอร์มชนิดนี้');
    }

    // 2. ดึงข้อมูลว่าใครคืออาจารย์ที่ปรึกษาของนักศึกษาคนนี้
    const [[student]] = await conn.query(`
      SELECT advisor_id FROM students WHERE id = ?
    `, [student_id]);

    if (!student) {
      throw new Error('ไม่พบข้อมูลนักศึกษาในระบบ');
    }

    // 3. บันทึกใบคำร้องลงในตารางหลัก submissions
    const [subResult] = await conn.query(`
      INSERT INTO submissions (student_id, form_id, form_data, submission_status) 
      VALUES (?, ?, ?, 'PENDING')
    `, [student_id, form_id, JSON.stringify(form_data)]);

    const submissionId = subResult.insertId; // เก็บ ID ที่เพิ่งสร้างใหม่ไว้ใช้ต่อ

    // 4. วนลูปสร้างด่านอนุมัติลงใน approval_steps ทันที
    for (const flow of flows) {
      let assignedApproverId = null;

      if (flow.role_id === 1) {
        // ด่านที่ 1 (อ.ที่ปรึกษา) - บังคับส่งให้ที่ปรึกษาตัวเอง
        if (!student.advisor_id) {
          throw new Error('นักศึกษาคนนี้ยังไม่ได้ระบุอาจารย์ที่ปรึกษา');
        }
        assignedApproverId = student.advisor_id;
      } else {
        // ด่านอื่นๆ ค้นหาอาจารย์/เจ้าหน้าที่ ที่ถือ Role นั้นๆ อยู่
        const [approvers] = await conn.query(`
          SELECT a.id 
          FROM approvers a
          JOIN approver_roles ar ON a.id = ar.approver_id
          WHERE ar.role_id = ? AND a.is_active = 1
          LIMIT 1
        `, [flow.role_id]);

        if (approvers.length === 0) {
          throw new Error(`ระบบไม่พบผู้อนุมัติที่รับผิดชอบตำแหน่ง Role ID: ${flow.role_id}`);
        }
        assignedApproverId = approvers[0].id;
      }

      // บันทึกลำดับขั้นนั้นลง Database
      await conn.query(`
        INSERT INTO approval_steps (submission_id, step_order, role_id, assigned_approver_id, status)
        VALUES (?, ?, ?, ?, 'PENDING')
      `, [submissionId, flow.step_order, flow.role_id, assignedApproverId]);
    }

    await conn.commit();
    res.json({ message: 'ส่งคำร้องและแจกจ่ายเอกสารให้ผู้อนุมัติเรียบร้อยแล้ว' });

  } catch (error) {
    // ถ้าพังกลางทาง ให้ย้อนกลับ (Rollback) ข้อมูลทั้งหมด จะได้ไม่เกิดขยะใน Database
    if (conn) await conn.rollback();
    console.error('Submission Error:', error);
    res.status(500).json({ error: error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
  } finally {
    // อย่าลืมคืน connection ให้ระบบ
    if (conn) conn.release();
  }
});

// ============================
//   UPDATE PROFILE (PERSONAL)
// ============================
router.put('/api/student/update-profile/:id', async (req, res) => {
  const { id } = req.params; // คือ student_id
  const { 
    password, email, 
    address_no, address_moo, address_soi, address_street,
    address_subdistrict, address_district, address_province, address_postcode 
  } = req.body;

  try {
    let sql = `
      UPDATE students SET 
      email = ?,
      address_no = ?, address_moo = ?, address_soi = ?, address_street = ?,
      address_subdistrict = ?, address_district = ?, address_province = ?, address_postcode = ?
    `;
    let params = [
      email, 
      address_no, address_moo, address_soi, address_street,
      address_subdistrict, address_district, address_province, address_postcode
    ];

    // ถ้ามีการกรอกรหัสผ่านใหม่ ให้ทำการอัปเดตด้วย
    if (password && password.trim() !== "") {
      sql += `, password = ?`;
      params.push(password);
    }

    sql += ` WHERE student_id = ?`;
    params.push(id);

    await pool.query(sql, params);
    res.json({ message: 'อัปเดตข้อมูลส่วนตัวสำเร็จ' });
  } catch (error) {
    console.error('Error updating student profile:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
  }
});

// ============================
//   PAYMENT & RECEIPT ROUTES (ระบบการเงิน)
// ============================

// 1. ดึงรายการบิลค้างชำระของนักศึกษา (ที่ยังจ่ายไม่ครบ)
router.get('/api/payments/pending/:student_id', async (req, res) => {
  const { student_id } = req.params;
  try {
    const [payments] = await pool.query(`
      SELECT 
        p.id as payment_id, p.amount_due, p.amount_paid, p.due_date, p.payment_status, p.receipt_image_path,
        s.id as submission_id, s.form_data, 
        f.name as form_name
      FROM student_payments p
      JOIN submissions s ON p.submission_id = s.id
      JOIN forms f ON s.form_id = f.id
      WHERE p.student_id = ? AND p.payment_status IN ('UNPAID', 'PARTIAL')
      ORDER BY p.due_date ASC
    `, [student_id]);
    
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการชำระเงิน' });
  }
});

// 2. รับไฟล์อัปโหลดสลิปโอนเงิน
router.post('/api/payments/upload-slip', upload.single('receipt'), async (req, res) => {
  const { payment_id } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'กรุณาอัปโหลดไฟล์สลิปโอนเงิน' });
  }

  // สร้าง Path แบบ Relative เพื่อเก็บลง Database (เผื่อเอาไปดึงโชว์หน้าเว็บ)
  const receiptPath = '/uploads/receipts/' + req.file.filename;

  try {
    // บันทึกที่อยู่ไฟล์รูปภาพลงในตาราง student_payments
    await pool.query(
      'UPDATE student_payments SET receipt_image_path = ? WHERE id = ?',
      [receiptPath, payment_id]
    );

    res.json({ 
      message: 'อัปโหลดสลิปเรียบร้อยแล้ว กรุณารอเจ้าหน้าที่การเงินตรวจสอบค่ะ',
      receipt_path: receiptPath 
    });
  } catch (error) {
    console.error('Error uploading receipt:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกสลิป' });
  }
});

// ============================
//   ติดตามสถานะคำร้อง (SUBMISSION PROGRESS)
// ============================

// 1. ดึงรายการคำร้องทั้งหมดของนักศึกษาคนนี้
router.get('/api/student/submissions', async (req, res) => {
  const { student_id } = req.query;
  if (!student_id) return res.status(400).json({ error: 'Missing student_id' });

  try {
    const [rows] = await pool.query(`
      SELECT id, form_id, form_data, submission_status, submitted_at
      FROM submissions
      WHERE student_id = ?
      ORDER BY submitted_at DESC
    `, [student_id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// 2. ดึงรายละเอียดลำดับการอนุมัติ (Workflow Steps) ของคำร้องนั้นๆ
router.get('/api/student/submission-steps', async (req, res) => {
  const { submission_id } = req.query;
  if (!submission_id) return res.status(400).json({ error: 'Missing submission_id' });

  try {
    const [rows] = await pool.query(`
      SELECT 
        aps.id, aps.step_order, aps.status, aps.reject_reason,
        r.role_name,
        a.full_name AS approver_name
      FROM approval_steps aps
      JOIN roles r ON aps.role_id = r.id
      LEFT JOIN approvers a ON aps.assigned_approver_id = a.id
      WHERE aps.submission_id = ?
      ORDER BY aps.step_order ASC
    `, [submission_id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching steps:', error);
    res.status(500).json({ error: 'Failed to fetch steps' });
  }
});

module.exports = router;