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
  const { std_id, std_password } = req.body;
  if (!std_id || !std_password) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }
  try {
    const [rows] = await pool.query(
      'SELECT * FROM students WHERE std_id = ? AND std_password = ?',
      [std_id, std_password]
    );
    if (rows.length > 0) {
      const { std_name } = rows[0];
      res.json({ message: 'เข้าสู่ระบบสำเร็จ', user: { std_id, std_name } });
    } else {
      res.status(401).json({ message: 'รหัสประจำตัวหรือรหัสผ่านไม่ถูกต้อง' });
    }
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
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



const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});