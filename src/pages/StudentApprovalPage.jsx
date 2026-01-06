import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function StudentApprovalPage() {
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchPendingStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/students/pending'); 
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setPendingStudents(data);
    } catch (err) {
      setError('ไม่สามารถดึงข้อมูลนักศึกษาที่รอดำเนินการได้');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingStudents();
  }, []);

<<<<<<< HEAD
  // ฟังก์ชันสำหรับอนุมัติ
  const handleApprove = async (student_id) => {
    if (!window.confirm(`ยืนยันการอนุมัติบัญชีนักศึกษา ID: ${student_id} ใช่หรือไม่?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/student/approve/${student_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Approval failed');
      }

      // รีเฟรชรายการหลังจากอนุมัติสำเร็จ
      alert(`อนุมัติ ID: ${student_id} เรียบร้อยแล้ว`);
      fetchPendingStudents();

    } catch (err) {
      alert('เกิดข้อผิดพลาดในการอนุมัติ: ' + err.message);
      console.error(err);
    }
=======
  // ฟังก์ชันส่งไปหน้าจัดการ (ยังไม่อนุมัติทันทีตามที่คุณต้องการ)
  const handleGoToManage = (student) => {
    // ส่งข้อมูลนักศึกษาผ่าน state ไปยังหน้า /manage-students เพื่อไปเลือกที่ปรึกษาหรือกดอนุมัติที่นั่น
    navigate('/manage-students', { state: { editStudent: student } });
>>>>>>> f2c43199c25e64d5bec79ab7a4d50ce638e9b68d
  };

  if (loading) return <div className="text-center mt-10 p-5 text-indigo-600 font-['Inter']">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-['Inter']">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">อนุมัติบัญชีนักศึกษาใหม่</h1>
          <Link to="/staff-dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium">
            &larr; กลับไปหน้า Dashboard
          </Link>
        </div>
        
        {pendingStudents.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow-md text-center border-t-4 border-green-500">
            <p className="text-gray-500 text-lg">ขณะนี้ไม่มีนักศึกษาที่รอการอนุมัติในระบบ</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border-t-4 border-indigo-600">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสนักศึกษา</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ - สกุล</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">คณะ / สาขาวิชา</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ข้อมูลติดต่อ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingStudents.map((student) => (
                    <tr key={student.student_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {student.student_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {student.full_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="font-medium text-gray-900">{student.faculty_name}</div>
                        <div className="text-xs text-gray-500">{student.department_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="text-xs">Email: {student.email}</div>
                        <div className="text-xs">Tel: {student.std_tel || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending (รออนุมัติ)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleGoToManage(student)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm"
                        >
                          ตรวจสอบและจัดการ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentApprovalPage;