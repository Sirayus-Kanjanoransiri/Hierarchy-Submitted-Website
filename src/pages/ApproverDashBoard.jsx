import React, { useState, useEffect } from 'react';

function ApproverDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [comment, setComment] = useState("");
  
  // State สำหรับเก็บจำนวนวันที่ล่าช้า (ตอนที่เจ้าหน้าที่ทะเบียนจะออกบิล)
  const [daysLate, setDaysLate] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

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

  // --- ฟังก์ชันอนุมัติแบบปกติ (สำหรับอาจารย์ และ หัวหน้า) ---
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

  // --- ฟังก์ชันพิเศษ 1: ออกบิลเรียกเก็บเงิน (สำหรับเจ้าหน้าที่ทะเบียน) ---
  const handleIssueBill = async (submissionId, studentId) => {
    if (!daysLate || isNaN(daysLate) || daysLate <= 0) {
      alert('กรุณากรอกจำนวนวันล่าช้าให้ถูกต้องค่ะ');
      return;
    }
    if (!window.confirm(`ยืนยันการออกบิลค่าปรับจำนวน ${daysLate} วัน ใช่หรือไม่?`)) return;

    try {
      const res = await fetch('/approver/api/approver/issue-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission_id: submissionId, student_id: studentId, days_late: daysLate })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`ออกบิลเรียบร้อยแล้วค่ะ! ยอดเรียกเก็บรวม: ฿${data.amount}`);
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

  // --- ฟังก์ชันพิเศษ 2: ตรวจสอบสลิปและปิดคำร้อง (สำหรับเจ้าหน้าที่ทะเบียน) ---
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
        alert('สุดยอดค่ะ! ตรวจสอบสลิปและปิดคำร้องเสร็จสมบูรณ์แล้ว!');
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
    const isOverloadForm = data?.subject === "ขอลงทะเบียนเรียนเกินกว่าหน่วยกิตที่กำหนด" || item.form_id === 2;
    const isLateRegForm = data?.subject?.includes("ขอลงทะเบียนเรียนล่าช้า") || item.form_id === 3;

    return (
      <div className="space-y-4 text-sm text-gray-800">
        <div className="bg-indigo-50 p-4 rounded border border-indigo-100 flex justify-between items-start shadow-sm">
          <div>
            <h3 className="font-bold text-indigo-900 text-base mb-2">ข้อมูลผู้ยื่นคำร้อง</h3>
            <p><span className="font-semibold">ชื่อนักศึกษา:</span> {item.student_name} <span className="text-gray-500 text-xs">(ชั้นปี {data?.year_of_study || '-'} | ภาค{data?.student_type || 'ปกติ'})</span></p>
            <p><span className="font-semibold">สาขาวิชา:</span> {item.department_name}</p>
          </div>
          <div className="text-right">
            <span className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-full shadow">หมวดหมู่: {item.role_at_step}</span>
          </div>
        </div>

        {/* --- UI ฟอร์มลงล่าช้า --- */}
        {isLateRegForm && (
          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-100 px-4 py-2 border-b font-bold text-gray-800 flex justify-between">
              <span>รายละเอียดคำร้อง (ขอลงทะเบียนล่าช้า)</span>
              <span className="text-indigo-600">เทอม {data.term}/{data.academic_year}</span>
            </div>
            
            <div className="p-4 bg-white space-y-4">
              <div className="bg-gray-50 p-3 rounded border border-gray-100">
                 <p className="font-semibold text-gray-700 mb-1">เหตุผลความจำเป็นที่ล่าช้า:</p>
                 <p className="text-gray-800 whitespace-pre-wrap">{data.request_reason || 'ไม่ได้ระบุเหตุผล'}</p>
              </div>

              <div>
                <p className="font-bold text-gray-700 mb-2 text-sm">รายวิชาที่ต้องการลงทะเบียน:</p>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 text-sm text-center">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 font-semibold text-gray-600">รหัสวิชา</th>
                        <th className="px-3 py-2 font-semibold text-gray-600 text-left">ชื่อวิชา</th>
                        <th className="px-3 py-2 font-semibold text-gray-600">กลุ่ม</th>
                        <th className="px-3 py-2 font-semibold text-gray-600">หน่วยกิต</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {data.courses_list?.map((course, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium">{course.courseCode}</td>
                            <td className="px-3 py-2 text-left">{course.courseName}</td>
                            <td className="px-3 py-2">{course.section}</td>
                            <td className="px-3 py-2 font-semibold text-indigo-600">{course.credits}</td>
                          </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* โชว์รูปสลิปตรงนี้ ถ้ามีการอัปโหลดมาแล้ว! */}
              {item.receipt_image_path && (
                <div className="mt-6 border-t pt-4">
                  <h4 className="font-bold text-emerald-700 mb-3 flex items-center gap-2">
                    <span className="text-xl">✅</span> หลักฐานการโอนเงินจากนักศึกษา
                  </h4>
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 text-center">
                    <img 
                      src={item.receipt_image_path} 
                      alt="Slip" 
                      className="max-h-80 mx-auto rounded-md shadow-md border border-gray-300"
                    />
                    <p className="mt-3 text-emerald-800 font-bold">ยอดเงินที่ต้องตรงกับสลิป: ฿{parseFloat(item.amount_due).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-xl font-bold text-indigo-600">กำลังโหลดเอกสาร...</div>;

  // เช็คว่าใช่เจ้าหน้าที่งานทะเบียนที่กำลังดูฟอร์ม 3 ไหม?
  const isRegistrationOfficer = selectedItem?.role_at_step === 'เจ้าหน้าที่งานทะเบียน';
  const isLateRegForm = selectedItem?.form_id === 3 || (typeof selectedItem?.form_data === 'string' ? selectedItem?.form_data : "")?.includes("ขอลงทะเบียนเรียนล่าช้า");
  const needsBillingMode = isRegistrationOfficer && isLateRegForm;

  return (
    <div className="p-8 bg-gray-100 min-h-screen font-['Inter']">
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
                // แอบเพิ่ม Tag เล็กๆ ให้เจ้าหน้าที่รู้ว่าบิลถึงไหนแล้ว
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
                      {dataPreview?.subject || 'เอกสารคำร้องทั่วไป'}
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

      {/* Modal จัดการคำร้อง */}
      {selectedItem && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
              <h2 className="font-bold text-xl">แฟ้มพิจารณาคำร้องนักศึกษา</h2>
              <button className="text-indigo-200 hover:text-white text-3xl leading-none" onClick={() => { setSelectedItem(null); setComment(''); setDaysLate(''); }}>&times;</button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                {renderDetail(selectedItem)}

                {/* กล่องคอมเมนต์ (ซ่อนไว้ถ้าอยู่ในโหมดการเงิน เพราะไม่ต้องคอมเมนต์แล้ว) */}
                {!needsBillingMode && (
                  <div className="mt-6 bg-white p-4 rounded-lg border shadow-sm">
                    <label className="font-bold text-gray-800 text-sm">ข้อเสนอแนะ / หมายเหตุ (บังคับกรอกเมื่อปฏิเสธหรือให้แก้ไข)</label>
                    <textarea className="w-full border border-gray-300 rounded-md p-3 mt-2 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" rows="3" placeholder="พิมพ์ความเห็นที่นี่..." value={comment} onChange={e => setComment(e.target.value)} />
                  </div>
                )}
            </div>

            {/* ส่วนของปุ่ม Action (แยกระหว่างโหมดปกติ กับ โหมดการเงิน) */}
            <div className="bg-gray-100 px-6 py-4 border-t flex gap-3 justify-end items-center">
              
              {needsBillingMode ? (
                 /* ---------------- โหมดการเงิน (เจ้าหน้าที่งานทะเบียน) ---------------- */
                 !selectedItem.payment_id ? (
                    // ร่างที่ 1: ยังไม่มีบิล -> โชว์ช่องกรอกวันล่าช้า
                    <div className="flex items-center justify-end gap-3 w-full bg-white p-3 rounded-lg border border-indigo-200 shadow-sm">
                      <label className="text-sm font-bold text-indigo-900">จำนวนวันล่าช้า:</label>
                      <input 
                        type="number" min="1" 
                        value={daysLate} onChange={e => setDaysLate(e.target.value)} 
                        className="w-20 p-2 border border-gray-300 rounded-md outline-none focus:border-indigo-500 text-center font-bold" 
                        placeholder="วัน" 
                      />
                      <button 
                        onClick={() => handleIssueBill(selectedItem.submission_id, selectedItem.student_id)} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow transition active:scale-95 ml-2"
                      >
                        ออกบิลเรียกเก็บเงิน
                      </button>
                    </div>
                 ) : !selectedItem.receipt_image_path ? (
                    // ร่างที่ 2: มีบิลแล้ว แต่สลิปยังไม่มา
                    <div className="w-full text-right p-2">
                       <span className="bg-orange-100 text-orange-800 border border-orange-200 px-6 py-3 rounded-lg font-bold shadow-sm inline-flex items-center gap-2">
                         <span className="text-xl animate-pulse">⏳</span> ระบบกำลังรอนักศึกษาชำระเงิน (ยอด ฿{parseFloat(selectedItem.amount_due).toLocaleString()})
                       </span>
                    </div>
                 ) : (
                    // ร่างที่ 3: สลิปมาแล้ว! รอกดอนุมัติ
                    <div className="w-full flex justify-end">
                      <button 
                        onClick={() => handleVerifyPayment(selectedItem.payment_id, selectedItem.step_id)} 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2"
                      >
                        ✅ ตรวจสอบสลิปถูกต้อง & อนุมัติคำร้อง
                      </button>
                    </div>
                 )
              ) : (
                 /* ---------------- โหมดปกติ (อาจารย์ / หัวหน้า) ---------------- */
                 <>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-bold shadow transition active:scale-95" onClick={() => handleAction(selectedItem.step_id, 'REJECTED')}>ไม่อนุมัติ (Reject)</button>
                  <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2.5 rounded-lg font-bold shadow transition active:scale-95" onClick={() => handleAction(selectedItem.step_id, 'NEED_REVISION')}>ส่งกลับแก้ไข</button>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-lg font-bold shadow transition active:scale-95" onClick={() => handleAction(selectedItem.step_id, 'APPROVED')}>อนุมัติ (Approve)</button>
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