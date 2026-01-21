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

// ============================
//   SENDING SUBMISSION FORM DATA
// ============================
router.post('/api/submissions', async (req, res) => {
  const { student_id, form_id, subject, to, form_data } = req.body;

  try {
    const [rows] = await pool.query('INSERT INTO submissions (student_id, form_id, form_data, submission_status) VALUES (?, ?, ?, "PENDING")', 
      [student_id, form_id, JSON.stringify(form_data)]);
    res.json({ message: 'บันทึกข้อมูลสําเร็จ' });
  } catch (error) {
    console.error('pool Error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
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

module.exports = router;
