const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const pool = require('./db');
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
//          LOGIN ROUTE
//   ตรวจสอบเข้าสู่ระบบ Student / Staff
// ============================
app.post('/login', async (req, res) => {
  const { std_id, std_password, staffs_id, staff_password, student_id, password, username } = req.body;

  try {
    // Normalize input fields
    const studentID = student_id || std_id;
    const studentPassword = password || std_password;
    const staffUsername = username;
    const staffPassword = staff_password;

    // ---- CHECK STUDENT LOGIN ----
    if (studentID && studentPassword) {
      const [student] = await pool.query(
        "SELECT student_id, full_name FROM students WHERE student_id = ? AND password = ?",
        [studentID, studentPassword]
      );

      if (student.length > 0) {
        const { student_id: studentIdFromDB, full_name } = student[0];

        return res.json({
          message: "เข้าสู่ระบบสำเร็จ (Student)",
          role: "student",
          user: { student_id: studentIdFromDB, full_name }
        });
      }
    }

    // ---- CHECK STAFF LOGIN(แก้ไขส่วนนี้) ----
    if (staffUsername && staffPassword) {
      const [staffResult] = await pool.query(
        "SELECT staff_id, username, full_name, email FROM staff WHERE username = ? AND password_hash = ?",
        [staffUsername, staffPassword]
      );

      if (staffResult.length > 0) {
        const { staff_id, username: usernameFromDB, full_name, email } = staffResult[0];

        // Update last_login
        await pool.query(
          "UPDATE staff SET last_login = NOW() WHERE staff_id = ?",
          [staff_id]
        );

        return res.json({
          message: "เข้าสู่ระบบสำเร็จ (Staff)",
          role: "staff",
          user: { staff_id, username: usernameFromDB, full_name, email }
        });
      }
    }

    // ---- LOGIN FAILED ----
    return res.status(401).json({
      message: "รหัสหรือข้อมูลการเข้าสู่ระบบไม่ถูกต้อง"
    });

  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
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
    console.error('DB Error:', error);
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
    console.error('DB Error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});
// ============================
//   SENDING SUBMISSION FORM DATA
// ============================
app.post('/submissions', async (req, res) => {
  const { student_id, form_id, form_data } = req.body;

  if (!student_id || !form_id || !form_data) {
    return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO submissions (student_id, form_id, form_data) VALUES (?, ?, ?)',
      [student_id, form_id, JSON.stringify(form_data)]
    );

    res.json({ message: 'Submission saved', submission_id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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
    console.error("DB Error fetching pending students:", error);
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
      "UPDATE students SET status = '0' WHERE student_id = ? AND status = '1'",
      [student_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ไม่พบนักศึกษาที่รอดำเนินการ หรือนักศึกษาได้รับการอนุมัติไปแล้ว" });
    }

    res.json({ message: `อนุมัตินักศึกษา ID ${student_id} เรียบร้อยแล้ว` });
  } catch (error) {
    console.error("DB Error approving student:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการอนุมัติ" });
  }
});

// ============================
//            SERVER
// ============================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});