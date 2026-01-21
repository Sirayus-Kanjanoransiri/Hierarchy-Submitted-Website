import React, { useState, useEffect } from 'react';

function ApproverDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [comment, setComment] = useState("");
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

 const fetchSubmissions = async () => {
    setLoading(true); // เริ่มโหลดใหม่ทุกครั้งที่เรียก
    try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const approverId = storedUser?.id;
        
        if (!approverId) {
            setApiStatus('No approver logged in');
            return;
        }

        const response = await fetch(`/approver/api/submissions?approver_id=${approverId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setSubmissions(data);
        setApiStatus('OK');
    } catch (error) {
        console.error('Fetch error:', error);
        setApiStatus('Network/Server error');
    } finally {
        // ไม่ว่าจะสำเร็จหรือพัง ต้องเอาหน้าจอ "กำลังโหลด" ออก
        setLoading(false); 
    }
};

  const handleUpdateStatus = async (submissionId, newStatus) => {
    if (!comment && (newStatus === 'REJECTED' || newStatus === 'REVISION')) {
      alert("กรุณาใส่ความคิดเห็นเพื่อแจ้งนักศึกษา");
      return;
    }

    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const approverId = storedUser?.id;

      console.debug('ApproverDashBoard: updating status', { submissionId, newStatus, approverId });
      const response = await fetch(`/approver/api/submissions/${submissionId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus, 
          comment: comment,
          approver_id: approverId // ส่ง ID คนอนุมัติไปด้วย
        })
      });

      console.debug('ApproverDashBoard: update status response', response.status, response.statusText);
      if (response.ok) {
        alert("ดำเนินการเรียบร้อยแล้ว");
        setSelectedItem(null);
        setComment("");
        fetchSubmissions(); // โหลดรายการใหม่
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const renderFormDataDetails = (formData) => {
    const data = typeof formData === 'string' ? JSON.parse(formData) : formData;
    if (!data) return null;
    const student = data.student_info || {};

    return (
      <div className="space-y-4 text-sm">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-bold text-blue-800 mb-2">ข้อมูลผู้ส่งคำร้อง</h3>
          <p>ชื่อ: {student.full_name} ({student.student_id})</p>
          <p>สาขา: {student.department_name || student.department}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="font-bold mb-2">รายละเอียดเนื้อหา</h3>
          <p><strong>เรื่อง:</strong> {data.subject}</p>
          <p className="mt-2"><strong>เหตุผล:</strong> {data.request_reason}</p>
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-10 text-center">กำลังโหลดรายการ...</div>;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-blue-600 pl-4">รายการรอดำเนินการ</h1>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="p-4">วันที่ส่ง</th>
                <th className="p-4">นักศึกษา</th>
                <th className="p-4">ประเภทคำร้อง</th>
                <th className="p-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {submissions.length > 0 ? submissions.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-4">{new Date(item.submitted_at).toLocaleDateString('th-TH')}</td>
                  <td className="p-4 font-medium">{item.student_name}</td>
                  <td className="p-4 text-blue-600">{item.form_name}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => setSelectedItem(item)} className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">ตรวจทาน</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="p-10 text-center text-gray-500">ไม่มีคำร้องที่รอคุณอนุมัติในขณะนี้</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4 border-b pb-2">
              <h2 className="text-xl font-bold">พิจารณาคำร้อง</h2>
              <button onClick={() => setSelectedItem(null)} className="text-2xl">&times;</button>
            </div>
            
            {renderFormDataDetails(selectedItem.form_data)}

            <div className="mt-6 pt-4 border-t">
              <label className="block font-bold mb-2">ความคิดเห็น / เหตุผล</label>
              <textarea 
                className="w-full border p-2 rounded bg-yellow-50" 
                rows="3" 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="ระบุเหตุผลหากส่งแก้ไขหรือปฏิเสธ..."
              ></textarea>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <button onClick={() => handleUpdateStatus(selectedItem.id, 'APPROVED')} className="bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700">อนุมัติ</button>
                <button onClick={() => handleUpdateStatus(selectedItem.id, 'REVISION')} className="bg-orange-500 text-white py-2 rounded font-bold hover:bg-orange-600">ส่งแก้ไข</button>
                <button onClick={() => handleUpdateStatus(selectedItem.id, 'REJECTED')} className="bg-red-600 text-white py-2 rounded font-bold hover:bg-red-700">ปฏิเสธ</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApproverDashboard;