import React, { useEffect, useState } from 'react';

const AcademicRequest6 = () => {
  const [userData, setUserData] = useState(null);
  const [subject, setSubject] = useState('');
  const [requestReason, setRequestReason] = useState('');

  const std_department = userData?.department_name
    ? `${userData.department_name}`
    : 'ข้อมูลไม่สมบูรณ์ / No Major Data';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const localUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
        const studentID = localUser?.student_id || null;
        const response = await fetch(`http://localhost:5000/user/${studentID}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchUserData();
  }, []);

  if (!userData) return <div>Loading...</div>;

  // ฟังก์ชันส่งฟอร์มไปยัง backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    // สร้าง JSON ของ form_data
    const formData = {
      subject,
      request_reason: requestReason,
      student_info: {
        full_name: userData.full_name,
        student_id: userData.student_id,
        department: std_department,
        address_no: userData.address_no,
        address_moo: userData.address_moo,
        address_soi: userData.address_soi,
        address_street: userData.address_street,
        address_subdistrict: userData.address_subdistrict,
        address_district: userData.address_district,
        address_province: userData.address_province,
        address_postcode: userData.address_postcode,
        email: userData.email,
      },
    };

    try {
      const response = await fetch('http://localhost:5000/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: userData.id, // ต้องใช้ id ของนักศึกษาใน DB
          form_id: 1, // ฟอร์ม "คำร้องทั่วไป"
          form_data: formData,
        }),
      });

      if (response.ok) {
        alert('ส่งฟอร์มเรียบร้อยแล้ว');
        // เคลียร์ฟิลด์หรือ redirect ตามต้องการ
        setSubject('');
        setRequestReason('');
      } else {
        alert('เกิดข้อผิดพลาดในการส่งฟอร์ม');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-6 text-center">ใบคำร้องทั่วไป</h2>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700">เรื่อง/Subject</label>
          <input
            type="text"
            name="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 block w-full border-gray-400 rounded-md shadow-md focus:ring-blue-600 focus:border-blue-600 bg-blue-50 text-gray-800"
            required
          />
        </div>

        {/* To */}
        <div>
          <label className="block text-sm font-medium text-gray-700">เรียน/To</label>
          <input
            type="text"
            placeholder={"คณบดีคณะสาขา " + std_department}
            disabled
            className="mt-1 block w-full border-gray-300 rounded-md shadow-md bg-gray-100 text-gray-500"
          />
        </div>

        {/* Student Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">ข้าพเจ้า (นาย/นาง/นางสาว)/(Mr./Mrs./Miss)</label>
            <input
              type="text"
              value={userData.full_name}
              disabled
              className="mt-1 block w-full border-gray-300 rounded-md shadow-md bg-gray-100 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">รหัสนักศึกษา/Student ID</label>
            <input
              type="text"
              value={userData.student_id}
              disabled
              className="mt-1 block w-full border-gray-300 rounded-md shadow-md bg-gray-100 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">สาขาวิชา/Major</label>
            <input
              type="text"
              value={std_department}
              disabled
              className="mt-1 block w-full border-gray-300 rounded-md shadow-md bg-gray-100 text-gray-500"
            />
          </div>

          {/* Address */}
          {['address_no', 'address_moo', 'address_soi', 'address_street', 'address_subdistrict', 'address_district', 'address_province', 'address_postcode', 'email'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700">{field}</label>
              <input
                type="text"
                value={userData[field] || ''}
                disabled
                className="mt-1 block w-full border-gray-300 rounded-md shadow-md bg-gray-100 text-gray-500"
              />
            </div>
          ))}
        </div>

        {/* Request Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700">มีความประสงค์/would like to</label>
          <textarea
            name="request_reason"
            rows={3}
            value={requestReason}
            onChange={(e) => setRequestReason(e.target.value)}
            className="mt-1 block w-full border-gray-400 rounded-md shadow-md focus:ring-blue-600 focus:border-blue-600 bg-blue-50 text-gray-800"
            required
          ></textarea>
        </div>

        {/* Submit */}
        <div className="text-center">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700"
          >
            ส่งคำร้อง
          </button>
        </div>
      </form>
    </div>
  );
};

export default AcademicRequest6;
