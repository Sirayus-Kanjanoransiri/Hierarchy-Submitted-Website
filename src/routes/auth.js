// Auth routes module
const express = require('express');
const router = express.Router();
const pool = require('./db.js');

// ============================
//  MAIN TEST ROUTE (API CHECK)
// ============================
router.get('/main', (req, res) => {
  res.send('การเชื่อมต่อ API สำเร็จ');
});

// ============================
//          LOGIN AUTH
// ============================
router.post('/login', async (req, res) => {
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
      const student = students[0];
      
      // เช็คสถานะการอนุมัติก่อนให้เข้าสู่ระบบ
      if (student.status === '0') {
        return res.status(403).json({ message: "บัญชีของคุณอยู่ระหว่างรอการพิจารณาจากเจ้าหน้าที่ กรุณารอการอนุมัติ" });
      } else if (student.status === '2') {
        return res.status(403).json({ message: "ขออภัย บัญชีของคุณถูกปฏิเสธการอนุมัติ กรุณาติดต่อเจ้าหน้าที่" });
      }

      // ถ้า status เป็น '1' ถึงจะยอมให้ล็อคอินสำเร็จ
      return res.json({ 
        role: "student", 
        user: student 
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
    // -------------------------------------------------------
    const [approvers] = await pool.query(
      `SELECT a.id, a.username, a.full_name, a.email, a.department_id, ar.role_id 
       FROM approvers a
       LEFT JOIN approver_roles ar ON a.id = ar.approver_id
       WHERE a.username = ? AND a.password = ? AND a.is_active = 1`,
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

module.exports = router;
