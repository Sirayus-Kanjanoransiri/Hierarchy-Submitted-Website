// Approver routes module
const express = require('express');
const router = express.Router();
const pool = require('./db.js');

// ดึงรายการคำร้องที่รอการอนุมัติ (เฉพาะลำดับที่ถึงคิวของผู้อนุมัติคนนั้น)
router.get('/api/submissions', async (req, res) => {
    const approverId = req.query.approver_id;

    if (!approverId) {
        return res.status(400).json({ error: "Missing approver_id" });
    }

    // ดึงเฉพาะคำร้องของนักเรียนที่คนคนนี้เป็นอาจารย์ที่ปรึกษา (advisor_id)
    const sql = `
        SELECT s.*, st.full_name AS student_name
        FROM submissions s
        INNER JOIN students st ON s.student_id = st.id
        WHERE st.advisor_id = ?
    `;

    try {
        const [results] = await pool.query(sql, [approverId]);
        return res.json(results);
    } catch (err) {
        console.error("SQL Error (approver /api/submissions):", err);
        return res.status(500).json({ error: "Database error", details: err.message });
    }
});

router.put('/api/submissions/:id/status', async (req, res) => {
    const submissionId = req.params.id;
    const { status, comment, approver_id } = req.body; // รับ approver_id มาด้วย

    // 1. อัปเดต Step ปัจจุบันของผู้อนุมัติคนนี้
    const updateStepSql = `
        UPDATE approval_steps 
        SET status = ?, reject_reason = ?, updated_at = NOW() 
        WHERE submission_id = ? AND assigned_approver_id = ? AND status = 'PENDING'
    `;

    try {
        await pool.query(updateStepSql, [status, comment, submissionId, approver_id]);

        if (status === 'REJECTED') {
            // ถ้าปฏิเสธ ให้เปลี่ยนสถานะหลักของ Submission เป็น REJECTED ทันที
            await pool.query('UPDATE submissions SET submission_status = "REJECTED" WHERE id = ?', [submissionId]);
        } else if (status === 'APPROVED') {
            // ตรวจสอบว่าเป็น Step สุดท้ายหรือไม่
            const checkLastStepSql = `
                SELECT 1 FROM approval_steps 
                WHERE submission_id = ? AND status = 'PENDING'
            `;
            const [pendingSteps] = await pool.query(checkLastStepSql, [submissionId]);
            if (pendingSteps.length === 0) {
                // ถ้าไม่มี Step ค้างแล้ว ให้ Submission เป็น APPROVED
                await pool.query('UPDATE submissions SET submission_status = "APPROVED" WHERE id = ?', [submissionId]);
            } else {
                // ถ้ายังมี Step ถัดไป ให้สถานะหลักเป็น IN_PROGRESS
                await pool.query('UPDATE submissions SET submission_status = "IN_PROGRESS" WHERE id = ?', [submissionId]);
            }
        }

        return res.json({ message: 'Status updated successfully' });
    } catch (err) {
        console.error('SQL Error (approver update status):', err);
        return res.status(500).json({ error: 'Database error', details: err.message });
    }
});

module.exports = router;
