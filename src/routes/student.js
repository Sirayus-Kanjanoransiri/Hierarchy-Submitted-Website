// Student routes module
const express = require('express');
const router = express.Router();
const pool = require('./db.js');

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

// ==========================================
//   SENDING SUBMISSION FORM DATA (FIXED VERSION)
// ==========================================
router.post('/api/submissions', async (req, res) => {
  const { student_id, form_id, form_data } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. สร้าง submission (สถานะตั้งต้นเป็น IN_PROGRESS ตามโค้ดเดิม)
    const [result] = await conn.query(
      `INSERT INTO submissions (student_id, form_id, form_data, submission_status)
       VALUES (?, ?, ?, 'IN_PROGRESS')`,
      [student_id, form_id, JSON.stringify(form_data)]
    );

    const submissionId = result.insertId;

    // 2. ดึง workflow ของฟอร์มนี้
    const [flows] = await conn.query(
      `SELECT fw.step_order, fw.role_id, r.role_name
       FROM form_workflows fw
       JOIN roles r ON fw.role_id = r.id
       WHERE fw.form_id = ?
       ORDER BY fw.step_order`,
      [form_id]
    );

    // 3. สร้างรายการผู้อนุมัติในแต่ละลำดับ (approval_steps)
    for (const step of flows) {
      let approverId = null;

      if (step.role_id === 1) { 
        // --- กรณี อ.ที่ปรึกษา ---
        // ดึงจาก advisor_id ในข้อมูลนักศึกษาโดยตรง
        const [[student]] = await conn.query(
          `SELECT advisor_id FROM students WHERE id = ?`,
          [student_id]
        );
        approverId = student ? student.advisor_id : null;
      } 
      else if (step.role_id === 2) { 
        // --- กรณี หัวหน้าสาขา (จุดที่แก้ไข) ---
        // หาผู้อนุมัติที่มี Role ID = 2 และต้องมี department_id ตรงกับนักศึกษา
        const [[deptApprover]] = await conn.query(
          `SELECT a.id 
           FROM approvers a
           JOIN approver_roles ar ON a.id = ar.approver_id
           JOIN students s ON s.department_id = a.department_id
           WHERE ar.role_id = ? AND s.id = ?
           LIMIT 1`,
          [step.role_id, student_id]
        );
        approverId = deptApprover ? deptApprover.id : null;
      }
      else {
        // --- กรณี Role อื่นๆ (เช่น เจ้าหน้าที่สารบรรณ, รองคณบดี) ---
        // เลือกคนแรกที่เจอในระบบที่มี Role นั้นๆ
        const [[commonApprover]] = await conn.query(
          `SELECT ar.approver_id
           FROM approver_roles ar
           WHERE ar.role_id = ?
           LIMIT 1`,
          [step.role_id]
        );
        approverId = commonApprover ? commonApprover.approver_id : null;
      }

      // ตรวจสอบว่าพบผู้อนุมัติหรือไม่ก่อน Insert
      if (!approverId) {
        throw new Error(`ไม่พบผู้อนุมัติสำหรับตำแหน่ง ${step.role_name}`);
      }

      await conn.query(
        `INSERT INTO approval_steps
         (submission_id, step_order, assigned_approver_id, role_name_at_step, role_id)
         VALUES (?, ?, ?, ?, ?)`,
        [
          submissionId,
          step.step_order,
          approverId,
          step.role_name,
          step.role_id
        ]
      );
    }

    await conn.commit();
    res.json({ message: 'ส่งคำร้องเรียบร้อย', submission_id: submissionId });

  } catch (err) {
    await conn.rollback();
    console.error('Submission Error:', err);
    res.status(500).json({ 
      error: 'การส่งคำร้องขัดข้อง', 
      details: err.message 
    });
  } finally {
    conn.release();
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
//   GET STUDENT SUBMISSIONS
// ============================
router.get('/api/student/submissions', async (req, res) => {
  const { student_id } = req.query;

  if (!student_id) {
    return res.status(400).json({ message: 'missing student_id' });
  }

  try {
    const [rows] = await pool.query(`
      SELECT 
        s.id,
        s.form_id,
        s.form_data,
        s.submission_status,
        s.submitted_at,
        f.name AS form_name
      FROM submissions s
      LEFT JOIN forms f ON s.form_id = f.id
      WHERE s.student_id = ?
      ORDER BY s.submitted_at DESC
    `, [student_id]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ============================
//   GET SINGLE SUBMISSION BY ID
// ============================
router.get('/api/student/submission/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT id, student_id, form_id, form_data, submission_status, submitted_at
       FROM submissions
       WHERE id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'ไม่พบคำร้อง' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ============================
//   GET SUBMISSION STEPS
// ============================
router.get('/api/student/submission-steps', async (req, res) => {
  const { submission_id } = req.query;

  if (!submission_id) {
    return res.status(400).json({ message: 'missing submission_id' });
  }

  try {
    const [steps] = await pool.query(`
      SELECT 
        ss.id,
        ss.step_order,
        ss.role_name_at_step,
        ss.status,
        ss.reject_reason,
        a.full_name AS approver_name 
        FROM approval_steps ss
        LEFT JOIN approvers a ON ss.assigned_approver_id = a.id
        WHERE ss.submission_id = ?
        ORDER BY ss.step_order ASC;
    `, [submission_id]);

    res.json(steps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ============================
//   EDIT SUBMISSION (REVISION)
// ============================
router.put('/api/student/revise-submission/:id', async (req, res) => {
  const { id } = req.params;
  const { form_data } = req.body;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // ตรวจสอบสถานะก่อนแก้
    const [[submission]] = await conn.query(
      'SELECT submission_status FROM submissions WHERE id = ?',
      [id]
    );

    if (!submission || submission.submission_status !== 'NEED_REVISION') {
      await conn.rollback();
      return res.status(400).json({ message: 'ไม่สามารถแก้ไขคำร้องนี้ได้' });
    }

    // อัปเดตข้อมูลใหม่
    await conn.query(
      'UPDATE submissions SET form_data = ?, submission_status = "IN_PROGRESS" WHERE id = ?',
      [JSON.stringify(form_data), id]
    );

    // reset step ที่เคย NEED_REVISION หรือ PENDING ให้กลับเป็น PENDING
    await conn.query(`
      UPDATE approval_steps
      SET status = 'PENDING',
          reject_reason = NULL
      WHERE submission_id = ?
        AND status IN ('PENDING', 'NEED_REVISION')
    `, [id]);

    // // log การแก้ไขคำร้อง
    // await conn.query(
    //   `INSERT INTO submission_action_logs (submission_id, approver_id, action, note)
    //    VALUES (?, 0, 'REVISION_SUBMITTED', 'Revisioned and resubmitted by student')`,
    //   [id]
    // );

    await conn.commit();
    res.json({ message: 'แก้ไขคำร้องสำเร็จ ส่งกลับเข้าสู่กระบวนการพิจารณา' });

  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  } finally {
    conn.release();
  }
});


module.exports = router;
