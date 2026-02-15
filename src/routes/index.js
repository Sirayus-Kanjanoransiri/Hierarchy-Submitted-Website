const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
// const pool = require('./db.js'); // เก็บไว้ใช้ถ้ามีการ query ในไฟล์นี้
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- 1. Import ไฟล์ Route ต่างๆ ---
const adminRoutes = require('./admin.js');
const staffRoutes = require('./staff.js');
const approverRoutes = require('./approver.js');
const studentRoutes = require('./student.js');
const authRoutes = require('./auth.js');

// --- 2. เรียกใช้งาน Route ---
app.use('/admin', adminRoutes);
app.use('/staff', staffRoutes);
app.use('/approver', approverRoutes);  // Mount at root to match /api/approver/* paths
app.use('/student', studentRoutes);
app.use('/auth', authRoutes);

// --- 3. Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
