import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function DailySummaryPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submissions, setSubmissions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // ดึงข้อมูลผู้ใช้เพื่อตรวจสอบสิทธิ์
    const user = JSON.parse(localStorage.getItem('user'));
    
    // หากไม่ใช่ staff และไม่ใช่ approver (หรือจะเพิ่มเงื่อนไขตรวจ Role ID ผู้อำนวยการทีหลังก็ได้ค่ะ)
    if (!user || (user.role !== 'staff' && user.role !== 'approver')) {
      alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
      navigate('/');
    }
  }, [navigate]);

  const fetchSummary = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/staff/api/daily-summary?date=${date}`);
      setSubmissions(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [date]);

  return (
    <div className="p-6 max-w-6xl mx-auto mt-10">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">รายงานสรุปคำร้องประจำวัน</h1>
        
        <div className="mb-6 flex items-center">
          <label className="mr-3 font-semibold text-gray-700">เลือกวันที่:</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-3 px-4 border-b text-center font-medium">รหัสคำร้อง</th>
                <th className="py-3 px-4 border-b text-center font-medium">เวลานำส่ง</th>
                <th className="py-3 px-4 border-b text-center font-medium">รหัสนักศึกษา</th>
                <th className="py-3 px-4 border-b text-center font-medium">ชื่อ-สกุล</th>
                <th className="py-3 px-4 border-b text-center font-medium">ประเภทคำร้อง</th>
                <th className="py-3 px-4 border-b text-center font-medium">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {submissions.length > 0 ? (
                submissions.map((item) => (
                  <tr key={item.submission_id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-center">{item.submission_id}</td>
                    <td className="py-3 px-4 text-center">{new Date(item.submitted_at).toLocaleTimeString('th-TH')}</td>
                    <td className="py-3 px-4 text-center">{item.student_id}</td>
                    <td className="py-3 px-4 text-center">{item.student_name}</td>
                    <td className="py-3 px-4 text-center">{item.form_name || 'ไม่ระบุ'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                        ${item.submission_status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                          item.submission_status === 'REJECTED' ? 'bg-red-100 text-red-800' : 
                          item.submission_status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {item.submission_status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    ไม่มีคำร้องในวันที่เลือก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DailySummaryPage;