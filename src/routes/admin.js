// Admin routes module
const express = require('express');
const router = express.Router();
const pool = require('./db.js');

// ============================
//   STAFF MANAGEMENT (CRUD) - Updated for sql.sql
// ============================

// 1. ดึงข้อมูลเจ้าหน้าที่ทั้งหมด
router.get('/api/staff-management', async (req, res) => {
  try {
    // เลือกข้อมูลจากตาราง staff
    const [rows] = await pool.query('SELECT staff_id, username, full_name, email, role FROM staff'); 
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

  // ตรวจสอบค่าว่าง (staff_id เป็น Auto Increment ไม่ต้องรับค่า)
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
            'UPDATE staff SET username=?, password_hash=?, full_name=?, email=?, role=? WHERE staff_id=?',
            [username, password, full_name, email, role, id]
        );
    } else {
        // กรณีไม่แก้รหัสผ่าน (ใช้รหัสเดิม)
        await pool.query(
            'UPDATE staff SET username=?, full_name=?, email=?, role=? WHERE staff_id=?',
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
    await pool.query('DELETE FROM staff WHERE staff_id = ?', [id]);
    res.json({ message: 'ลบข้อมูลสำเร็จ' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
  }
});

// ============================
//   APPROVER MANAGEMENT (CRUD)
// ============================

// 1. ดึงข้อมูล Approvers ทั้งหมด (พร้อมชื่อสาขา และบทบาท Role)
router.get('/api/approvers', async (req, res) => {
  try {
    const sql = `
      SELECT a.*, d.department_name,
        (SELECT GROUP_CONCAT(role_id) FROM approver_roles WHERE approver_id = a.id) as role_ids_str,
        (SELECT GROUP_CONCAT(r.role_name SEPARATOR ', ') FROM approver_roles ar JOIN roles r ON ar.role_id = r.id WHERE ar.approver_id = a.id) as role_names
      FROM approvers a
      LEFT JOIN departments d ON a.department_id = d.id
    `;
    const [rows] = await pool.query(sql);
    
    // แปลง role_ids_str ('1,2,4') ให้กลายเป็น Array [1, 2, 4] เพื่อส่งให้ Frontend
    const formattedRows = rows.map(row => ({
      ...row,
      role_ids: row.role_ids_str ? row.role_ids_str.split(',').map(Number) : []
    }));
    
    res.json(formattedRows);
  } catch (error) {
    console.error('Error fetching approvers:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้อนุมัติ' });
  }
});

// 2. เพิ่ม Approver ใหม่ (พร้อมใส่ Role)
router.post('/api/approvers', async (req, res) => {
  const { 
    approver_prefix, full_name, username, password, 
    email, department_id, approver_tel, role_ids
  } = req.body;

  if (!full_name || !username || !password || !email) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลสำคัญให้ครบถ้วน' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 1. สร้าง Approver
    const [result] = await conn.query(
      `INSERT INTO approvers 
      (approver_prefix, full_name, username, password, email, department_id, approver_tel, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [approver_prefix, full_name, username, password, email, department_id || null, approver_tel]
    );
    
    const newApproverId = result.insertId;

    // 2. ผูก Role เข้ากับตาราง approver_roles
    if (role_ids && role_ids.length > 0) {
      for (const roleId of role_ids) {
        await conn.query('INSERT INTO approver_roles (approver_id, role_id) VALUES (?, ?)', [newApproverId, roleId]);
      }
    }

    await conn.commit();
    res.json({ message: 'เพิ่มผู้อนุมัติและกำหนดตำแหน่งสำเร็จ' });
  } catch (error) {
    if (conn) await conn.rollback();
    console.error('Error adding approver:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email นี้มีอยู่ในระบบแล้ว' });
    }
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล' });
  } finally {
    if (conn) conn.release();
  }
});

// 3. แก้ไขข้อมูล Approver (และแก้ไข Role)
router.put('/api/approvers/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    approver_prefix, full_name, username, password, 
    email, department_id, approver_tel, is_active, role_ids 
  } = req.body;

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 1. อัปเดตข้อมูลส่วนตัว
    let sql = '';
    let params = [];

    if (password && password.trim() !== "") {
      sql = `UPDATE approvers SET approver_prefix=?, full_name=?, username=?, password=?, email=?, department_id=?, approver_tel=?, is_active=? WHERE id=?`;
      params = [approver_prefix, full_name, username, password, email, department_id, approver_tel, is_active, id];
    } else {
      sql = `UPDATE approvers SET approver_prefix=?, full_name=?, username=?, email=?, department_id=?, approver_tel=?, is_active=? WHERE id=?`;
      params = [approver_prefix, full_name, username, email, department_id, approver_tel, is_active, id];
    }
    await conn.query(sql, params);

    // 2. ล้าง Role เก่าทิ้ง และใส่ Role ใหม่เข้าไปแทน
    await conn.query('DELETE FROM approver_roles WHERE approver_id = ?', [id]);
    
    if (role_ids && role_ids.length > 0) {
      for (const roleId of role_ids) {
        await conn.query('INSERT INTO approver_roles (approver_id, role_id) VALUES (?, ?)', [id, roleId]);
      }
    }

    await conn.commit();
    res.json({ message: 'แก้ไขข้อมูลสำเร็จ' });
  } catch (error) {
    if (conn) await conn.rollback();
    console.error('Error updating approver:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล' });
  } finally {
    if (conn) conn.release();
  }
});

// 4. ลบ Approver
router.delete('/api/approvers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // ลบความสัมพันธ์ใน Role ก่อนกันบั๊ก
    await pool.query('DELETE FROM approver_roles WHERE approver_id = ?', [id]);
    await pool.query('DELETE FROM approvers WHERE id = ?', [id]);
    res.json({ message: 'ลบข้อมูลสำเร็จ' });
  } catch (error) {
    console.error('Error deleting approver:', error);
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
router.get('/api/departments', async (req, res) => {
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
router.post('/api/departments', async (req, res) => {
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
router.put('/api/departments/:id', async (req, res) => {
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
router.delete('/api/departments/:id', async (req, res) => {
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
router.get('/api/faculties', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM faculty ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching faculties:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคณะ' });
  }
});

// 2. เพิ่ม Faculty ใหม่
router.post('/api/faculties', async (req, res) => {
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
router.put('/api/faculties/:id', async (req, res) => {
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
router.delete('/api/faculties/:id', async (req, res) => {
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
router.get('/api/roles', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM roles ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลตำแหน่ง' });
  }
});

// 2. เพิ่ม Role ใหม่
router.post('/api/roles', async (req, res) => {
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
router.put('/api/roles/:id', async (req, res) => {
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
router.delete('/api/roles/:id', async (req, res) => {
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

module.exports = router;
