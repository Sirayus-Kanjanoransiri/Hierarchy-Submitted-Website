import React, { useEffect, useState } from 'react';

const AcademicRequest6 = () => {
  const [userData, setUserData] = useState(null);
  const [subject, setSubject] = useState('');
  const [requestReason, setRequestReason] = useState('');

  // =========================
  // FIX 1: ป้องกัน department ว่าง
  // =========================
  const std_department = userData?.department_name
    ? `${userData.department_name}`
    : 'ข้อมูลไม่สมบูรณ์ / No Major Data';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const localUserRaw = localStorage.getItem('user');
        if (!localUserRaw) return;

        const localUser = JSON.parse(localUserRaw);

        // FIX 2: ใช้ student_id (STUxxx) ดึงข้อมูล แต่ backend ต้องส่ง id (PK) กลับมาด้วย
        const studentCode = localUser.student_id;
        if (!studentCode) return;

        const response = await fetch(`/student/user/${studentCode}`);
        if (!response.ok) throw new Error('Failed to fetch user data');

        const data = await response.json();

        // FIX 3: guard ข้อมูลสำคัญ
        if (!data.id) {
          console.error('Backend did not return student PK (id)');
        }

        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // FIX 4: guard ก่อนส่งจริง
    if (!userData?.id) {
      alert('ไม่พบข้อมูลนักศึกษา (student PK)');
      return;
    }

    if (!window.confirm("คุณยืนยันที่จะส่งคำร้องนี้ใช่หรือไม่?")) return;

    // FIX 5: form_data ครบและไม่พัง downstream
    const formData = {
      subject: subject,
      request_reason: requestReason,
    };

    try {
      const response = await fetch('/student/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: userData.id,   
          form_id: 1,
          form_data: formData
        }),
      });

      if (response.ok) {
        alert('ส่งฟอร์มและเริ่มกระบวนการอนุมัติเรียบร้อยแล้ว');
        setSubject('');
        setRequestReason('');
        console.log('Submitting form data:', formData);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown Error' }));
        alert(`เกิดข้อผิดพลาด: ${errorData.error || errorData.message}`);
      }
    } catch (error) {
      alert('ไม่สามารถติดต่อเซิร์ฟเวอร์ได้');
    }
  };

  if (!userData) {
    return <div className="p-8 text-center">Loading student data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md my-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">ใบคำร้องทั่วไป</h2>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Subject */}
        <div>
          <label className="block text-sm font-bold text-gray-700">เรื่อง/Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 block w-full border-gray-400 rounded-md shadow-md focus:ring-blue-600 focus:border-blue-600 bg-blue-50 text-gray-800 p-2"
            required
          />
        </div>

        {/* To */}
        <div>
          <label className="block text-sm font-bold text-gray-700">เรียน/To</label>
          <input
            type="text"
            value={"คณบดีคณะสาขา " + std_department}
            disabled
            className="mt-1 block w-full border-gray-300 rounded-md shadow-md bg-gray-100 text-gray-500 p-2"
          />
        </div>

        {/* Student Info */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="text-md font-bold mb-4 text-gray-800 border-b pb-2">
            ข้อมูลส่วนตัว / Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input disabled value={userData.full_name} className="mt-1 block w-full border-gray-300 rounded-md bg-gray-100 p-2" />
            <input disabled value={userData.student_id} className="mt-1 block w-full border-gray-300 rounded-md bg-gray-100 p-2" />
            <input disabled value={std_department} className="mt-1 block w-full border-gray-300 rounded-md bg-gray-100 p-2" />
            <input disabled value={userData.email || ''} className="mt-1 block w-full border-gray-300 rounded-md bg-gray-100 p-2" />
          </div>

          {/* Address */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 border-t pt-4">
            {[
              'address_no','address_moo','address_soi','address_street',
              'address_subdistrict','address_district','address_province','address_postcode'
            ].map((field) => (
              <div key={field}>
                <input
                  disabled
                  value={userData[field] ?? ''}
                  className="mt-1 block w-full border-gray-200 rounded-md bg-gray-50 text-gray-500 text-sm p-1"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-bold text-gray-700">มีความประสงค์/Would like to</label>
          <textarea
            rows={4}
            value={requestReason}
            onChange={(e) => setRequestReason(e.target.value)}
            className="mt-1 block w-full border-gray-400 rounded-md shadow-md focus:ring-blue-600 focus:border-blue-600 bg-blue-50 text-gray-800 p-2"
            required
          />
        </div>

        <div className="text-center pt-4">
          <button
            type="submit"
            className="px-10 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition-all active:scale-95"
          >
            ส่งคำร้อง (Submit Request)
          </button>
        </div>
      </form>
    </div>
  );
};

export default AcademicRequest6;
