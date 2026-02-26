import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const GeneralRequestForm = () => {
  const [userData, setUserData] = useState(null);
  const [subject, setSubject] = useState('');
  const [requestReason, setRequestReason] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const [loadingSubmission, setLoadingSubmission] = useState(false);
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // ป้องกันข้อมูลว่างสำหรับแสดงผล
  const std_department = userData?.department_name
    ? `${userData.department_name}`
    : 'ข้อมูลไม่สมบูรณ์ / No Major Data';

  useEffect(() => {
    // 1. ตรวจสอบโหมด (สร้างใหม่ หรือ แก้ไข)
    const idFromQuery = searchParams.get('submissionId');
    
    const initializeData = async () => {
      // ดึงข้อมูลผู้ใช้ก่อน
      const user = await fetchUserData();
      
      // ถ้ามี ID ใน Query และดึงข้อมูลผู้ใช้สำเร็จ ให้ไปดึงข้อมูลคำร้องเก่า
      if (idFromQuery && user) {
        setIsEditMode(true);
        setSubmissionId(idFromQuery);
        fetchExistingSubmission(idFromQuery);
      }
    };

    initializeData();
  }, [searchParams]);

  // ฟังก์ชันดึงข้อมูลนักศึกษา
  const fetchUserData = async () => {
    try {
      const localUserRaw = localStorage.getItem('user');
      if (!localUserRaw) return null;

      const localUser = JSON.parse(localUserRaw);
      const studentCode = localUser.student_id;

      const response = await fetch(`/student/user/${studentCode}`);
      if (!response.ok) throw new Error('Failed to fetch user data');

      const data = await response.json();
      setUserData(data);
      return data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // 2. ฟังก์ชันดึงข้อมูลคำร้องเดิม (แก้ไขให้ตรงกับ Backend API)
  const fetchExistingSubmission = async (id) => {
    setLoadingSubmission(true);
    try {
      // ปรับให้ตรงกับ API: /api/submissions/detail?id=...
      const res = await fetch(`/student/api/submissions/detail?id=${id}`);
      if (!res.ok) throw new Error('Submission not found');

      const submission = await res.json();
      
      // Parse form_data เพราะใน DB เก็บเป็น JSON String
      const data = typeof submission.form_data === 'string'
        ? JSON.parse(submission.form_data)
        : submission.form_data;

      // เซ็ตข้อมูลลง State เพื่อให้โชว์ใน Input
      setSubject(data.subject || '');
      setRequestReason(data.request_reason || '');
    } catch (error) {
      console.error('Error loading submission:', error);
      alert('ไม่พบข้อมูลคำร้องเดิม');
      setIsEditMode(false);
    } finally {
      setLoadingSubmission(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userData?.id) {
      alert('ไม่พบข้อมูลนักศึกษา กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    if (!window.confirm("คุณยืนยันที่จะส่งคำร้องนี้ใช่หรือไม่?")) return;

    const formData = {
      subject: subject,
      request_reason: requestReason,
    };

    try {
      let response;

      if (isEditMode && submissionId) {
        // 3. ส่งไป Update (ต้องมี API รองรับการ UPDATE ใน Backend ด้วย)
        // ถ้ายังไม่มี API นี้ใน Backend ต้องสร้าง router.put('/api/submissions/:id')
        response = await fetch(`/student/api/submissions/${submissionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ form_data: formData }),
        });
      } else {
        // ส่งคำร้องใหม่
        response = await fetch('/student/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: userData.id,
            form_id: 1, // 1 = ใบคำร้องทั่วไป
            form_data: formData,
          }),
        });
      }

      if (response.ok) {
        alert(isEditMode ? 'แก้ไขคำร้องเรียบร้อยแล้ว' : 'ส่งคำร้องเรียบร้อยแล้ว');
        navigate('/submission-progress'); // ส่งเสร็จแล้วกลับไปหน้าติดตามสถานะ
      } else {
        const errorData = await response.json();
        alert(`เกิดข้อผิดพลาด: ${errorData.error || 'Unknown Error'}`);
      }
    } catch (error) {
      alert('ไม่สามารถติดต่อเซิร์ฟเวอร์ได้');
    }
  };

  if (!userData || loadingSubmission) {
    return <div className="p-8 text-center">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md my-10 border-t-4 border-blue-600">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">
        {isEditMode ? 'แก้ไขใบคำร้องทั่วไป' : 'ใบคำร้องทั่วไป'}
      </h2>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-bold text-gray-700">เรื่อง/Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 block w-full border-gray-400 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-blue-50 p-2"
            required
            placeholder="เช่น ขอถอนรายวิชาล่าช้า"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700">เรียน/To</label>
          <input type="text" value="คณบดี" disabled className="mt-1 block w-full bg-gray-100 p-2 rounded-md border text-gray-500" />
        </div>

        {/* ข้อมูลส่วนตัวแสดงโชว์เฉยๆ */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <p className="text-sm font-bold text-blue-800 mb-2">ข้อมูลผู้ส่งคำร้อง</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span className="font-semibold">ชื่อ-นามสกุล:</span> {userData.full_name}</div>
            <div><span className="font-semibold">รหัสนักศึกษา:</span> {userData.student_id}</div>
            <div><span className="font-semibold">สาขาวิชา:</span> {std_department}</div>
            <div><span className="font-semibold">อีเมล:</span> {userData.email}</div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700">มีความประสงค์/Would like to (เหตุผล)</label>
          <textarea
            rows={5}
            value={requestReason}
            onChange={(e) => setRequestReason(e.target.value)}
            className="mt-1 block w-full border-gray-400 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-blue-50 p-2"
            required
          />
        </div>

        <div className="flex justify-center space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="px-10 py-2 bg-blue-600 text-white font-bold rounded-md shadow hover:bg-blue-700 transition-colors"
          >
            {isEditMode ? 'บันทึกการแก้ไข' : 'ยืนยันส่งคำร้อง'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GeneralRequestForm;