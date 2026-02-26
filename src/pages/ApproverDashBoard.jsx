import React, { useState, useEffect } from 'react';

function ApproverDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [comment, setComment] = useState("");
<<<<<<< HEAD
  
  // State สำหรับเก็บการตั้งค่าระบบ (วันหมดเขต, ค่าหน่วยกิต, ค่าปรับ)
  const [sysSettings, setSysSettings] = useState(null);
=======
  const [daysLate, setDaysLate] = useState("");
>>>>>>> fc68d90cc4ae30277185617427130629d0fafb60

  useEffect(() => {
    fetchTasks();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/approver/api/settings'); // ดึงการตั้งค่า
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

  // 🧮 ฟังก์ชันเวทมนตร์: คำนวณวันล่าช้า (หักวันเสาร์-อาทิตย์)
  const calculateBusinessDaysLate = (deadlineStr, submitDateStr) => {
    if (!deadlineStr || !submitDateStr) return 0;
    
    const deadline = new Date(deadlineStr);
    const submitDate = new Date(submitDateStr);

    // รีเซ็ตเวลาให้เป็นเที่ยงคืนตรง เพื่อเปรียบเทียบเฉพาะ "วันที่"
    deadline.setHours(0, 0, 0, 0);
    submitDate.setHours(0, 0, 0, 0);

    // ถ้ายื่นก่อนหรือตรงกับวันหมดเขต = ไม่สาย
    if (submitDate <= deadline) return 0;

    let daysLate = 0;
    let currentDate = new Date(deadline);

    // วนลูปนับวันไปเรื่อยๆ จนกว่าจะถึงวันที่นักศึกษากดยื่นฟอร์ม
    while (currentDate < submitDate) {
      currentDate.setDate(currentDate.getDate() + 1);
      const dayOfWeek = currentDate.getDay();
      
      // 0 = วันอาทิตย์, 6 = วันเสาร์ -> ถ้าไม่ใช่วันพวกนี้ ค่อยนับเพิ่ม 1 วัน!
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysLate++;
      }
    }
    return daysLate;
  };

  // --- ฟังก์ชันกดปุ่ม Action ---
  const handleAction = async (stepId, action) => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if ((action === 'REJECTED' || action === 'NEED_REVISION') && !comment.trim()) {
      alert('กรุณาใส่เหตุผลหรือรายละเอียดที่ต้องการให้แก้ไข');
      return;
    }

    const data = typeof selectedItem.form_data === 'string' ? JSON.parse(selectedItem.form_data) : selectedItem.form_data;
    const isLateRegForm = selectedItem.form_id === 3 || data?.subject?.includes("ขอลงทะเบียนเรียนล่าช้า");
    const isHeadOfReg = selectedItem.role_at_step === 'หัวหน้างานทะเบียน';

    // 🌟 ภารกิจของหัวหน้างานทะเบียน: อนุมัติ + คำนวณเงิน + ออกบิลอัตโนมัติ!
    if (action === 'APPROVED' && isLateRegForm && isHeadOfReg) {
        if (!sysSettings || !sysSettings.late_reg_deadline) {
            alert('ไม่พบการตั้งค่าวันสิ้นสุดการลงทะเบียน กรุณาให้ Admin ตั้งค่าก่อนค่ะ!');
            return;
        }

        // คำนวณจำนวนวันสาย (หัก ส.-อา.)
        const lateDays = calculateBusinessDaysLate(sysSettings.late_reg_deadline, selectedItem.submitted_at);
        const feePerDay = parseInt(sysSettings.late_fee_per_day || 50);
        
        // 🌟 แก้ไขตรงนี้: คำนวณค่าปรับ และจำกัดเพดานสูงสุดไว้ที่ 500 บาท
        let totalLateFee = lateDays * feePerDay;
        totalLateFee = Math.min(totalLateFee, 500); // ถ้าเกิน 500 ระบบจะบังคับให้เหลือ 500 ทันที!

        // คำนวณค่าหน่วยกิต
        const totalCredits = parseInt(data.total_credits_requested || 0);
        const costPerCredit = parseInt(sysSettings.credit_cost || 300);
        const totalCreditCost = totalCredits * costPerCredit;

        const grandTotal = totalLateFee + totalCreditCost;

        // อัปเดตข้อความแจ้งเตือนให้ชัดเจนขึ้น
        const confirmMsg = `สรุปยอดเรียกเก็บ:\n- จำนวนวันสาย (หัก ส.-อา.): ${lateDays} วัน\n- ค่าปรับ (สูงสุดไม่เกิน 500 บาท): ฿${totalLateFee}\n- ค่าหน่วยกิต: ฿${totalCreditCost}\nรวมทั้งสิ้น: ฿${grandTotal}\n\nต้องการอนุมัติและออกบิลใช่หรือไม่?`;
        
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
            alert('เกิดข้อผิดพลาดในการสร้างบิลอัตโนมัติ: ' + err.message);
            return;
        }
    }

    // อนุมัติปกติ
    if (!window.confirm(`ยืนยันการทำรายการ: ${action}?`)) return;
    await processApproval(stepId, action, user.id);
  };

  const processApproval = async (stepId, action, approverId) => {
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
  };

  const handleVerifyPayment = async (paymentId, stepId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!window.confirm('คุณตรวจสอบสลิปว่าถูกต้อง และต้องการอนุมัติส่งต่อให้งานทะเบียนใช่หรือไม่?')) return;
    try {
      const res = await fetch('/approver/api/approver/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId, step_id: stepId, approver_id: user.id })
      });
      if (res.ok) {
        alert('ตรวจสอบสลิปเรียบร้อย! ระบบส่งเรื่องให้เจ้าหน้าที่ทะเบียนแล้วค่ะ!');
        setSelectedItem(null);
        fetchTasks();
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
                    <p className="mt-3 text-emerald-800 font-bold">ยอดเงินที่ต้องตรงกับสลิป: ฿{parseFloat(item.amount_due || 0).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- UI ฟอร์มลงเกิน/ต่ำกว่าเกณฑ์ (2, 6) --- */}
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
              <div className="flex flex-wrap gap-4 mb-2">
                <div className="bg-gray-50 p-3 rounded border border-gray-200 flex-1 min-w-[120px]">
                  <p className="text-xs text-gray-500 font-bold mb-1">หน่วยกิตสะสม</p>
                  <p className="text-xl font-black text-gray-800">{data.accumulated_credits}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded border border-gray-200 flex-1 min-w-[120px]">
                  <p className="text-xs text-gray-500 font-bold mb-1">เกรดเฉลี่ย (GPA)</p>
                  <p className="text-xl font-black text-gray-800">{data.gpa}</p>
                </div>
                <div className="p-3 rounded border flex-1 min-w-[150px] bg-indigo-50 border-indigo-200">
                  <p className="text-xs font-bold mb-1 text-indigo-700">จำนวนหน่วยกิตที่ขอลง</p>
                  <p className="text-2xl font-black text-indigo-700">{data.total_credits_requested}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                  <p className="font-semibold text-gray-700 mb-1">เหตุผลความจำเป็นเบื้องต้น:</p>
                  <p className="text-gray-800">{data.request_reason || '-'}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                  <p className="font-semibold text-gray-700 mb-1">เงื่อนไขประกอบการพิจารณาที่เลือก:</p>
                  <p className="font-bold text-indigo-700">
                    ✓ {data.reason_category} {data.other_reason_text ? `(${data.other_reason_text})` : ''}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded border border-yellow-200 mt-4">
                <p className="font-bold text-yellow-800 mb-2">
                    ประวัติการขอลงทะเบียน{isOverloadForm ? 'เกินเกณฑ์' : 'ต่ำกว่าเกณฑ์'}ในอดีต:
                </p>
                {isOverloadForm ? (
                    <p className="text-gray-800 font-medium">
                        {data.past_overload_status} 
                        {data.past_overload_status === 'เคยลงทะเบียนเกิน' ? ` (เมื่อเทอม ${data.past_overload_term}/${data.past_overload_year})` : ''}
                    </p>
                ) : (
                    data.history_records && data.history_records.length > 0 ? (
                        <div className="overflow-x-auto border border-yellow-200 rounded-lg">
                          <table className="min-w-full divide-y divide-yellow-200 text-sm text-center bg-white">
                            <thead className="bg-yellow-100">
                              <tr>
                                <th className="px-3 py-2 font-semibold text-yellow-800">เทอม/ปีการศึกษา</th>
                                <th className="px-3 py-2 font-semibold text-yellow-800">จำนวนหน่วยกิต</th>
                                <th className="px-3 py-2 font-semibold text-yellow-800">เกรดเฉลี่ย (GPA)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-yellow-50">
                              {data.history_records.map((rec, idx) => (
                                <tr key={idx} className="hover:bg-yellow-50">
                                  <td className="px-3 py-2">{rec.term}/{rec.academicYear}</td>
                                  <td className="px-3 py-2 font-bold text-gray-700">{rec.credits}</td>
                                  <td className="px-3 py-2 font-bold text-gray-700">{rec.gpa}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                    ) : (
                        <p className="text-gray-800 font-medium bg-white p-2 rounded border border-yellow-100">
                          {data.past_underload_status || 'ไม่เคยมีประวัติการขอลงทะเบียนต่ำกว่าเกณฑ์มาก่อน'} 
                        </p>
                    )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-xl font-bold text-indigo-600">กำลังโหลดเอกสาร...</div>;

  // เช็คโหมดและ Role สำหรับการแสดงผลปุ่ม
  const isFinance = selectedItem?.role_at_step === 'การเงิน'; // Role 8
  const dataString = typeof selectedItem?.form_data === 'string' ? selectedItem?.form_data : "";
  const isLateRegForm = selectedItem?.form_id === 3 || dataString?.includes("ขอลงทะเบียนเรียนล่าช้า");
  
  // 🌟 โหมดตรวจสอบสลิป จะเปิดใช้งานเฉพาะเมื่อ "ฝ่ายการเงิน" เข้ามาดู "ฟอร์มลงล่าช้า" เท่านั้น!
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
                const dataPreview = typeof item.form_data === 'string' ? JSON.parse(item.form_data) : item.form_data;
                
                // ให้ Tag สถานะจ่ายเงิน โชว์เฉพาะตอนอยู่ที่การเงิน
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
              <h2 className="font-bold text-xl">แฟ้มพิจารณาคำร้องนักศึกษา</h2>
              <button className="text-indigo-200 hover:text-white text-3xl leading-none" onClick={() => { setSelectedItem(null); setComment(''); }}>&times;</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                {renderDetail(selectedItem)}

                {/* ซ่อนกล่องคอมเมนต์ตอนที่การเงินต้องตรวจสลิป */}
                {!needsFinanceCheck && (
                  <div className="mt-6 bg-white p-4 rounded-lg border shadow-sm">
                    <label className="font-bold text-gray-800 text-sm">ข้อเสนอแนะ / หมายเหตุ (บังคับกรอกเมื่อปฏิเสธหรือให้แก้ไข)</label>
                    <textarea className="w-full border border-gray-300 rounded-md p-3 mt-2 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" rows="3" placeholder="พิมพ์ความเห็นที่นี่..." value={comment} onChange={e => setComment(e.target.value)} />
                  </div>
                )}
            </div>
            <div className="bg-gray-100 px-6 py-4 border-t flex gap-3 justify-end items-center">
              {needsFinanceCheck ? (
                 /* ---------------- โหมดการเงิน (Role 8) ---------------- */
                 !selectedItem.receipt_image_path ? (
                    <div className="w-full text-right p-2">
                       <span className="bg-orange-100 text-orange-800 border border-orange-200 px-6 py-3 rounded-lg font-bold shadow-sm inline-flex items-center gap-2">
                         <span className="text-xl animate-pulse">⏳</span> ระบบกำลังรอนักศึกษาอัปโหลดสลิปชำระเงิน (ยอด ฿{parseFloat(selectedItem.amount_due || 0).toLocaleString()})
                       </span>
                    </div>
                 ) : (
                    <div className="w-full flex justify-end">
                      <button 
                        onClick={() => handleVerifyPayment(selectedItem.payment_id, selectedItem.step_id)} 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2"
                      >
                        ✅ ตรวจสอบสลิปถูกต้อง & ส่งต่อให้งานทะเบียน
                      </button>
                    </div>
                 )
              ) : (
                 /* ---------------- โหมดปกติ (รวมถึงเจ้าหน้าที่ทะเบียนด่านสุดท้ายด้วย) ---------------- */
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