import React, { useState, useEffect } from 'react';

function StudentApprovalPage() {
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/students/pending'); 
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
      setPendingStudents(data);
    } catch (err) {
      setError('ไม่สามารถดึงข้อมูลนักศึกษาที่รอดำเนินการได้ โปรดตรวจสอบ Server API');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingStudents();
  }, []);

  // ฟังก์ชันสำหรับอนุมัติ
  const handleApprove = async (stdId) => {
    if (!window.confirm(`ยืนยันการอนุมัติบัญชีนักศึกษา ID: ${stdId} ใช่หรือไม่?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/student/approve/${stdId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Approval failed');
      }

      // รีเฟรชรายการหลังจากอนุมัติสำเร็จ
      alert(`อนุมัติ ID: ${stdId} เรียบร้อยแล้ว`);
      fetchPendingStudents();

    } catch (err) {
      alert('เกิดข้อผิดพลาดในการอนุมัติ: ' + err.message);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-10">
        <p className="text-xl text-indigo-600">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-10 p-5 text-red-700 bg-red-100 border border-red-400 rounded-lg">
        <p className="font-bold">Error:</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2">
          อนุมัติบัญชีนักศึกษา
        </h1>
        
        {pendingStudents.length === 0 ? (
          <div className="bg-green-50 border-l-4 border-green-400 text-green-700 p-4" role="alert">
            <p className="font-bold">เสร็จสมบูรณ์</p>
            <p>ขณะนี้ไม่มีนักศึกษาที่รอการอนุมัติในระบบ</p>
          </div>
        ) : (
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    รหัสนักศึกษา
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ชื่อ - สกุล
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    คณะ / สาขา
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ติดต่อ
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">อนุมัติ</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingStudents.map((student) => (
                  <tr key={student.std_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.std_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {student.std_prefix}{student.std_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {student.faculty_name} / {student.department_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      Email: {student.std_email}<br/>
                      Tel: {student.std_tel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleApprove(student.std_id)}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-md transition-colors"
                      >
                        อนุมัติ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentApprovalPage;