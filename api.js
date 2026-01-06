const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const pool = require('./db.js');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());



// ============================
//  MAIN TEST ROUTE (API CHECK)
// ============================
app.get('/main', (req, res) => {
  res.send('การเชื่อมต่อ API สำเร็จ');
});

// ============================
//          LOGIN AUTH
// ============================
app.post('/login', async (req, res) => {
  // รับค่าเป็น username/password กลางๆ จาก Frontend
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "กรุณากรอกรหัสประจำตัวและรหัสผ่าน" });
  }

  try {
    // -------------------------------------------------------
    // 1. ตรวจสอบกลุ่ม STUDENT
    // Column: student_id, password
    // -------------------------------------------------------
    const [students] = await pool.query(
      "SELECT id, student_id, full_name, department_id, status FROM students WHERE student_id = ? AND password = ?",
      [username, password]
    );

    if (students.length > 0) {
      // เช็คเพิ่มเติม: ถ้านักศึกษายังไม่อนุมัติ (status = '0' หรือ '2') อาจจะกันไว้ก่อนได้ตาม Business Logic
      // แต่ในที่นี้จะให้เข้าได้ก่อนตามปกติ
      return res.json({ 
        role: "student", 
        user: students[0] 
      });
    }

    // -------------------------------------------------------
    // 2. ตรวจสอบกลุ่ม STAFF (เจ้าหน้าที่/Admin)
    // Column: username, password_hash
    // -------------------------------------------------------
    const [staffs] = await pool.query(
      "SELECT staff_id, username, full_name, role, email FROM staff WHERE username = ? AND password_hash = ?",
      [username, password]
    );

    if (staffs.length > 0) {
      return res.json({ 
        role: "staff", 
        user: staffs[0] 
      });
    }

    // -------------------------------------------------------
    // 3. ตรวจสอบกลุ่ม APPROVER (อาจารย์/ผู้อนุมัติ)
    // Column: username, password, is_active
    // -------------------------------------------------------
    const [approvers] = await pool.query(
      "SELECT id, username, full_name, email, department_id FROM approvers WHERE username = ? AND password = ? AND is_active = 1",
      [username, password]
    );

    if (approvers.length > 0) {
      return res.json({ 
        role: "approver", 
        user: approvers[0] 
      });
    }

    // หากไม่พบข้อมูลในทั้ง 3 ตาราง
    return res.status(401).json({ message: "รหัสประจำตัวหรือรหัสผ่านไม่ถูกต้อง" });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล" });
  }
});

// ============================
//        REGISTER ROUTE
//   ลงทะเบียนนักศึกษาใหม่
// ============================
app.post('/register', async (req, res) => {
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
//     USER INFO WITH ADVISOR
//   ดึงข้อมูลนักศึกษา + ที่ปรึกษา
// ============================
// ============================
//   GET STUDENT BY STUDENT_ID
// ============================
app.get('/user/:student_id', async (req, res) => {
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
app.post('/api/submissions', async (req, res) => {
    const { student_id, form_id, form_data } = req.body;
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        /* 1. ดึง approval flow */
        const [flows] = await conn.query(`
            SELECT step_order, role_id
            FROM form_approval_flow
            WHERE form_id = ?
            ORDER BY step_order ASC
        `, [form_id]);

        if (!flows.length) {
            throw new Error('ไม่พบ approval flow ของแบบฟอร์มนี้');
        }

        /* 2. ดึง advisor ของนักศึกษา */
        const [[student]] = await conn.query(`
            SELECT advisor_id
            FROM students
            WHERE id = ?
        `, [student_id]);

        if (!student) {
            throw new Error('ไม่พบนักศึกษา');
        }

        /* 3. สร้าง submission */
        const [subResult] = await conn.query(`
            INSERT INTO submissions (student_id, form_id, form_data, submission_status)
            VALUES (?, ?, ?, 'PENDING')
        `, [student_id, form_id, JSON.stringify(form_data)]);

        const submissionId = subResult.insertId;

        /* 4. สร้าง approval_steps */
        for (const flow of flows) {
            let assignedApproverId;

            // กรณี อ.ที่ปรึกษา
            if (flow.role_id === 1) {
                if (!student.advisor_id) {
                    throw new Error('นักศึกษายังไม่ได้กำหนดอาจารย์ที่ปรึกษา');
                }
                assignedApproverId = student.advisor_id;
            } 
            // role อื่น ๆ
            else {
                const [rows] = await conn.query(`
                    SELECT a.id
                    FROM approvers a
                    JOIN approver_roles ar ON a.id = ar.approver_id
                    WHERE ar.role_id = ?
                      AND a.is_active = 1
                    ORDER BY a.id ASC
                    LIMIT 1
                `, [flow.role_id]);

                if (!rows.length) {
                    throw new Error(`ไม่พบผู้อนุมัติสำหรับ role_id = ${flow.role_id}`);
                }

                assignedApproverId = rows[0].id;
            }

            await conn.query(`
                INSERT INTO approval_steps
                (submission_id, step_order, role_id, assigned_approver_id, status)
                VALUES (?, ?, ?, ?, 'PENDING')
            `, [
                submissionId,
                flow.step_order,
                flow.role_id,
                assignedApproverId
            ]);
        }

        await conn.commit();
        res.json({ message: 'ส่งคำร้องสำเร็จ' });

    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// ============================
//   GET PENDING STUDENT LIST
// ============================
app.get('/api/students/pending', async (req, res) => {
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
app.put('/api/student/approve/:student_id', async (req, res) => {
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
<<<<<<< HEAD
    console.error("pool Error approving student:", error);
=======
    console.error("DB Error:", error);
>>>>>>> f2c43199c25e64d5bec79ab7a4d50ce638e9b68d
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการอนุมัติ" });
  }
});

// ============================
//   STAFF MANAGEMENT (CRUD) - Updated for sql.sql
// ============================

// 1. ดึงข้อมูลเจ้าหน้าที่ทั้งหมด
app.get('/api/staff-management', async (req, res) => {
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
app.post('/api/staff-management', async (req, res) => {
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
app.put('/api/staff-management/:id', async (req, res) => {
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
app.delete('/api/staff-management/:id', async (req, res) => {
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
//   APPROVER MANAGEMENT (CRUD)
// ============================

// 1. ดึงข้อมูล Approvers ทั้งหมด (พร้อมชื่อสาขา)
app.get('/api/approvers', async (req, res) => {
  try {
    const sql = `
      SELECT a.*, d.department_name 
      FROM approvers a
      LEFT JOIN departments d ON a.department_id = d.id
    `;
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching approvers:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้อนุมัติ' });
  }
});

// 2. เพิ่ม Approver ใหม่
app.post('/api/approvers', async (req, res) => {
  const { 
    approver_prefix, full_name, username, password, 
    email, department_id, approver_tel 
  } = req.body;

  if (!full_name || !username || !password || !email) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลสำคัญให้ครบถ้วน' });
  }

  try {
    await pool.query(
      `INSERT INTO approvers 
      (approver_prefix, full_name, username, password, email, department_id, approver_tel, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [approver_prefix, full_name, username, password, email, department_id || null, approver_tel]
    );
    res.json({ message: 'เพิ่มผู้อนุมัติสำเร็จ' });
  } catch (error) {
    console.error('Error adding approver:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email นี้มีอยู่ในระบบแล้ว' });
    }
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล' });
  }
});

// 3. แก้ไขข้อมูล Approver
app.put('/api/approvers/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    approver_prefix, full_name, username, password, 
    email, department_id, approver_tel, is_active 
  } = req.body;

  try {
    // เช็คว่ามีการเปลี่ยนรหัสผ่านหรือไม่
    let sql = '';
    let params = [];

    if (password && password.trim() !== "") {
      sql = `UPDATE approvers SET approver_prefix=?, full_name=?, username=?, password=?, email=?, department_id=?, approver_tel=?, is_active=? WHERE id=?`;
      params = [approver_prefix, full_name, username, password, email, department_id, approver_tel, is_active, id];
    } else {
      sql = `UPDATE approvers SET approver_prefix=?, full_name=?, username=?, email=?, department_id=?, approver_tel=?, is_active=? WHERE id=?`;
      params = [approver_prefix, full_name, username, email, department_id, approver_tel, is_active, id];
    }

    await pool.query(sql, params);
    res.json({ message: 'แก้ไขข้อมูลสำเร็จ' });
  } catch (error) {
    console.error('Error updating approver:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล' });
  }
});

// 4. ลบ Approver
app.delete('/api/approvers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM approvers WHERE id = ?', [id]);
    res.json({ message: 'ลบข้อมูลสำเร็จ' });
  } catch (error) {
    console.error('Error deleting approver:', error);
    // กรณีติด Foreign Key (เช่น เป็นที่ปรึกษาของนักศึกษาอยู่) อาจลบไม่ได้
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: 'ไม่สามารถลบได้ เนื่องจากบัญชีนี้ถูกใช้งานในระบบ (เช่น เป็นที่ปรึกษา)' });
    }
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
  }
});

// ============================
//   DEPARTMENT MANAGEMENT (CRUD)
// ============================

// 1. ดึงข้อมูล Departments ทั้งหมด (พร้อมชื่อคณะ)
app.get('/api/departments', async (req, res) => {
  try {
    const sql = `
      SELECT d.*, f.faculty_name 
      FROM departments d
      LEFT JOIN faculty f ON d.faculty_id = f.id
      ORDER BY d.id ASC
    `;
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error' });
  }
});

// 2. เพิ่ม Department ใหม่
app.post('/api/departments', async (req, res) => {
  const { department_name, faculty_id } = req.body;

  if (!department_name || !faculty_id) {
    return res.status(400).json({ message: 'กรุณากรอกชื่อสาขาและเลือกคณะ' });
  }

  try {
    await pool.query(
      'INSERT INTO departments (department_name, faculty_id) VALUES (?, ?)',
      [department_name, faculty_id]
    );
    res.json({ message: 'เพิ่มสาขาวิชาสำเร็จ' });
  } catch (error) {
    console.error('Error adding department:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล' });
  }
});

// 3. แก้ไข Department
app.put('/api/departments/:id', async (req, res) => {
  const { id } = req.params;
  const { department_name, faculty_id } = req.body;

  try {
    await pool.query(
      'UPDATE departments SET department_name = ?, faculty_id = ? WHERE id = ?',
      [department_name, faculty_id, id]
    );
    res.json({ message: 'แก้ไขข้อมูลสำเร็จ' });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล' });
  }
});

// 4. ลบ Department
app.delete('/api/departments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM departments WHERE id = ?', [id]);
    res.json({ message: 'ลบข้อมูลสำเร็จ' });
  } catch (error) {
    console.error('Error deleting department:', error);
    // กรณีสาขาถูกใช้งานอยู่ (เช่น มีนักศึกษาสังกัดอยู่) จะลบไม่ได้
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: 'ไม่สามารถลบได้ เนื่องจากมีข้อมูล (เช่น นักศึกษา/อาจารย์) เชื่อมโยงกับสาขานี้อยู่' });
    }
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
  }
});

// ============================
//   FACULTY MANAGEMENT (CRUD)
// ============================

// 1. ดึงข้อมูล Faculty ทั้งหมด (มีอยู่แล้วก็ข้ามได้ หรือเช็คให้ชัวร์)
app.get('/api/faculties', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM faculty ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching faculties:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคณะ' });
  }
});

// 2. เพิ่ม Faculty ใหม่
app.post('/api/faculties', async (req, res) => {
  const { faculty_name } = req.body;

  if (!faculty_name) {
    return res.status(400).json({ message: 'กรุณากรอกชื่อคณะ' });
  }

  try {
    await pool.query(
      'INSERT INTO faculty (faculty_name) VALUES (?)',
      [faculty_name]
    );
    res.json({ message: 'เพิ่มคณะสำเร็จ' });
  } catch (error) {
    console.error('Error adding faculty:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล' });
  }
});

// 3. แก้ไข Faculty
app.put('/api/faculties/:id', async (req, res) => {
  const { id } = req.params;
  const { faculty_name } = req.body;

  try {
    await pool.query(
      'UPDATE faculty SET faculty_name = ? WHERE id = ?',
      [faculty_name, id]
    );
    res.json({ message: 'แก้ไขข้อมูลสำเร็จ' });
  } catch (error) {
    console.error('Error updating faculty:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล' });
  }
});

// 4. ลบ Faculty
app.delete('/api/faculties/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM faculty WHERE id = ?', [id]);
    res.json({ message: 'ลบข้อมูลสำเร็จ' });
  } catch (error) {
    console.error('Error deleting faculty:', error);
    // กรณีคณะถูกใช้งานอยู่ (มีสาขาวิชาสังกัดอยู่) จะลบไม่ได้ (ติด FK)
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: 'ไม่สามารถลบได้ เนื่องจากมีสาขาวิชาสังกัดคณะนี้อยู่' });
    }
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
  }
});

// ============================
//   ROLE MANAGEMENT (CRUD)
// ============================

// 1. ดึงข้อมูล Roles ทั้งหมด
app.get('/api/roles', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM roles ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลตำแหน่ง' });
  }
});

// 2. เพิ่ม Role ใหม่
app.post('/api/roles', async (req, res) => {
  const { role_name } = req.body;

  if (!role_name) {
    return res.status(400).json({ message: 'กรุณากรอกชื่อตำแหน่ง' });
  }

  try {
    await pool.query(
      'INSERT INTO roles (role_name) VALUES (?)',
      [role_name]
    );
    res.json({ message: 'เพิ่มตำแหน่งสำเร็จ' });
  } catch (error) {
    console.error('Error adding role:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล' });
  }
});

// 3. แก้ไข Role
app.put('/api/roles/:id', async (req, res) => {
  const { id } = req.params;
  const { role_name } = req.body;

  try {
    await pool.query(
      'UPDATE roles SET role_name = ? WHERE id = ?',
      [role_name, id]
    );
    res.json({ message: 'แก้ไขข้อมูลสำเร็จ' });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล' });
  }
});

// 4. ลบ Role
app.delete('/api/roles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM roles WHERE id = ?', [id]);
    res.json({ message: 'ลบข้อมูลสำเร็จ' });
  } catch (error) {
    console.error('Error deleting role:', error);
    // กรณี Role ถูกใช้งานอยู่ (เช่น ผูกกับ Approver) จะลบไม่ได้
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: 'ไม่สามารถลบได้ เนื่องจากตำแหน่งนี้ถูกใช้งานอยู่' });
    }
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
  }
});

// ============================
//   STUDENT MANAGEMENT (CRUD)
// ============================

// 1. ดึงข้อมูลนักศึกษาทั้งหมด (JOIN สาขา และ ที่ปรึกษา)
app.get('/api/students-list', async (req, res) => {
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
app.post('/api/students', async (req, res) => {
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
app.put('/api/students/:id', async (req, res) => {
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
app.delete('/api/students/:id', async (req, res) => {
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
app.get('/api/students/search', async (req, res) => {
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

// ดึงรายการคำร้องที่รอการอนุมัติ (เฉพาะลำดับที่ถึงคิวของผู้อนุมัติคนนั้น)
app.get('/api/submissions', (req, res) => {
    const { approver_id } = req.query;
    if (!approver_id) return res.status(400).send('Approver ID is required');

    const sql = `
        SELECT 
            s.id, 
            st.full_name AS student_name, 
            ft.form_name, 
            s.submitted_at, 
            s.submission_status, 
            s.form_data
        FROM submissions s
        JOIN students st ON s.student_id = st.id
        JOIN form_templates ft ON s.form_id = ft.id
        JOIN approval_steps aps ON s.id = aps.submission_id
        WHERE aps.assigned_approver_id = ? 
          AND aps.status = 'PENDING'
          AND (
              aps.step_order = 1 
              OR EXISTS (
                  SELECT 1 FROM approval_steps prev 
                  WHERE prev.submission_id = s.id 
                    AND prev.step_order = aps.step_order - 1 
                    AND prev.status = 'APPROVED'
              )
          );
    `;

    pool.query(sql, [approver_id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});
app.put('/api/submissions/:id/status', (req, res) => {
    const submissionId = req.params.id;
    const { status, comment, approver_id } = req.body; // รับ approver_id มาด้วย

    // 1. อัปเดต Step ปัจจุบันของผู้อนุมัติคนนี้
    const updateStepSql = `
        UPDATE approval_steps 
        SET status = ?, reject_reason = ?, updated_at = NOW() 
        WHERE submission_id = ? AND assigned_approver_id = ? AND status = 'PENDING'
    `;

    pool.query(updateStepSql, [status, comment, submissionId, approver_id], (err, result) => {
        if (err) return res.status(500).send(err);

        if (status === 'REJECTED') {
            // ถ้าปฏิเสธ ให้เปลี่ยนสถานะหลักของ Submission เป็น REJECTED ทันที
            pool.query('UPDATE submissions SET submission_status = "REJECTED" WHERE id = ?', [submissionId]);
        } else if (status === 'APPROVED') {
            // ตรวจสอบว่าเป็น Step สุดท้ายหรือไม่
            const checkLastStepSql = `
                SELECT 1 FROM approval_steps 
                WHERE submission_id = ? AND status = 'PENDING'
            `;
            pool.query(checkLastStepSql, [submissionId], (err, pendingSteps) => {
                if (pendingSteps.length === 0) {
                    // ถ้าไม่มี Step ค้างแล้ว ให้ Submission เป็น APPROVED
                    pool.query('UPDATE submissions SET submission_status = "APPROVED" WHERE id = ?', [submissionId]);
                } else {
                    // ถ้ายังมี Step ถัดไป ให้สถานะหลักเป็น IN_PROGRESS
                    pool.query('UPDATE submissions SET submission_status = "IN_PROGRESS" WHERE id = ?', [submissionId]);
                }
            });
        }
        res.send({ message: 'Status updated successfully' });
    });
});

// ============================
//   UPDATE PROFILE (PERSONAL)
// ============================

// 1. อัปเดตข้อมูลส่วนตัวนักศึกษา
app.put('/api/student/update-profile/:id', async (req, res) => {
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

// 2. ดึงข้อมูล Staff รายคน (เพื่อนำไปแสดงในฟอร์มแก้ไข)
app.get('/api/staff/:id', async (req, res) => {
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

// 3. อัปเดตข้อมูลส่วนตัวเจ้าหน้าที่ (Staff)
app.put('/api/staff/update-profile/:id', async (req, res) => {
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

// ============================
//            SERVER
// ============================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});