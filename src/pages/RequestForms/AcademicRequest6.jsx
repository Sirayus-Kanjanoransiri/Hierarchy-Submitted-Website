import React, { useEffect, useState } from 'react';

const AcademicRequest6 = () => {
const [userData, setUserData] = useState(null);
const advisorFullName = userData?.approver_prefix
  ? `${userData.approver_prefix} ${userData.approver_name}`
  : 'ข้อมูลไม่สมบูรณ์ / No Advisor Data';
const std_department = userData?.department_name
  ? `${userData.department_name}`
  : 'ข้อมูลไม่สมบูรณ์ / No Major Data';
const std_faculty = userData?.faculty_name
  ? `${userData.faculty_name}`
  : 'ข้อมูลไม่สมบูรณ์ / No Faculty Data';
const program_name = userData?.program_name
  ? `${userData.program_name}`
  : 'ข้อมูลไม่สมบูรณ์ / No Course Data';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const studentId = localStorage.getItem('std_id') ? JSON.parse(localStorage.getItem('std_id')).user.std_id : null;
        const response = await fetch(`http://localhost:5000/user/${studentId}`);
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

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-6 text-center">ใบคำร้องทั่วไป</h2>

  <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">เรื่อง/Subject</label>
          <input
            type="text"
            name='subject'
            className="mt-1 block w-full border-gray-400 rounded-md shadow-md focus:ring-blue-600 focus:border-blue-600 bg-blue-50 text-gray-800"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">เรียน/To</label>
          <input
            type="text"
            value={advisorFullName}
            disabled
            className="mt-1 block w-full border-gray-300 rounded-md shadow-md bg-gray-100 text-gray-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">ข้าพเจ้า (นาย/นาง/นางสาว)/(Mr./Mrs./Miss)</label>
            <input
              type="text"
              value={userData.std_prefix + ' ' + userData.std_name}
              disabled
              className="mt-1 block w-full border-gray-300 rounded-md shadow-md bg-gray-100 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">รหัสนักศึกษา/Student ID</label>
            <input
              type="text"
              value={userData.std_id}
              disabled
              className="mt-1 block w-full border-gray-300 rounded-md shadow-md bg-gray-100 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">คณะ/Faculty</label>
            <input
              type="text"
              value={std_faculty}
              disabled
              className="mt-1 block w-full border-gray-300 rounded-md shadow-md bg-gray-100 text-gray-500"
            />
            <input
              type="hidden"
              name="std_faculty"  
              value={userData.std_faculty} // ค่า ID ที่คุณดึงมาจากฐานข้อมูล
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
            <input
              type="hidden"
              name="std_department"  
              value={userData.std_department} // ค่า ID ที่คุณดึงมาจากฐานข้อมูล
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">หลักสูตร/Course</label>
            <input
              type="text"
              value={program_name}
              disabled
              className="mt-1 block w-full border-gray-300 rounded-md shadow-md bg-gray-100 text-gray-500"
            />
            <input
              type="hidden"
              name="program_id"  // ชื่อฟิลด์ที่คุณจะใช้รับค่าในฝั่ง Server/API
              value={userData.program_id} // ค่า ID ที่คุณดึงมาจากฐานข้อมูล
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">ที่อยู่ปัจจุบันเลขที่/Number</label>
            <input
              type="text"
              value={userData.std_address_no}
              disabled
              className="mt-1 block w-full border-gray-300 rounded-md shadow-md bg-gray-100 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">หมู่ที่/Moo</label>
            <input
              type="text"
              value={userData.std_address_moo}
              disabled
              className="mt-1 block w-full border-gray-300 rounded-md shadow-md bg-gray-100 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">หมู่บ้าน/Mooban</label>
            <input
              type="text"
              value={userData.std_address_moo}
              disabled
              className="mt-1 block w-full border-gray-300 rounded-md shadow-md bg-gray-100 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">ซอย/Soi</label>
            <input
              type="text"
              value={userData.std_address_soi}
              disabled
              className="mt-1 block w-full border-gray-300 rounded-md shadow-md bg-gray-100 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">ถนน/Street</label>
            <input
              type="text"
              value={userData.std_address_street}
              disabled
              className="mt-1 block w-full border-gray-300 rounded-md shadow-md bg-gray-100 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">ตำบล/Tambon</label>
            <input
              type="text"
              value={userData.std_address_tambon}
              disabled
              className="mt-1 block w-full border-gray-300 rounded-md shadow-md bg-gray-100 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">อำเภอ/Amphoe</label>
            <input
              type="text"
              value={userData.std_address_amphoe}
              disabled
              className="mt-1 block w-full border-gray-300 rounded-md shadow-md bg-gray-100 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">จังหวัด/Province</label>
            <input
              type="text"
              value={userData.std_province}
              disabled
              className="mt-1 block w-full border-gray-300 rounded-md shadow-md bg-gray-100 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">รหัสไปรษณีย์/Post Code</label>
            <input
              type="text"
              value={userData.std_postcode}
              disabled
              className="mt-1 block w-full border-gray-300 rounded-md shadow-md bg-gray-100 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">โทรศัพท์มือถือ/Mobile</label>
            <input
              type="tel"
              value={userData.std_tel}
              disabled
              className="mt-1 block w-full border-gray-300 rounded-md shadow-md bg-gray-100 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Facebook (ชื่อ)</label>
            <input
              type="text"
              value={userData.std_facebook}
              disabled
              className="mt-1 block w-full border-gray-300 rounded-md shadow-md bg-gray-100 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              value={userData.std_email}
              disabled
              className="mt-1 block w-full border-gray-300 rounded-md shadow-md bg-gray-100 text-gray-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">มีความประสงค์/would like to</label>
          <textarea
            name='request_reason'
            rows={3}
            className="mt-1 block w-full border-gray-400 rounded-md shadow-md focus:ring-blue-600 focus:border-blue-600 bg-blue-50 text-gray-800"
            required
          ></textarea>
        </div>

        <div>
          <p className="text-sm text-gray-600">จึงเรียนมาเพื่อโปรดทราบ และพิจารณาดำเนินการต่อไป/For your consideration</p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">ขอแสดงความนับถือ/Kind regards</p>
          <p className="text-sm text-gray-600">{userData.std_name}</p>
        </div>

      </form>
    </div>
  );
};

export default AcademicRequest6;