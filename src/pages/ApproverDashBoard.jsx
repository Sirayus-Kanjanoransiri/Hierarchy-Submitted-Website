import React, { useState, useEffect } from 'react';

function ApproverDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [comment, setComment] = useState("");
  const [daysLate, setDaysLate] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.id) throw new Error('No approver');

      // หมายเหตุ: Backend ของคุณต้องใช้ SQL JOIN กับตาราง forms และ categories 
      // เพื่อให้ได้ item.form_name และ item.category_name ออกมา
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

  const handleAction = async (stepId, action) => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if ((action === 'REJECTED' || action === 'NEED_REVISION') && !comment.trim()) {
      alert('กรุณาใส่เหตุผลหรือรายละเอียดที่ต้องการให้แก้ไข');
      return;
    }

    if (!window.confirm(`ยืนยันการทำรายการ: ${action}?`)) return;

    try {
      const res = await fetch(`/approver/api/approver/process-action`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step_id: stepId, approver_id: user.id, action: action, note: comment })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Update failed');

      alert('ดำเนินการเรียบร้อย');
      setSelectedItem(null);
      setComment('');
      fetchTasks(); 
    } catch (err) {
      alert('บันทึกไม่สำเร็จ: ' + err.message);
    }
  };

  const handleIssueBill = async (submissionId, studentId) => {
    if (!daysLate || isNaN(daysLate) || daysLate <= 0) {
      alert('กรุณากรอกจำนวนวัน/หน่วย เพื่อคำนวณค่าธรรมเนียมให้ถูกต้อง');
      return;
    }
    if (!window.confirm(`ยืนยันการออกบิลค่าปรับ/ค่าธรรมเนียม ใช่หรือไม่?`)) return;

    try {
      const res = await fetch('/approver/api/approver/issue-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission_id: submissionId, student_id: studentId, days_late: daysLate })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`ออกบิลเรียบร้อยแล้ว! ยอดเรียกเก็บรวม: ฿${data.amount}`);
        setSelectedItem(null);
        setDaysLate("");
        fetchTasks();
      } else {
        alert(`เกิดข้อผิดพลาด: ${data.error}`);
      }
    } catch (err) {
      alert('ไม่สามารถเชื่อมต่อระบบหลังบ้านได้');
    }
  };

  const handleVerifyPayment = async (paymentId, stepId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!window.confirm('คุณตรวจสอบสลิปว่าถูกต้อง และต้องการอนุมัติคำร้องนี้ให้เสร็จสิ้นใช่หรือไม่?')) return;

    try {
      const res = await fetch('/approver/api/approver/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId, step_id: stepId, approver_id: user.id })
      });
      const data = await res.json();
      if (res.ok) {
        alert('สุดยอด! ตรวจสอบสลิปและปิดคำร้องเสร็จสมบูรณ์แล้ว!');
        setSelectedItem(null);
        fetchTasks();
      } else {
        alert(`เกิดข้อผิดพลาด: ${data.error}`);
      }
    } catch (err) {
      alert('ไม่สามารถเชื่อมต่อระบบหลังบ้านได้');
    }
  };

  const renderDetail = (item) => {
    const data = typeof item.form_data === 'string' ? JSON.parse(item.form_data) : item.form_data;
    
    // ตรวจสอบประเภทฟอร์ม
    const isLateRegForm = data?.subject?.includes("ขอลงทะเบียนเรียนล่าช้า") || item.form_id === 3;
    const isCourseCancelForm = data?.subject?.includes("ขอยกเลิกการลงทะเบียนเรียน") || item.form_id === 4;
    const isConfirmRegForm = data?.subject?.includes("ขอยืนยันการลงทะเบียนเรียน") || item.form_id === 5;
    const isOverloadForm = data?.subject?.includes("เกินกว่าหน่วยกิต") || item.form_id === 2;
    const isUnderloadForm = data?.subject?.includes("ต่ำกว่าหน่วยกิต") || item.form_id === 6;
    const isChangeSectionForm = item.form_id === 7; // แบบคำขอเปลี่ยนกลุ่มเรียน

    return (
      <div className="space-y-4 text-sm text-gray-800">
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

        {/* --- UI สำหรับฟอร์มที่มีตารางรายวิชา (3, 4, 5) --- */}
        {(isLateRegForm || isCourseCancelForm || isConfirmRegForm) && (
          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm mt-4">
            <div className="bg-gray-100 px-4 py-2 border-b font-bold text-gray-800 flex justify-between">
              <span>{item.form_name}</span>
              <span className="text-indigo-600">เทอม {data.term}/{data.academic_year}</span>
            </div>
            <div className="p-4 bg-white space-y-4">
              <div className="bg-gray-50 p-3 rounded border border-gray-100">
                 <p className="font-semibold text-gray-700 mb-1">เหตุผลความจำเป็น:</p>
                 <p className="text-gray-800 whitespace-pre-wrap">{data.request_reason || 'ไม่ได้ระบุเหตุผล'}</p>
              </div>
              <div>
                <table className="min-w-full divide-y divide-gray-200 text-sm text-center border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2">รหัสวิชา</th>
                      <th className="px-3 py-2 text-left">ชื่อวิชา</th>
                      <th className="px-3 py-2">กลุ่ม</th>
                      <th className="px-3 py-2">หน่วยกิต</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {data.courses_list?.map((course, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-3 py-2">{course.courseCode}</td>
                        <td className="px-3 py-2 text-left">{course.courseName}</td>
                        <td className="px-3 py-2">{course.section}</td>
                        <td className="px-3 py-2 font-bold">{course.credits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- UI สำหรับฟอร์มเปลี่ยนกลุ่มเรียน (ฟอร์ม 7) --- */}
        {isChangeSectionForm && (
          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm mt-4">
            <div className="bg-cyan-100 px-4 py-2 border-b font-bold text-cyan-900 border-cyan-200 flex justify-between">
              <span>{item.form_name}</span>
              <span>เทอม {data.semester}/{data.academicYear}</span>
            </div>
            <div className="p-4 bg-white space-y-4">
              <div className="bg-gray-50 p-3 rounded border border-gray-100">
                <p className="font-semibold text-gray-700 mb-1">เหตุผลความจำเป็น:</p>
                <p className="text-gray-800 whitespace-pre-wrap">{data.reason || 'ไม่ได้ระบุเหตุผล'}</p>
              </div>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 text-sm text-center">
                  <thead className="bg-cyan-50">
                    <tr>
                      <th className="px-3 py-2 text-cyan-800">รหัสวิชา</th>
                      <th className="px-3 py-2 text-left text-cyan-800">ชื่อวิชา</th>
                      <th className="px-3 py-2 text-red-600">กลุ่มเดิม</th>
                      <th className="px-3 py-2 text-emerald-600">กลุ่มใหม่</th>
                      <th className="px-3 py-2 text-cyan-800">หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {data.courses?.map((course, idx) => (
                      <tr key={idx} className="hover:bg-cyan-50/30">
                        <td className="px-3 py-2 font-medium">{course.code}</td>
                        <td className="px-3 py-2 text-left">{course.name}</td>
                        <td className="px-3 py-2 font-bold text-red-500 bg-red-50/30">{course.oldSection}</td>
                        <td className="px-3 py-2 font-bold text-emerald-600 bg-emerald-50/30">{course.newSection}</td>
                        <td className="px-3 py-2 text-xs italic">{course.note || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- UI สำหรับฟอร์มพิจารณาหน่วยกิต (2 และ 6) --- */}
        {(isOverloadForm || isUnderloadForm) && (
          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm mt-4">
            <div className="px-4 py-2 border-b font-bold flex justify-between bg-indigo-100 text-indigo-900 border-indigo-200">
              <span>{item.form_name}</span>
              <span>เทอม {data.term}/{data.academic_year}</span>
            </div>
            <div className="p-4 bg-white space-y-4">
              <div className="flex gap-4">
                <div className="bg-gray-50 p-3 rounded border flex-1 text-center">
                  <p className="text-xs text-gray-500 font-bold">GPA</p>
                  <p className="text-xl font-black">{data.gpa}</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded border border-indigo-200 flex-1 text-center">
                  <p className="text-xs text-indigo-700 font-bold">หน่วยกิตที่ขอ</p>
                  <p className="text-xl font-black text-indigo-700">{data.total_credits_requested}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded border border-gray-100">
                <p className="font-semibold text-gray-700">เงื่อนไข:</p>
                <p className="font-bold text-indigo-700">✓ {data.reason_category}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-xl font-bold text-indigo-600">กำลังโหลดเอกสาร...</div>;

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
                const dataPreview = typeof item.form_data === 'string' ? JSON.parse(item.form_data) : item.form_data;
                const statusTag = item.role_at_step === 'เจ้าหน้าที่งานทะเบียน' && item.payment_id 
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
                <tr><td colSpan="4" className="p-16 text-center text-gray-500 font-medium">ยังไม่มีคำร้องรออนุมัติ</td></tr>
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
              <button className="text-3xl" onClick={() => { setSelectedItem(null); setComment(''); setDaysLate(''); }}>&times;</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                {renderDetail(selectedItem)}
                <div className="mt-6 bg-white p-4 rounded-lg border shadow-sm">
                  <label className="font-bold text-gray-800 text-sm">ข้อเสนอแนะ / หมายเหตุ</label>
                  <textarea className="w-full border border-gray-300 rounded-md p-3 mt-2 outline-none text-sm" rows="3" placeholder="พิมพ์ความเห็นที่นี่..." value={comment} onChange={e => setComment(e.target.value)} />
                </div>
            </div>
            <div className="bg-gray-100 px-6 py-4 border-t flex gap-3 justify-end items-center">
                <button className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold" onClick={() => handleAction(selectedItem.step_id, 'REJECTED')}>ไม่อนุมัติ</button>
                <button className="bg-yellow-500 text-white px-6 py-2 rounded-lg font-bold" onClick={() => handleAction(selectedItem.step_id, 'NEED_REVISION')}>ส่งกลับแก้ไข</button>
                <button className="bg-green-600 text-white px-8 py-2 rounded-lg font-bold" onClick={() => handleAction(selectedItem.step_id, 'APPROVED')}>อนุมัติ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApproverDashboard;