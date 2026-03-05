// Approver routes module
const express = require('express');
const router = express.Router();
const pool = require('./db.js');

// 1. ดึงรายการคำร้องที่รออนุมัติ
router.get('/api/tasks', async (req, res) => {
  const { approver_id } = req.query;
  if (!approver_id) return res.status(400).json({ error: 'missing approver_id' });

  try {
    const sql = `
            SELECT 
            aps.id as step_id,
                aps.step_order, 
                s.id as submission_id,
                s.student_id,
                s.submitted_at,
                s.form_id,
                s.form_data,
                f.name as form_name,
                c.name as category_name,
                st.full_name as student_name,
                d.department_name,
                r.role_name as role_at_step,
                p.id as payment_id,
                p.amount_due,
                p.payment_status,
                p.receipt_image_path,
                (SELECT COUNT(*) FROM approval_steps WHERE submission_id = s.id) as total_steps,
                aps.step_order as current_step
            FROM approval_steps aps
            JOIN submissions s ON aps.submission_id = s.id
            JOIN students st ON s.student_id = st.id
            JOIN departments d ON st.department_id = d.id
            /* เชื่อมตารางเพิ่มเพื่อเอาชื่อฟอร์มและประเภท */
            JOIN forms f ON s.form_id = f.id
            JOIN categories c ON f.category_id = c.id
            LEFT JOIN roles r ON aps.role_id = r.id
            LEFT JOIN student_payments p ON p.submission_id = s.id 
            WHERE aps.assigned_approver_id = ?
              AND aps.status = 'PENDING'
              AND NOT EXISTS (
                SELECT 1 FROM approval_steps prev
                WHERE prev.submission_id = aps.submission_id
                  AND prev.step_order < aps.step_order
                  AND prev.status != 'APPROVED' 
              )
            ORDER BY s.submitted_at ASC;
    `;
    const [rows] = await pool.query(sql, [approver_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. API รวมสำหรับ Approve / Reject / Revision 
router.post('/api/approver/process-action', async (req, res) => {
  const { step_id, action, note, approver_id } = req.body;

  const validActions = ['APPROVED', 'REJECTED', 'NEED_REVISION'];
  if (!validActions.includes(action)) return res.status(400).json({ error: 'Invalid action type' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[step]] = await conn.query(
      `SELECT submission_id, assigned_approver_id FROM approval_steps WHERE id = ? AND status = 'PENDING'`,
      [step_id]
    );

    if (!step) throw new Error('ไม่พบรายการนี้ หรือรายการนี้ถูกดำเนินการไปแล้ว');
    if (step.assigned_approver_id != approver_id) {
        throw new Error('คุณไม่มีสิทธิ์ดำเนินการในขั้นตอนนี้');
    }

    await conn.query(
      `UPDATE approval_steps SET status = ?, reject_reason = ?, updated_at = NOW() WHERE id = ?`,
      [action, note || null, step_id]
    );

    await conn.query(
      `INSERT INTO submission_action_logs (submission_id, approver_id, action, note) VALUES (?, ?, ?, ?)`,
      [step.submission_id, approver_id, action, note || null]
    );

    let finalSubmissionStatus = 'IN_PROGRESS';
    if (action === 'REJECTED') {
      finalSubmissionStatus = 'REJECTED';
    } else if (action === 'NEED_REVISION') {
      finalSubmissionStatus = 'NEED_REVISION';
    } else if (action === 'APPROVED') {
      const [[pending]] = await conn.query(
        `SELECT COUNT(*) AS cnt FROM approval_steps WHERE submission_id = ? AND status NOT IN ('APPROVED', 'REJECTED')`,
        [step.submission_id]
      );
      if (pending.cnt === 0) finalSubmissionStatus = 'APPROVED';
    }

    await conn.query(
      `UPDATE submissions SET submission_status = ? WHERE id = ?`,
      [finalSubmissionStatus, step.submission_id]
    );

    await conn.commit();
    res.json({ message: `ดำเนินการ ${action} เรียบร้อยแล้ว`, submission_status: finalSubmissionStatus });

  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// ========================================================
// ส่วนแก้ไข้ข้อมูลส่วนตัว Approver
// ========================================================
router.get('/api/profile/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, approver_prefix, full_name, email, approver_tel FROM approvers WHERE id = ?', [req.params.id]);
    if (rows.length > 0) res.json(rows[0]);
    else res.status(404).json({ message: 'ไม่พบข้อมูล' });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

router.put('/api/profile/:id', async (req, res) => {
  const { approver_prefix, full_name, email, approver_tel, password } = req.body;
  try {
    if (password && password.trim() !== '') {
      await pool.query(
        'UPDATE approvers SET approver_prefix=?, full_name=?, email=?, approver_tel=?, password=? WHERE id=?',
        [approver_prefix, full_name, email, approver_tel, password, req.params.id]
      );
    } else {
      await pool.query(
        'UPDATE approvers SET approver_prefix=?, full_name=?, email=?, approver_tel=? WHERE id=?',
        [approver_prefix, full_name, email, approver_tel, req.params.id]
      );
    }
    res.json({ message: 'อัปเดตข้อมูลสำเร็จ' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// ========================================================
// ส่วนสำหรับระบบการเงินสำหรับเจ้าหน้าที่ (ออกบิล & ตรวจสลิป)
// ========================================================

// 3. API สำหรับ "ตรวจสอบสลิปและส่งต่อ" (ให้ด่าน 7 อนุมัติต่อ)
router.post('/api/approver/verify-payment', async (req, res) => {
    const { payment_id, step_id, approver_id } = req.body;
  
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
  
      // กดยืนยันปุ๊บ ปรับให้ยอดที่จ่ายเท่ากับยอดเต็ม และเปลี่ยนสถานะเป็น PAID
      await conn.query(
        `UPDATE student_payments SET amount_paid = amount_due WHERE id = ?`,
        [payment_id]
      );
  
      // อัปเดตให้สเต็ปของการเงิน (ด่าน 6) ผ่าน
      await conn.query(
        `UPDATE approval_steps SET status = 'APPROVED', updated_at = NOW() WHERE id = ?`,
        [step_id]
      );
  
      // หา submission_id เพื่อไปเช็คด่านต่อไป
      const [[step]] = await conn.query(`SELECT submission_id FROM approval_steps WHERE id = ?`, [step_id]);
  
      await conn.query(
        `INSERT INTO submission_action_logs (submission_id, approver_id, action, note) 
         VALUES (?, ?, 'APPROVED', 'การเงิน: ตรวจสอบหลักฐานการชำระเงินเรียบร้อยแล้ว ส่งต่อให้งานทะเบียน')`,
        [step.submission_id, approver_id]
      );
  
      // 🌟 เช็คว่ามีด่านต่อไป (ด่าน 7) รออยู่ไหม? ถ้ามี ให้คงสถานะคำร้องเป็น IN_PROGRESS
      const [[pending]] = await conn.query(
        `SELECT COUNT(*) AS cnt FROM approval_steps WHERE submission_id = ? AND status NOT IN ('APPROVED', 'REJECTED')`,
        [step.submission_id]
      );
  
      let finalSubmissionStatus = 'IN_PROGRESS';
      if (pending.cnt === 0) finalSubmissionStatus = 'APPROVED'; // ปิดจ็อบจริงๆ ถ้าไม่มีด่านเหลือแล้ว
  
      await conn.query(
        `UPDATE submissions SET submission_status = ? WHERE id = ?`,
        [finalSubmissionStatus, step.submission_id]
      );
  
      await conn.commit();
      res.json({ message: 'ตรวจสอบสลิปเสร็จสมบูรณ์ ส่งคำร้องต่อให้งานทะเบียนแล้ว!' });
    } catch (err) {
      await conn.rollback();
      console.error(err);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบสลิป' });
    } finally {
      conn.release();
    }
});

// 4. API สำหรับออกบิลอัตโนมัติ (แก้ไขบั๊กเชื่อม submission_id)
router.post('/api/approver/auto-issue-bill', async (req, res) => {
  const { submission_id, student_id, amount } = req.body;
  try {
    // 🌟 ใส่ submission_id ลงในตาราง student_payments ด้วย! ตารางจะได้เชื่อมกันติด!
    const [result] = await pool.query(
      `INSERT INTO student_payments (student_id, submission_id, description, amount_due) 
       VALUES (?, ?, ?, ?)`,
      [student_id, submission_id, `ค่าลงทะเบียนเรียนล่าช้า และ ค่าหน่วยกิต (คำร้อง #${submission_id})`, amount]
    );
    res.json({ success: true, payment_id: result.insertId, amount: amount });
  } catch (error) {
    console.error('Auto-issue bill error:', error);
    res.status(500).json({ error: 'Failed to auto-issue bill' });
  }
});

// ==========================================
// API สำหรับดึงการตั้งค่าและบันทึกการตั้งค่า
// ==========================================
router.get('/api/settings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM system_settings');
    const settings = rows.reduce((acc, row) => ({ ...acc, [row.setting_key]: row.setting_value }), {});
    res.json(settings);
  } catch (error) {
    console.error('Fetch settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/api/settings', async (req, res) => {
  const { late_reg_deadline, credit_cost, late_fee_per_day } = req.body;
  try {
    await pool.query('UPDATE system_settings SET setting_value = ? WHERE setting_key = "late_reg_deadline"', [late_reg_deadline]);
    await pool.query('UPDATE system_settings SET setting_value = ? WHERE setting_key = "credit_cost"', [credit_cost]);
    await pool.query('UPDATE system_settings SET setting_value = ? WHERE setting_key = "late_fee_per_day"', [late_fee_per_day]);
    res.json({ success: true });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;