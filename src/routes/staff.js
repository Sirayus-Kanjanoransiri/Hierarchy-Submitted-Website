// Staff routes module
const express = require('express');
const router = express.Router();
const pool = require('./db.js');

// ============================
//   GET PENDING STUDENT LIST
// ============================
router.get('/api/students/pending', async (req, res) => {
  try {
    const query = `
      SELECT 
        s.id,
        s.student_id,
        s.full_name,
        s.email,
        d.department_name,
        f.faculty_name
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN faculty f ON d.faculty_id = f.id
      WHERE s.status = '0'
    `;

    const [pendingStudents] = await pool.query(query);
    res.json(pendingStudents);
  } catch (error) {
    console.error("pool Error fetching pending students:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลนักศึกษาที่รอดำเนินการ" });
  }
});

// ============================
//   APPROVE STUDENT STATUS
// ============================
router.put('/api/student/approve/:student_id', async (req, res) => {
  const { student_id } = req.params;

  try {
    const [result] = await pool.query(
      "UPDATE students SET status = '1' WHERE student_id = ? AND status = '0'",
      [student_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ไม่พบนักศึกษาที่รอดำเนินการ หรือนักศึกษาได้รับการอนุมัติไปแล้ว" });
    }

    res.json({ message: `อนุมัตินักศึกษา ID ${student_id} เรียบร้อยแล้ว` });
  } catch (error) {
    console.error("pool Error approving student:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการอนุมัติ" });
  }
});

// ============================
//   STUDENT MANAGEMENT (CRUD)
// ============================

// 1. ดึงข้อมูลนักศึกษาทั้งหมด (JOIN สาขา และ ที่ปรึกษา)
router.get('/api/students-list', async (req, res) => {
  try {
    const sql = `
      SELECT s.*, d.department_name, a.full_name AS advisor_name
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN approvers a ON s.advisor_id = a.id
      ORDER BY s.id DESC
    `;
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลนักศึกษา' });
  }
});

// 2. เพิ่มนักศึกษาใหม่
router.post('/api/students', async (req, res) => {
  const { 
    student_id, full_name, password, email, department_id, advisor_id,
    address_no, address_moo, address_soi, address_street, 
    address_subdistrict, address_district, address_province, address_postcode,
    status
  } = req.body;

  if (!student_id || !full_name || !department_id) {
    return res.status(400).json({ message: 'กรุณากรอกรหัสนักศึกษา, ชื่อ และสาขาวิชา' });
  }

  try {
    const sql = `
      INSERT INTO students 
      (student_id, full_name, password, email, department_id, advisor_id,
       address_no, address_moo, address_soi, address_street,
       address_subdistrict, address_district, address_province, address_postcode, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await pool.query(sql, [
      student_id, full_name, password, email, department_id, advisor_id || null,
      address_no, address_moo, address_soi, address_street,
      address_subdistrict, address_district, address_province, address_postcode, status || '0'
    ]);
    
    res.json({ message: 'เพิ่มข้อมูลนักศึกษาสำเร็จ' });
  } catch (error) {
    console.error('Error adding student:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'รหัสนักศึกษานี้มีอยู่ในระบบแล้ว' });
    }
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล' });
  }
});

// 3. แก้ไขข้อมูลนักศึกษา
router.put('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    student_id, full_name, password, email, department_id, advisor_id,
    address_no, address_moo, address_soi, address_street, 
    address_subdistrict, address_district, address_province, address_postcode,
    status
  } = req.body;

  try {
    let sql = `
      UPDATE students SET 
      student_id=?, full_name=?, email=?, department_id=?, advisor_id=?,
      address_no=?, address_moo=?, address_soi=?, address_street=?,
      address_subdistrict=?, address_district=?, address_province=?, address_postcode=?, status=?
    `;
    let params = [
      student_id, full_name, email, department_id, advisor_id || null,
      address_no, address_moo, address_soi, address_street,
      address_subdistrict, address_district, address_province, address_postcode, status
    ];

    // ถ้ามีการส่งรหัสผ่านใหม่มา ให้แก้ด้วย
    if (password && password.trim() !== "") {
        sql += `, password=?`;
        params.push(password);
    }
    
    sql += ` WHERE id=?`;
    params.push(id);

    await pool.query(sql, params);
    res.json({ message: 'แก้ไขข้อมูลสำเร็จ' });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล' });
  }
});

// 4. ลบข้อมูลนักศึกษา
router.delete('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM students WHERE id = ?', [id]);
    res.json({ message: 'ลบข้อมูลสำเร็จ' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
  }
});

// ============================
//   STUDENT SEARCH (For Staff View)
// ============================
router.get('/api/students/search', async (req, res) => {
  const { q } = req.query; // รับคำค้นหา (keyword)

  try {
    // ถ้าไม่มีคำค้นหา ส่งค่าว่างกลับไป
    if (!q || q.trim() === '') {
      return res.json([]);
    }

    const searchTerm = `%${q}%`;
    const sql = `
      SELECT 
        s.*, 
        d.department_name, 
        f.faculty_name, 
        a.full_name AS advisor_name,
        a.approver_prefix AS advisor_prefix
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN faculty f ON d.faculty_id = f.id
      LEFT JOIN approvers a ON s.advisor_id = a.id
      WHERE s.student_id LIKE ? OR s.full_name LIKE ?
      ORDER BY s.student_id ASC
      LIMIT 20
    `;
    
    const [rows] = await pool.query(sql, [searchTerm, searchTerm]);
    res.json(rows);
  } catch (error) {
    console.error('Error searching students:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการค้นหาข้อมูล' });
  }
});

// ============================
//   STAFF MANAGEMENT (CRUD) - Updated for sql.sql
// ============================

// 1. ดึงข้อมูลเจ้าหน้าที่ทั้งหมด
router.get('/api/staff-management', async (req, res) => {
  try {
    // เลือกข้อมูลจากตาราง staff
    const [rows] = await pool.query('SELECT staffs_id, username, full_name, email, role FROM staff'); 
    // หมายเหตุ: ไม่ดึง password_hash ส่งกลับไปเพื่อความปลอดภัย
    res.json(rows);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
  }
});

// 2. เพิ่มเจ้าหน้าที่ใหม่
router.post('/api/staff-management', async (req, res) => {
  const { username, password, full_name, email, role } = req.body;

  // ตรวจสอบค่าว่าง (staffs_id เป็น Auto Increment ไม่ต้องรับค่า)
  if (!username || !password || !full_name || !email) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  try {
    await pool.query(
      'INSERT INTO staff (username, password_hash, full_name, email, role) VALUES (?, ?, ?, ?, ?)',
      [username, password, full_name, email, role || 'เจ้าหน้าที่ทั่วไป']
    );
    res.json({ message: 'เพิ่มเจ้าหน้าที่สำเร็จ' });
  } catch (error) {
    console.error('Error adding staff:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Username หรือ Email นี้มีอยู่แล้ว' });
    }
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล' });
  }
});

// 3. แก้ไขข้อมูลเจ้าหน้าที่
router.put('/api/staff-management/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password, full_name, email, role } = req.body;

  try {
    // ตรวจสอบว่าจะแก้รหัสผ่านด้วยหรือไม่
    if (password && password.trim() !== "") {
        await pool.query(
            'UPDATE staff SET username=?, password_hash=?, full_name=?, email=?, role=? WHERE staffs_id=?',
            [username, password, full_name, email, role, id]
        );
    } else {
        // กรณีไม่แก้รหัสผ่าน (ใช้รหัสเดิม)
        await pool.query(
            'UPDATE staff SET username=?, full_name=?, email=?, role=? WHERE staffs_id=?',
            [username, full_name, email, role, id]
        );
    }
    
    res.json({ message: 'แก้ไขข้อมูลสำเร็จ' });
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล' });
  }
});

// 4. ลบเจ้าหน้าที่
router.delete('/api/staff-management/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM staff WHERE staffs_id = ?', [id]);
    res.json({ message: 'ลบข้อมูลสำเร็จ' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
  }
});

// ============================
//   STAFF PROFILE MANAGEMENT
// ============================

// ดึงข้อมูล Staff รายคน (เพื่อนำไปแสดงในฟอร์มแก้ไข)
router.get('/api/staff/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // ใช้ staffs_id ตามโครงสร้างไฟล์ของคุณ
        const [rows] = await pool.query("SELECT staffs_id, username, full_name, email FROM staff WHERE staffs_id = ?", [id]);
        if (rows.length > 0) res.json(rows[0]);
        else res.status(404).json({ message: "User not found" });
    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({ message: "Error fetching data" });
    }
});

// อัปเดตข้อมูลส่วนตัวเจ้าหน้าที่ (Staff)
router.put('/api/staff/update-profile/:id', async (req, res) => {
  const { id } = req.params; // staffs_id
  const { password, email, full_name } = req.body;

  try {
    let sql = `UPDATE staff SET email = ?, full_name = ?`;
    let params = [email, full_name];

    if (password && password.trim() !== "") {
      sql += `, password_hash = ?`; // ใน Login ใช้ชื่อฟิลด์ password_hash
      params.push(password);
    }

    sql += ` WHERE staffs_id = ?`;
    params.push(id);

    await pool.query(sql, params);
    res.json({ message: 'อัปเดตข้อมูลส่วนตัวสำเร็จ' });
  } catch (error) {
    console.error('Error updating staff profile:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
  }
});

module.exports = router;
