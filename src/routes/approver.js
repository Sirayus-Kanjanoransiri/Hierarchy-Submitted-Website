// Approver routes module
const express = require('express');
const router = express.Router();
const pool = require('./db.js');

// ดึงรายการคำร้องที่รออนุมัติ
router.get('/api/tasks', async (req, res) => {
  const { approver_id } = req.query;
  if (!approver_id) return res.status(400).json({ error: 'missing approver_id' });

  try {
    const sql = `
      SELECT 
        aps.id as step_id,
        aps.step_order, 
        s.id as submission_id,
        s.submitted_at,
        s.form_id,
        s.form_data,
        st.full_name as student_name,
        d.department_name,
        r.role_name as role_at_step
      FROM approval_steps aps
      JOIN submissions s ON aps.submission_id = s.id
      JOIN students st ON s.student_id = st.id
      JOIN departments d ON st.department_id = d.id
      LEFT JOIN roles r ON aps.role_id = r.id
      WHERE aps.assigned_approver_id = ?
        AND aps.status = 'PENDING'
        -- เอาไว้เฉพาะขั้นตอนที่เป็นลำดับถัดไปที่ต้องอนุมัติ
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

//API รวมสำหรับ Approve / Reject / Revision
router.post('/api/approver/process-action', async (req, res) => {
  const { step_id, action, note, approver_id } = req.body;

  // ตรวจสอบ Action ที่อนุญาต
  const validActions = ['APPROVED', 'REJECTED', 'NEED_REVISION'];
  if (!validActions.includes(action)) {
    return res.status(400).json({ error: 'Invalid action type' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. ดึงข้อมูล Step และข้อมูลการส่ง (Submission) มาตรวจสอบ
    const [[step]] = await conn.query(
      `SELECT submission_id, assigned_approver_id FROM approval_steps WHERE id = ? AND status = 'PENDING'`,
      [step_id]
    );

    if (!step) {
      throw new Error('ไม่พบรายการนี้ หรือรายการนี้ถูกดำเนินการไปแล้ว');
    }

    // (Optional) ตรวจสอบว่าคนอนุมัติคือคนที่ได้รับมอบหมายจริงๆ
    if (step.assigned_approver_id != approver_id) {
        throw new Error('คุณไม่มีสิทธิ์ดำเนินการในขั้นตอนนี้');
    }

    // 2. อัปเดตตาราง approval_steps
    await conn.query(
      `UPDATE approval_steps 
       SET status = ?, 
           reject_reason = ?, 
           updated_at = NOW() 
       WHERE id = ?`,
      [action, note || null, step_id]
    );

    // 3. บันทึกลง submission_action_logs
    await conn.query(
      `INSERT INTO submission_action_logs (submission_id, approver_id, action, note) 
       VALUES (?, ?, ?, ?)`,
      [step.submission_id, approver_id, action, note || null]
    );

    // 4. ตัดสินใจสถานะสุดท้ายของตาราง submissions
    let finalSubmissionStatus = 'IN_PROGRESS';

    if (action === 'REJECTED') {
      finalSubmissionStatus = 'REJECTED';
    } 
    else if (action === 'NEED_REVISION') {
      finalSubmissionStatus = 'NEED_REVISION';
    } 
    else if (action === 'APPROVED') {
      // เช็กว่ามี Step อื่นที่ยัง 'PENDING' หรือ 'NEED_REVISION' สำหรับ submission นี้ไหม
      const [[pending]] = await conn.query(
        `SELECT COUNT(*) AS cnt FROM approval_steps 
         WHERE submission_id = ? AND status NOT IN ('APPROVED', 'REJECTED')`,
        [step.submission_id]
      );

      // ถ้าไม่มีค้างแล้ว แปลว่าผ่านครบทุกด่าน
      if (pending.cnt === 0) {
        finalSubmissionStatus = 'APPROVED';
      } else {
        finalSubmissionStatus = 'IN_PROGRESS';
      }
    }

    // 5. อัปเดตสถานะที่ตาราง submissions
    await conn.query(
      `UPDATE submissions SET submission_status = ? WHERE id = ?`,
      [finalSubmissionStatus, step.submission_id]
    );

    await conn.commit();
    res.json({ 
      message: `ดำเนินการ ${action} เรียบร้อยแล้ว`,
      submission_status: finalSubmissionStatus 
    });

  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});

//ส่วนแก้ไข้ข้อมูลส่วนตัว Approver
// ดึงข้อมูลส่วนตัว Approver
router.get('/api/profile/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, approver_prefix, full_name, email, approver_tel FROM approvers WHERE id = ?', [req.params.id]);
    if (rows.length > 0) res.json(rows[0]);
    else res.status(404).json({ message: 'ไม่พบข้อมูล' });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// อัปเดตข้อมูลส่วนตัว Approver
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
