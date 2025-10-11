const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const pool = require('./db'); 
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('การเชื่อมต่อ API สำเร็จ');
});

app.post('/login', async (req, res) => {
  const { identification_number, password } = req.body;
  if (!identification_number || !password) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }
  try {
    const [rows] = await pool.query(
      'SELECT * FROM students WHERE std_id = ? AND std_password = ?',
      [identification_number, password]
    );
    if (rows.length > 0) {
      const { std_name } = rows[0];
      res.json({ message: 'เข้าสู่ระบบสำเร็จ', user: { std_name } });
    } else {
      res.status(401).json({ message: 'รหัสประจำตัวหรือรหัสผ่านไม่ถูกต้อง' });
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