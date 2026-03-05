import React, { useState, useEffect } from 'react';

function ApproverDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [comment, setComment] = useState("");
  
  // State สำหรับเก็บการตั้งค่าระบบ (วันหมดเขต, ค่าหน่วยกิต, ค่าปรับ)
  const [sysSettings, setSysSettings] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/approver/api/settings'); 
      if (res.ok) {
        const data = await res.json();
        setSysSettings(data);
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.id) throw new Error('No approver');
      const res = await fetch(`/approver/api/tasks?approver_id=${user.id}`);
      if (!res.ok) throw new Error('Fetch failed');

      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
      alert('โหลดรายการไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const calculateBusinessDaysLate = (deadlineStr, submitDateStr) => {
    if (!deadlineStr || !submitDateStr) return 0;
    const deadline = new Date(deadlineStr);
    const submitDate = new Date(submitDateStr);
    deadline.setHours(0, 0, 0, 0);
    submitDate.setHours(0, 0, 0, 0);
    if (submitDate <= deadline) return 0;

    let daysLate = 0;
    let currentDate = new Date(deadline);
    while (currentDate < submitDate) {
      currentDate.setDate(currentDate.getDate() + 1);
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysLate++;
      }
    }
    return daysLate;
  };

  const handleAction = async (stepId, action) => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if ((action === 'REJECTED' || action === 'NEED_REVISION') && !comment.trim()) {
      alert('กรุณาใส่เหตุผลหรือรายละเอียดที่ต้องการให้แก้ไข');
      return;
    }

    const data = typeof selectedItem.form_data === 'string' ? JSON.parse(selectedItem.form_data) : selectedItem.form_data;
    const isLateRegForm = selectedItem.form_id === 3 || data?.subject?.includes("ขอลงทะเบียนเรียนล่าช้า");
    const isHeadOfReg = selectedItem.role_at_step === 'หัวหน้างานทะเบียน';

    if (action === 'APPROVED' && isLateRegForm && isHeadOfReg) {
        if (!sysSettings || !sysSettings.late_reg_deadline) {
            alert('ไม่พบการตั้งค่าวันสิ้นสุดการลงทะเบียน กรุณาให้ Admin ตั้งค่าก่อนค่ะ!');
            return;
        }

        const lateDays = calculateBusinessDaysLate(sysSettings.late_reg_deadline, selectedItem.submitted_at);
        const feePerDay = parseInt(sysSettings.late_fee_per_day || 50);
        let totalLateFee = Math.min(lateDays * feePerDay, 500); 

        const totalCredits = parseInt(data.total_credits_requested || 0);
        const costPerCredit = parseInt(sysSettings.credit_cost || 300);
        const totalCreditCost = totalCredits * costPerCredit;
        const grandTotal = totalLateFee + totalCreditCost;

        const confirmMsg = `สรุปยอดเรียกเก็บ:\n- วันสาย: ${lateDays} วัน\n- ค่าปรับ: ฿${totalLateFee}\n- ค่าหน่วยกิต: ฿${totalCreditCost}\nรวมทั้งสิ้น: ฿${grandTotal}\n\nต้องการอนุมัติและออกบิลใช่หรือไม่?`;
        
        if (!window.confirm(confirmMsg)) return;

        try {
            await fetch('/approver/api/approver/auto-issue-bill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    submission_id: selectedItem.submission_id, 
                    student_id: selectedItem.student_id, 
                    amount: grandTotal 
                })
            });
            await processApproval(stepId, action, user.id);
            return;
        } catch (err) {
            alert('เกิดข้อผิดพลาด: ' + err.message);
            return;
        }
    }

    if (!window.confirm(`ยืนยันการทำรายการ: ${action}?`)) return;
    await processApproval(stepId, action, user.id);
  };

  const processApproval = async (stepId, action, approverId) => {
    try {
        const res = await fetch(`/approver/api/approver/process-action`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ step_id: stepId, approver_id: approverId, action: action, note: comment })
          });
          if (!res.ok) throw new Error('Update failed');
          alert('ดำเนินการเรียบร้อย');
          setSelectedItem(null);
          setComment('');
          fetchTasks(); 
    } catch (err) { alert(err.message); }
  };

  const handleVerifyPayment = async (paymentId, stepId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!window.confirm('ยืนยันความถูกต้องของสลิป?')) return;
    try {
      const res = await fetch('/approver/api/approver/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId, step_id: stepId, approver_id: user.id })
      });
      if (res.ok) {
        alert('ตรวจสอบสลิปเรียบร้อย!');
        setSelectedItem(null);
        fetchTasks();
      }
    } catch (err) { alert('ผิดพลาด'); }
  };

  // --- Helper: แปลงหัวข้อข้อมูลใน Database เป็นภาษาไทย ---
  const getThaiLabel = (key) => {
    const labels = {
      term: "ภาคเรียน",
      academic_year: "ปีการศึกษา",
      semester: "ภาคเรียน",
      academicYear: "ปีการศึกษา",
      gpa: "เกรดเฉลี่ยสะสม (GPA)",
      accumulated_credits: "หน่วยกิตสะสม",
      total_credits_requested: "หน่วยกิตที่ขอลงทะเบียน",
      request_reason: "เหตุผลความจำเป็น",
      reason: "เหตุผลความจำเป็น",
      reason_category: "ประเภทเงื่อนไข",
      year_of_study: "ชั้นปีที่",
      phone: "เบอร์โทรศัพท์",
    };
    return labels[key] || key;
  };

  const renderDetail = (item) => {
    let data = {};
    try {
      data = typeof item.form_data === 'string' ? JSON.parse(item.form_data) : item.form_data;
    } catch (e) { console.error(e); }

    return (
      <div className="space-y-4 text-sm text-gray-800">
        {/* ส่วนหัว: ข้อมูลนักศึกษา (UI เดิม) */}
        <div className="bg-indigo-50 p-4 rounded border border-indigo-100 flex justify-between items-start shadow-sm">
          <div>
            <h3 className="font-bold text-indigo-900 text-base mb-2">ข้อมูลผู้ยื่นคำร้อง</h3>
            <p><span className="font-semibold">ชื่อนักศึกษา:</span> {item.student_name} <span className="text-gray-500 text-xs">(ชั้นปี {data?.year_of_study || data?.year || '-'})</span></p>
            <p><span className="font-semibold">สาขาวิชา:</span> {item.department_name}</p>
          </div>
          <div className="text-right">
            <span className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-full shadow">บทบาทผู้อนุมัติ: {item.role_at_step}</span>
          </div>
        </div>

        {/* ส่วนรายละเอียดเนื้อหาฟอร์ม (ปรับปรุงให้ดึง Key จาก DB อัตโนมัติ) */}
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm mt-4">
          <div className={`px-4 py-2 border-b font-bold flex justify-between ${item.form_id === 7 ? 'bg-cyan-100 text-cyan-900' : 'bg-indigo-100 text-indigo-900'}`}>
            <span>{item.form_name}</span>
            <span>เทอม {data.term || data.semester}/{data.academic_year || data.academicYear}</span>
          </div>
          
          <div className="p-4 bg-white space-y-4">
            {/* วนลูปแสดงข้อมูลที่เป็น Key-Value ปกติ (ยกเว้นพวกที่เป็นตาราง) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 bg-gray-50 p-3 rounded border border-gray-100">
              {Object.entries(data).map(([key, value]) => {
                if (Array.isArray(value) || typeof value === 'object' || key === 'term' || key === 'academic_year' || key === 'semester' || key === 'academicYear') return null;
                return (
                  <div key={key} className="flex border-b border-gray-200 py-1">
                    <span className="font-semibold text-gray-600 w-1/2">{getThaiLabel(key)}:</span>
                    <span className="text-gray-900 w-1/2">{value || '-'}</span>
                  </div>
                );
              })}
            </div>

            {/* แสดงตารางรายวิชา (กรณีฟอร์ม 3, 4, 5) */}
            {data.courses_list && (
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y text-center text-xs">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-2 py-2">รหัสวิชา</th>
                      <th className="px-2 py-2 text-left">ชื่อวิชา</th>
                      <th className="px-2 py-2">กลุ่ม</th>
                      <th className="px-2 py-2">หน่วยกิต</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.courses_list.map((c, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-2 py-2 font-mono">{c.courseCode}</td>
                        <td className="px-2 py-2 text-left">{c.courseName}</td>
                        <td className="px-2 py-2">{c.section}</td>
                        <td className="px-2 py-2 font-bold">{c.credits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* แสดงตารางเปลี่ยนกลุ่ม (กรณีฟอร์ม 7) */}
            {data.courses && item.form_id === 7 && (
              <div className="overflow-x-auto border border-cyan-200 rounded-lg">
                <table className="min-w-full divide-y text-center text-xs">
                  <thead className="bg-cyan-50 text-cyan-800">
                    <tr>
                      <th className="px-2 py-2">รหัสวิชา</th>
                      <th className="px-2 py-2 text-left">ชื่อวิชา</th>
                      <th className="px-2 py-2 text-red-600">กลุ่มเดิม</th>
                      <th className="px-2 py-2 text-emerald-600">กลุ่มใหม่</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.courses.map((c, i) => (
                      <tr key={i}>
                        <td className="px-2 py-2 font-medium">{c.code}</td>
                        <td className="px-2 py-2 text-left">{c.name}</td>
                        <td className="px-2 py-2 text-red-500 bg-red-50/20">{c.oldSection}</td>
                        <td className="px-2 py-2 text-emerald-600 bg-emerald-50/20">{c.newSection}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ส่วนสลิปเงิน (UI เดิม) */}
            {item.receipt_image_path && (
              <div className="mt-4 border-t pt-4">
                <h4 className="font-bold text-emerald-700 mb-2 flex items-center gap-2">✅ หลักฐานการชำระเงิน</h4>
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-center">
                  <img src={item.receipt_image_path} alt="Slip" className="max-h-64 mx-auto rounded shadow-sm border" />
                  <p className="mt-2 text-emerald-800 font-bold text-xs">ยอดที่ต้องชำระ: ฿{parseFloat(item.amount_due || 0).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-xl font-bold text-indigo-600">กำลังโหลดเอกสาร...</div>;

  const isFinance = selectedItem?.role_at_step === 'การเงิน';
  const dataString = typeof selectedItem?.form_data === 'string' ? selectedItem?.form_data : "";
  const isLateRegForm = selectedItem?.form_id === 3 || dataString?.includes("ขอลงทะเบียนเรียนล่าช้า");
  const needsFinanceCheck = isFinance && isLateRegForm;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 border-l-4 border-indigo-600 pl-4">เอกสารที่รอการอนุมัติ</h1>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-indigo-50 border-b-2 border-indigo-100">
              <tr>
                <th className="p-4 text-indigo-900 font-semibold">วันที่ส่ง</th>
                <th className="p-4 text-indigo-900 font-semibold">นักศึกษา</th>
                <th className="p-4 text-indigo-900 font-semibold">เรื่อง</th>
                <th className="p-4 text-center text-indigo-900 font-semibold">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.length ? tasks.map(item => {
                const statusTag = item.role_at_step === 'การเงิน' && item.payment_id 
                                  ? (item.receipt_image_path ? "รอตรวจสลิป" : "รอนักศึกษาจ่าย") 
                                  : null;
                return (
                  <tr key={item.step_id} className="hover:bg-indigo-50 transition-colors">
                    <td className="p-4 text-sm text-gray-600">{new Date(item.submitted_at).toLocaleDateString('th-TH')}</td>
                    <td className="p-4">
                      <div className="font-medium text-gray-800">{item.student_name}</div>
                      <div className="text-xs text-gray-500">{item.department_name}</div>
                    </td>
                    <td className="p-4 text-sm font-medium text-indigo-600 flex flex-col items-start gap-1">
                      <div className="text-gray-900 font-bold">{item.form_name}</div>
                      <div className="text-[11px] text-gray-500 font-normal">หมวดหมู่: {item.category_name}</div>
                      {statusTag && <span className={`text-[10px] px-2 py-0.5 rounded-full text-white ${item.receipt_image_path ? 'bg-emerald-500' : 'bg-orange-400'}`}>{statusTag}</span>}
                    </td>
                    <td className="p-4 text-center">
                      <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full text-sm font-bold shadow-md transition-all active:scale-95" onClick={() => setSelectedItem(item)}>
                        เปิดดูเอกสาร
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="4" className="p-16 text-center text-gray-500 font-medium"><div className="text-4xl mb-4">📄</div>ยังไม่มีคำร้องรออนุมัติค่ะ</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
              <h2 className="font-bold text-xl">แฟ้มพิจารณาคำร้อง</h2>
              <button className="text-indigo-200 hover:text-white text-3xl leading-none" onClick={() => { setSelectedItem(null); setComment(''); }}>&times;</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                {renderDetail(selectedItem)}
                {!needsFinanceCheck && (
                  <div className="mt-6 bg-white p-4 rounded-lg border shadow-sm">
                    <label className="font-bold text-gray-800 text-sm">หมายเหตุ (กรณีปฏิเสธ/แก้ไข)</label>
                    <textarea className="w-full border border-gray-300 rounded-md p-3 mt-2 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" rows="3" placeholder="พิมพ์ความเห็นที่นี่..." value={comment} onChange={e => setComment(e.target.value)} />
                  </div>
                )}
            </div>
            <div className="bg-gray-100 px-6 py-4 border-t flex gap-3 justify-end items-center">
              {needsFinanceCheck ? (
                 !selectedItem.receipt_image_path ? (
                    <span className="bg-orange-100 text-orange-800 border border-orange-200 px-6 py-3 rounded-lg font-bold shadow-sm inline-flex items-center gap-2">รอนักศึกษาอัปโหลดสลิป</span>
                 ) : (
                    <button onClick={() => handleVerifyPayment(selectedItem.payment_id, selectedItem.step_id)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all active:scale-95">✅ ตรวจสอบสลิปถูกต้อง</button>
                 )
              ) : (
                 <>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-bold shadow transition active:scale-95" onClick={() => handleAction(selectedItem.step_id, 'REJECTED')}>ไม่อนุมัติ</button>
                  <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2.5 rounded-lg font-bold shadow transition active:scale-95" onClick={() => handleAction(selectedItem.step_id, 'NEED_REVISION')}>ส่งกลับแก้ไข</button>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-lg font-bold shadow transition active:scale-95" onClick={() => handleAction(selectedItem.step_id, 'APPROVED')}>อนุมัติ</button>
                 </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApproverDashboard;