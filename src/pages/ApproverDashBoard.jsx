import React, { useState, useEffect } from 'react';

function ApproverDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [comment, setComment] = useState("");

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
        body: JSON.stringify({
          step_id: stepId,
          approver_id: user.id, 
          action: action,
          note: comment
        })
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Update failed');

      alert('ดำเนินการเรียบร้อย');
      setSelectedItem(null);
      setComment('');
      fetchTasks(); 
    } catch (err) {
      console.error(err);
      alert('บันทึกไม่สำเร็จ: ' + err.message);
    }
  };

  // ฟังก์ชันแสดงผลข้อมูลตามประเภทของคำร้อง
  const renderDetail = (item) => {
    const data = typeof item.form_data === 'string'
      ? JSON.parse(item.form_data)
      : item.form_data;

    // เช็คว่าใช่คำร้องขอลงทะเบียนเกินหน่วยกิตหรือไม่
    const isOverloadForm = data?.subject === "ขอลงทะเบียนเรียนเกินกว่าหน่วยกิตที่กำหนด" || item.form_id === 2;

    return (
      <div className="space-y-4 text-sm text-gray-800">
        
        {/* ข้อมูลทั่วไป (โชว์ทุกฟอร์ม) */}
        <div className="bg-indigo-50 p-4 rounded border border-indigo-100 flex justify-between items-start shadow-sm">
          <div>
            <h3 className="font-bold text-indigo-900 text-base mb-2">ข้อมูลผู้ยื่นคำร้อง</h3>
            <p><span className="font-semibold">ชื่อนักศึกษา:</span> {item.student_name} <span className="text-gray-500 text-xs">(ชั้นปี {data?.year_of_study || '-'} | ภาค{data?.student_type || 'ปกติ'})</span></p>
            <p><span className="font-semibold">สาขาวิชา:</span> {item.department_name}</p>
          </div>
          <div className="text-right">
            <span className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-full shadow">
              หมวดหมู่: {item.role_at_step}
            </span>
          </div>
        </div>

        {/* --- ส่วนแสดงผลเฉพาะฟอร์มลงทะเบียนเกินหน่วยกิต --- */}
        {isOverloadForm ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-100 px-4 py-2 border-b font-bold text-gray-800 flex justify-between">
              <span>รายละเอียดคำร้อง (ขอลงทะเบียนเกิน)</span>
              <span className="text-indigo-600">เทอม {data.term}/{data.academic_year}</span>
            </div>
            
            <div className="p-4 bg-white space-y-4">
              {/* ข้อมูลวิชาการ (Academic Status) */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-yellow-50 p-3 rounded border border-yellow-200">
                <div className="text-center border-r border-yellow-200">
                  <p className="text-xs text-gray-500 font-semibold mb-1">เกรดเฉลี่ยสะสม (GPA)</p>
                  <p className="text-2xl font-bold text-red-600">{parseFloat(data.gpa || 0).toFixed(2)}</p>
                </div>
                <div className="text-center md:border-r border-yellow-200">
                  <p className="text-xs text-gray-500 font-semibold mb-1">หน่วยกิตสะสม</p>
                  <p className="text-xl font-bold text-gray-800">{data.accumulated_credits || 0}</p>
                </div>
                <div className="text-center col-span-2 md:col-span-1 mt-2 md:mt-0">
                  <p className="text-xs text-gray-500 font-semibold mb-1">หน่วยกิตที่ขอลงเพิ่ม</p>
                  <p className="text-xl font-bold text-blue-600">{data.total_credits_requested || 0}</p>
                </div>
              </div>

              {/* เงื่อนไขและประวัติ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-semibold text-gray-600 mb-1 border-b pb-1">เงื่อนไขการขอ:</p>
                  <p className="text-gray-800 font-medium">
                    {data.reason_category} 
                    {data.other_reason_text && <span className="text-gray-500 italic"> ({data.other_reason_text})</span>}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600 mb-1 border-b pb-1">ประวัติการลงเกิน:</p>
                  <p className={`font-medium ${data.past_overload_status === 'ไม่เคยลงทะเบียนเกิน' ? 'text-green-600' : 'text-orange-600'}`}>
                    {data.past_overload_status} 
                    {data.past_overload_term && ` (เทอม ${data.past_overload_term}/${data.past_overload_year})`}
                  </p>
                </div>
              </div>

              {/* เหตุผลจากนักศึกษา */}
              <div className="bg-gray-50 p-3 rounded mt-2 border border-gray-100">
                <p className="font-semibold text-gray-700 mb-1">เหตุผลความจำเป็น:</p>
                <p className="text-gray-700 whitespace-pre-wrap">{data.request_reason || 'ไม่มีการระบุเหตุผล'}</p>
              </div>
            </div>
          </div>
        ) : (
          /* --- ส่วนแสดงผลคำร้องแบบทั่วไป (เผื่ออนาคตมีฟอร์มอื่น) --- */
          <div className="bg-white p-4 rounded border shadow-sm">
            <h3 className="font-bold text-gray-800 mb-2 border-b pb-2">รายละเอียดคำร้องทั่วไป</h3>
            <p className="text-md font-semibold text-indigo-700">เรื่อง: {data?.subject || 'ไม่ระบุ'}</p>
            <div className="mt-3 bg-gray-50 p-3 rounded border">
              <p className="font-semibold text-gray-600 mb-1">เหตุผล:</p>
              <p className="whitespace-pre-wrap text-gray-800">{data?.request_reason || 'ไม่ระบุ'}</p>
            </div>
          </div>
        )}

      </div>
    );
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-xl font-bold text-indigo-600">กำลังโหลดเอกสาร...</div>;

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
                return (
                  <tr key={item.step_id} className="hover:bg-indigo-50 transition-colors">
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(item.submitted_at).toLocaleDateString('th-TH', {
                          day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-800">{item.student_name}</div>
                      <div className="text-xs text-gray-500">{item.department_name}</div>
                    </td>
                    <td className="p-4 text-sm font-medium text-indigo-600">
                      {dataPreview?.subject || 'เอกสารคำร้องทั่วไป'}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full text-sm font-bold shadow-md transition-all active:scale-95"
                        onClick={() => setSelectedItem(item)}
                      >
                        เปิดดูเอกสาร
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="4" className="p-16 text-center text-gray-500 font-medium">
                    <div className="text-4xl mb-4">📄</div>
                    ยังไม่มีคำร้องที่รอให้คุณอนุมัติในขณะนี้ค่ะ
                  </td>
                </tr>
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
              <button 
                className="text-indigo-200 hover:text-white text-3xl leading-none transition" 
                onClick={() => { setSelectedItem(null); setComment(''); }}
              >
                &times;
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                {renderDetail(selectedItem)}

                <div className="mt-6 bg-white p-4 rounded-lg border shadow-sm">
                  <label className="font-bold text-gray-800 text-sm">
                    ข้อเสนอแนะ / หมายเหตุ (บังคับกรอกเมื่อปฏิเสธหรือให้แก้ไข)
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md p-3 mt-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition"
                    rows="3"
                    placeholder="พิมพ์ความเห็นของท่านที่นี่..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                </div>
            </div>

            {/* ส่วนของปุ่ม Action */}
            <div className="bg-gray-100 px-6 py-4 border-t flex gap-3 justify-end">
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-bold shadow transition active:scale-95"
                onClick={() => handleAction(selectedItem.step_id, 'REJECTED')}
              >
                ไม่อนุมัติ (Reject)
              </button>
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2.5 rounded-lg font-bold shadow transition active:scale-95"
                onClick={() => handleAction(selectedItem.step_id, 'NEED_REVISION')}
              >
                ส่งกลับแก้ไข
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-lg font-bold shadow transition active:scale-95"
                onClick={() => handleAction(selectedItem.step_id, 'APPROVED')}
              >
                อนุมัติ (Approve)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApproverDashboard;