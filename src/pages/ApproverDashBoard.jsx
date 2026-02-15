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

      // ปรับให้ตรงกับ Endpoint ที่เราแก้ใน Backend
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
    
    // บังคับใส่เหตุผลถ้าเป็น ปฏิเสธ หรือ ส่งกลับแก้ไข
    if ((action === 'REJECTED' || action === 'NEED_REVISION') && !comment.trim()) {
      alert('กรุณาใส่เหตุผลหรือรายละเอียดที่ต้องการให้แก้ไข');
      return;
    }

    if (!window.confirm(`ยืนยันการทำรายการ: ${action}?`)) return;

    try {
      const res = await fetch(`/approver/api/approver/process-action`, {
        method: 'POST', // เปลี่ยนเป็น POST ตาม API ใหม่
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step_id: stepId,
          approver_id: user.id, // ส่ง approver_id ไปด้วย
          action: action,
          note: comment
        })
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Update failed');

      alert('ดำเนินการเรียบร้อย');
      setSelectedItem(null);
      setComment('');
      fetchTasks(); // โหลดรายการใหม่
    } catch (err) {
      console.error(err);
      alert('บันทึกไม่สำเร็จ: ' + err.message);
    }
  };

  const renderDetail = (item) => {
    const data = typeof item.form_data === 'string'
      ? JSON.parse(item.form_data)
      : item.form_data;

    return (
      <div className="space-y-4 text-sm">
        <div className="bg-blue-50 p-4 rounded border">
          <h3 className="font-bold text-blue-800">ข้อมูลนักศึกษา</h3>
          <p>ชื่อ: {item.student_name}</p>
          <p>สาขา: {item.department_name}</p>
          <p className="text-blue-600 font-medium">ตำแหน่งของคุณในขั้นตอนนี้: {item.role_at_step}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded border">
          <h3 className="font-bold">รายละเอียดคำร้อง</h3>
          <p><b>เรื่อง:</b> {data?.subject || 'ไม่ระบุ'}</p>
          <p className="mt-2 whitespace-pre-wrap"><b>เหตุผล:</b> {data?.request_reason || 'ไม่ระบุ'}</p>
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-10 text-center">กำลังโหลด...</div>;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">งานที่รอคุณดำเนินการ</h1>

        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-4">วันที่ส่ง</th>
                <th className="p-4">นักศึกษา</th>
                <th className="p-4">แผนก</th>
                <th className="p-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length ? tasks.map(item => (
                <tr key={item.step_id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    {new Date(item.submitted_at).toLocaleDateString('th-TH', {
                        day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td className="p-4 font-medium">{item.student_name}</td>
                  <td className="p-4">{item.department_name}</td>
                  <td className="p-4 text-center">
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-1.5 rounded-full transition"
                      onClick={() => setSelectedItem(item)}
                    >
                      ตรวจสอบ
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-gray-500 italic">
                    ไม่มีคำร้องที่รอการอนุมัติในขณะนี้
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal จัดการคำร้อง */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6 border-b pb-2">
              <h2 className="font-bold text-xl text-gray-800">พิจารณาคำร้อง</h2>
              <button 
                className="text-gray-400 hover:text-gray-600 text-2xl" 
                onClick={() => { setSelectedItem(null); setComment(''); }}
              >
                &times;
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-2">
                {renderDetail(selectedItem)}

                <div className="mt-6">
                  <label className="font-bold text-gray-700">
                    ความคิดเห็น / เหตุผล (ระบุเมื่อปฏิเสธหรือส่งแก้ไข)
                  </label>
                  <textarea
                    className="w-full border rounded-md p-3 mt-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    rows="3"
                    placeholder="ใส่ข้อความที่นี่..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                </div>
            </div>

            {/* ส่วนของปุ่ม Action 3 ปุ่ม */}
            <div className="grid grid-cols-3 gap-3 mt-8">
              <button
                className="bg-green-600 hover:bg-green-700 text-white py-2.5 rounded font-bold transition"
                onClick={() => handleAction(selectedItem.step_id, 'APPROVED')}
              >
                อนุมัติ
              </button>
              
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded font-bold transition"
                onClick={() => handleAction(selectedItem.step_id, 'NEED_REVISION')}
              >
                ส่งกลับแก้ไข
              </button>

              <button
                className="bg-red-600 hover:bg-red-700 text-white py-2.5 rounded font-bold transition"
                onClick={() => handleAction(selectedItem.step_id, 'REJECTED')}
              >
                ปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApproverDashboard;