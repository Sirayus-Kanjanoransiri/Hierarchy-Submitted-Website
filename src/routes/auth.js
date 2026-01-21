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

module.exports = router;
