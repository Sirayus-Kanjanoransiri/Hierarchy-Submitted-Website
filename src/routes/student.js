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
        s.program_of_study,
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
        f.faculty_name,
        p.program_name
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN faculty f ON d.faculty_id = f.id
      LEFT JOIN program_of_study p ON s.program_of_study = p.id
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
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 1. ดึงข้อมูลนักศึกษาพร้อม Department ID และ Advisor ID เพื่อใช้ตรวจสอบ
    const [[student]] = await conn.query(`
      SELECT id, department_id, advisor_id 
      FROM students 
      WHERE id = ?
    `, [student_id]);

    if (!student) {
      throw new Error('ไม่พบข้อมูลนักศึกษาในระบบ');
    }

    // 2. ดึง Workflow ของฟอร์มนี้
    const [flows] = await conn.query(`
      SELECT step_order, role_id
      FROM form_workflows
      WHERE form_id = ?
      ORDER BY step_order ASC
    `, [form_id]);

    if (flows.length === 0) {
      throw new Error('ไม่พบเส้นทางการอนุมัติ (Workflow) สำหรับฟอร์มชนิดนี้');
    }

    // 3. บันทึกใบคำร้องหลัก
    const [subResult] = await conn.query(`
      INSERT INTO submissions (student_id, form_id, form_data, submission_status) 
      VALUES (?, ?, ?, 'PENDING')
    `, [student_id, form_id, JSON.stringify(form_data)]);

    const submissionId = subResult.insertId;

    // 4. วนลูปสร้างด่านอนุมัติ (Approval Steps)
    for (const flow of flows) {
      let assignedApproverId = null;

      // --- กรณีที่ 1: อ.ที่ปรึกษา (Role ID: 1) ---
      if (flow.role_id === 1) {
        if (!student.advisor_id) {
          throw new Error('นักศึกษาคนนี้ยังไม่ได้ระบุอาจารย์ที่ปรึกษาในระบบ');
        }
        
        // ตรวจสอบว่า อ.ที่ปรึกษาคนนี้ สังกัด Department เดียวกับนักศึกษาหรือไม่
        const [[advisorCheck]] = await conn.query(`
          SELECT id FROM approvers 
          WHERE id = ? AND department_id = ? AND is_active = 1
        `, [student.advisor_id, student.department_id]);

        if (!advisorCheck) {
          throw new Error('อาจารย์ที่ปรึกษาไม่ได้อยู่ในภาควิชาเดียวกับนักศึกษา หรือสถานะไม่พร้อมใช้งาน');
        }
        assignedApproverId = student.advisor_id;

      } 
      // --- กรณีที่ 2: หัวหน้าสาขา (Role ID: 2) ---
      else if (flow.role_id === 2) {
        const [deptHeads] = await conn.query(`
          SELECT a.id 
          FROM approvers a
          JOIN approver_roles ar ON a.id = ar.approver_id
          WHERE ar.role_id = 2 
            AND a.department_id = ? 
            AND a.is_active = 1
          LIMIT 1
        `, [student.department_id]);

        if (deptHeads.length === 0) {
          throw new Error(`ไม่พบหัวหน้าสาขาที่สังกัดสาขา ID: ${student.department_id}`);
        }
        assignedApproverId = deptHeads[0].id;

      } 
      // --- กรณีที่ 3: บทบาทอื่นๆ (คณบดี, ทะเบียน, ฯลฯ) ---
      else {
        // สำหรับบทบาทส่วนกลาง หรือบทบาทที่ไม่แยกตามภาควิชา (เช่น คณบดี Role 3, 4)
        // หมายเหตุ: หาก "รองคณบดี" แยกตามคณะ ให้เพิ่มเงื่อนไขตรวจสอบ faculty_id เพิ่มเติมได้
        const [approvers] = await conn.query(`
          SELECT a.id 
          FROM approvers a
          JOIN approver_roles ar ON a.id = ar.approver_id
          WHERE ar.role_id = ? AND a.is_active = 1
          LIMIT 1
        `, [flow.role_id]);

        if (approvers.length === 0) {
          throw new Error(`ไม่พบผู้อนุมัติที่มีบทบาท (Role ID: ${flow.role_id}) ในระบบ`);
        }
        assignedApproverId = approvers[0].id;
      }

      // บันทึกขั้นตอนการอนุมัติ
      await conn.query(`
        INSERT INTO approval_steps (submission_id, step_order, role_id, assigned_approver_id, status)
        VALUES (?, ?, ?, ?, 'PENDING')
      `, [submissionId, flow.step_order, flow.role_id, assignedApproverId]);
    }

    await conn.commit();
    res.json({ 
      message: 'ส่งคำร้องสำเร็จ', 
      submission_id: submissionId 
    });

  } catch (error) {
    if (conn) await conn.rollback();
    console.error('Submission Error:', error);
    res.status(500).json({ error: error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
  } finally {
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
router.get('/api/submissions-progress', async (req, res) => {
  const { student_id } = req.query;
  if (!student_id) return res.status(400).json({ error: 'Missing student_id' });

  try {
    const [rows] = await pool.query(`
      SELECT 
          s.id, 
          s.form_id, 
          s.form_data, 
          s.submission_status, 
          s.submitted_at,
          f.name AS form_name,           
          c.name AS category_name        
        FROM submissions s
        JOIN forms f ON s.form_id = f.id
        JOIN categories c ON f.category_id = c.id
        WHERE s.student_id = ?
        ORDER BY s.submitted_at DESC
    `, [student_id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// 2. ดึงรายละเอียดลำดับการอนุมัติ (Workflow Steps) ของคำร้องนั้นๆ
router.get('/api/submission-steps', async (req, res) => {
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

// ==========================================
// 1. ดึงรายละเอียดคำร้องสำหรับการแก้ไข (Edit Submission) - ใช้สำหรับโหลดข้อมูลเก่ามาแสดงในฟอร์มตอนกดแก้ไข
// ==========================================
router.get('/api/submissions/detail', async (req, res) => {
  const { id } = req.query; // รับ submission_id จาก Query String (?id=...)

  if (!id) {
    return res.status(400).json({ error: 'กรุณาระบุ ID ของคำร้อง (Missing submission id)' });
  }

  try {
    // ดึงข้อมูลจากตาราง submissions
    const [rows] = await pool.query(`
      SELECT 
        id, 
        form_id, 
        form_data, 
        submission_status, 
        submitted_at
      FROM submissions
      WHERE id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลคำร้องที่ระบุ' });
    }

    const submission = rows[0];

    // ตรวจสอบว่า form_data เป็น String หรือไม่ ถ้าใช่ให้ Parse เป็น Object ก่อนส่งออกไป
    // เพื่อให้ Frontend ใช้งานได้ทันทีโดยไม่ต้อง JSON.parse ซ้ำ
    if (typeof submission.form_data === 'string') {
      try {
        submission.form_data = JSON.parse(submission.form_data);
      } catch (e) {
        console.error("Error parsing form_data:", e);
        // ถ้า parse ไม่ได้ให้ส่งไปแบบเดิม
      }
    }

    res.json(submission);
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลจากฐานข้อมูล' });
  }
});

// ==========================================
// 2. อัปเดตคำร้องที่ถูกตีกลับ (Resubmit Edited Submission)
// ==========================================
router.put('/api/submissions/:id', async (req, res) => {
  const { id } = req.params;
  const { form_data } = req.body;

  if (!form_data) {
    return res.status(400).json({ error: 'ไม่พบข้อมูลที่จะอัปเดต' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 1. อัปเดตข้อมูลฟอร์ม และเปลี่ยนสถานะกลับเป็น PENDING เพื่อเริ่มกระบวนการใหม่ (หรือตาม Logic ของคุณ)
    await conn.query(`
      UPDATE submissions 
      SET form_data = ?, submission_status = 'PENDING' 
      WHERE id = ?
    `, [JSON.stringify(form_data), id]);

    // 2. รีเซ็ตสถานะการอนุมัติ (Approval Steps) ให้กลับมารอใหม่ 
    // เฉพาะขั้นตอนที่เคยโดนตีกลับ (NEED_REVISION) หรือทั้งหมด ขึ้นอยู่กับนโยบาย
    await conn.query(`
      UPDATE approval_steps 
      SET status = 'PENDING', reject_reason = NULL 
      WHERE submission_id = ?
    `, [id]);

    await conn.commit();
    res.json({ message: 'แก้ไขคำร้องและส่งใหม่เรียบร้อยแล้ว' });
  } catch (error) {
    if (conn) await conn.rollback();
    console.error('Update Error:', error);
    res.status(500).json({ error: 'ไม่สามารถบันทึกการแก้ไขได้' });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;