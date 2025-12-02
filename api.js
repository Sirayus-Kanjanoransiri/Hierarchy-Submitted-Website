const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/main', (req, res) => {
  res.send('การเชื่อมต่อ API สำเร็จ');
});

app.post('/login', async (req, res) => {
  const { std_id, std_password, staffs_id, staff_password } = req.body;

  try {
    // ----- เช็คข้อมูล Student -----
    // บล็อกนี้จะถูกประมวลผล เพราะ std_id และ std_password มีค่าจาก Frontend
    if (std_id && std_password) {
      const [student] = await pool.query(
        // เลือกเฉพาะ std_id และ std_name เท่านั้นเพื่อไม่ให้เปิดเผยข้อมูลที่ไม่จำเป็น
        "SELECT std_id, std_name FROM students WHERE std_id = ? AND std_password = ?",
        [std_id, std_password]
      );

      if (student.length > 0) {
        const { std_name } = student[0];
        return res.json({
          message: "เข้าสู่ระบบสำเร็จ (Student)",
          role: "student",
          user: { std_id, std_name }
        });
      }
    }

    // ----- เช็คข้อมูล Staff (Admin) -----
    // บล็อกนี้จะถูกประมวลผลต่อ (ถ้า Student Check ไม่สำเร็จ)
    // staffs_id และ staff_password จะมีค่าเดียวกันกับที่ใช้เช็ค Student
    if (staffs_id && staff_password) {
      const [admin] = await pool.query(
        // เลือก staffs_id และ staff_name เท่านั้น (สมมติว่ามีคอลัมน์ staff_name)
        "SELECT staffs_id, staff_name FROM staffs WHERE staffs_id = ? AND staff_password = ?",
        [staffs_id, staff_password]
      );

      if (admin.length > 0) {
        // *** แก้ไขจุดนี้: ดึง staff_name แทน staff_password และไม่ส่งรหัสผ่านกลับไป ***
        const { staff_name } = admin[0];
        return res.json({
          message: "เข้าสู่ระบบสำเร็จ (Admin)",
          role: "staff",
          user: { staffs_id, staff_name } // ส่ง staff_name แทน
        });
      }
    }

    // ----- ถ้าไม่ตรงทั้ง student และ admin -----
    return res.status(401).json({
      message: "รหัสประจำตัวหรือรหัสผ่านไม่ถูกต้อง"
    });

  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
  }
});


app.post('/register', async (req, res) => {
  const {
    std_id, std_password, std_prefix, std_name, std_faculty, std_department, std_address_no, std_address_moo, std_address_soi,
    std_address_street, std_address_tumbol, std_address_amphoe, std_province, std_postcode, std_tel, std_facebook, std_email, std_STATUS,
    program_id
  } = req.body;
  console.log('Received registration data:', req.body); // Debugging log

  // Validate required fields
  if (!std_id || !std_password || !std_name || !std_faculty || !std_department || !std_email) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  try {
    await pool.query(
      'INSERT INTO students (std_id, std_password, std_prefix, std_name, std_faculty, std_department, std_address_no, std_address_moo, std_address_soi, std_address_street, std_address_tumbol, std_address_amphoe, std_province, std_postcode, std_tel, std_facebook, std_email, std_STATUS, program_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [std_id, std_password, std_prefix, std_name, std_faculty, std_department, std_address_no, std_address_moo, std_address_soi,
        std_address_street, std_address_tumbol, std_address_amphoe, std_province, std_postcode, std_tel, std_facebook, std_email, 'Pending',
        program_id]
    );
    res.json({ message: 'ลงทะเบียนสำเร็จ' });
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// API สำหรับดึงข้อมูลนักเรียนพร้อมที่ปรึกษา
app.get('/user/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        s.*, 
        a.approver_prefix, 
        a.approver_name,
        d.department_name,
        f.faculty_name,
        p.program_name
      FROM 
        students s 
      JOIN 
        approvers a ON s.advisor = a.approver_id
      JOIN
        departments d ON s.std_department = d.department_id  
      JOIN
        faculty f ON d.faculty_id = f.faculty_id
      JOIN
        program_of_study p ON s.program_id = p.program_id
      WHERE 
        s.std_id = ?
    `;

    const [rows] = await pool.query(query, [id]);

    if (rows.length > 0) {
      // API จะส่งข้อมูลของนักเรียนทั้งหมด พร้อมด้วย approver_prefix และ approvers_name
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// --- API สำหรับดึงนักศึกษาที่รอดำเนินการ (Pending) ---
app.get('/api/students/pending', async (req, res) => {
  try {
    const query = `
      SELECT 
        s.std_id, 
        s.std_prefix, 
        s.std_name, 
        s.std_email,
        s.std_tel,
        d.department_name,
        f.faculty_name
      FROM 
        students s
      LEFT JOIN 
        departments d ON s.std_department = d.department_id
      LEFT JOIN
        faculty f ON s.std_faculty = f.faculty_id
      WHERE 
        s.std_STATUS = 'Pending'
    `;
    const [pendingStudents] = await pool.query(query);
    res.json(pendingStudents);
  } catch (error) {
    console.error("DB Error fetching pending students:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลนักศึกษาที่รอดำเนินการ" });
  }
});

// --- API สำหรับอนุมัตินักศึกษา (เปลี่ยนสถานะเป็น Approved) ---
app.put('/api/student/approve/:std_id', async (req, res) => {
  const { std_id } = req.params;
  try {
    const [result] = await pool.query(
      "UPDATE students SET std_STATUS = 'Approved' WHERE std_id = ? AND std_STATUS = 'Pending'",
      [std_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ไม่พบนักศึกษาที่รอดำเนินการ หรือนักศึกษาได้รับการอนุมัติไปแล้ว" });
    }

    res.json({ message: `อนุมัตินักศึกษา ID ${std_id} เรียบร้อยแล้ว` });
  } catch (error) {
    console.error("DB Error approving student:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการอนุมัติ" });
  }
});



const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});