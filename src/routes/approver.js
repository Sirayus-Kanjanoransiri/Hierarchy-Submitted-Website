// Approver routes module
const express = require('express');
const router = express.Router();
const pool = require('./db.js');

// 1. ดึงรายการคำร้องที่รออนุมัติ (อัปเกรดให้ดึงข้อมูลบิลและสลิปด้วย)
router.get('/api/tasks', async (req, res) => {
  const { approver_id } = req.query;
  if (!approver_id) return res.status(400).json({ error: 'missing approver_id' });

  try {
    const sql = `
      SELECT 
        aps.id as step_id,
        aps.step_order, 
        s.id as submission_id,
        s.student_id, /* ดึง student_id มาด้วยเพื่อใช้ออกบิล */
        s.submitted_at,
        s.form_id,
        s.form_data,
        st.full_name as student_name,
        d.department_name,
        r.role_name as role_at_step,
        /* ข้อมูลจากการเงิน */
        p.id as payment_id,
        p.amount_due,
        p.payment_status,
        p.receipt_image_path
      FROM approval_steps aps
      JOIN submissions s ON aps.submission_id = s.id
      JOIN students st ON s.student_id = st.id
      JOIN departments d ON st.department_id = d.id
      LEFT JOIN roles r ON aps.role_id = r.id
      /* เชื่อมตารางจ่ายเงิน เพื่อเช็คว่ามีบิลหรือสลิปส่งมาหรือยัง */
      LEFT JOIN student_payments p ON p.submission_id = s.id 
      WHERE aps.assigned_approver_id = ?
        AND aps.status = 'PENDING'
        AND NOT EXISTS (
          SELECT 1 FROM approval_steps prev
          WHERE prev.submission_id = aps.submission_id
            AND prev.step_order < aps.step_order
            AND prev.status != 'APPROVED' 
        )
      ORDER BY s.submitted_at ASC
    `;
    const [rows] = await pool.query(sql, [approver_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. API รวมสำหรับ Approve / Reject / Revision (เหมือนเดิม)
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
// ภาคเสริมพิเศษ: ระบบการเงินสำหรับเจ้าหน้าที่ (ออกบิล & ตรวจสลิป)
// ========================================================

// 3. API สำหรับ "ออกบิลเรียกเก็บเงิน" (Automated Billing)
router.post('/api/approver/issue-bill', async (req, res) => {
    const { submission_id, student_id, days_late } = req.body;
  
    if (!days_late || isNaN(days_late) || days_late <= 0) {
      return res.status(400).json({ error: 'กรุณาระบุจำนวนวันล่าช้าให้ถูกต้อง' });
    }
  
    // สูตรคำนวณ: วันละ 50 บาท (สูงสุด 500)
    let lateFee = parseInt(days_late) * 50;
    if (lateFee > 500) lateFee = 500; 
  
    try {
      // เช็คก่อนว่าเคยออกบิลไปหรือยัง
      const [existing] = await pool.query('SELECT id FROM student_payments WHERE submission_id = ?', [submission_id]);
      if (existing.length > 0) {
        return res.status(400).json({ error: 'คำร้องนี้ถูกออกบิลไปแล้ว' });
      }
  
      await pool.query(
        `INSERT INTO student_payments (student_id, submission_id, description, amount_due) 
         VALUES (?, ?, ?, ?)`,
        [student_id, submission_id, 'ค่าปรับลงทะเบียนเรียนล่าช้า', lateFee]
      );
  
      res.json({ message: 'ออกบิลเรียกเก็บเงินสำเร็จ!', amount: lateFee });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างบิล' });
    }
});

// 4. API สำหรับ "ตรวจสอบสลิปและปิดจ็อบ"
router.post('/api/approver/verify-payment', async (req, res) => {
    const { payment_id, step_id, approver_id } = req.body;
  
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
  
      // กดยืนยันปุ๊บ ปรับให้ยอดที่จ่าย (amount_paid) เท่ากับ ยอดที่ต้องจ่าย (amount_due) ทันที (สถานะจะเปลี่ยนเป็น PAID อัตโนมัติใน DB)
      await conn.query(
        `UPDATE student_payments SET amount_paid = amount_due WHERE id = ?`,
        [payment_id]
      );
  
      // อัปเดตให้สเต็ปการอนุมัติผ่าน
      await conn.query(
        `UPDATE approval_steps SET status = 'APPROVED', updated_at = NOW() WHERE id = ?`,
        [step_id]
      );
  
      // หา submission_id เพื่อไปอัปเดตสถานะใหญ่
      const [[step]] = await conn.query(`SELECT submission_id FROM approval_steps WHERE id = ?`, [step_id]);
  
      await conn.query(
        `INSERT INTO submission_action_logs (submission_id, approver_id, action, note) 
         VALUES (?, ?, 'APPROVED', 'ตรวจสอบหลักฐานการชำระเงินเรียบร้อยแล้ว')`,
        [step.submission_id, approver_id]
      );
  
      await conn.query(
        `UPDATE submissions SET submission_status = 'APPROVED' WHERE id = ?`,
        [step.submission_id]
      );
  
      await conn.commit();
      res.json({ message: 'ตรวจสอบสลิปและอนุมัติคำร้องเสร็จสมบูรณ์' });
    } catch (err) {
      await conn.rollback();
      console.error(err);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบสลิป' });
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

module.exports = router;