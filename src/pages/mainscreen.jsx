import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Mainscreen() {
  const [submissions, setSubmissions] = useState([]);

  const handleFetchSubmissions = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/submissions');
      const data = await res.json();
      setSubmissions(data);
    } catch (err) {
      alert(err.message);
    }
  };

  const renderFormData = (formData) => {
  if (!formData || Object.keys(formData).length === 0) {
    return <span className="text-gray-500 italic">ไม่มีรายละเอียด</span>;
  }

  return Object.entries(formData).map(([key, value]) => {
    // ถ้าเป็น object (เช่น student_info)
    if (typeof value === 'object' && value !== null) {
      return (
        <div key={key} className="mb-2">
          <div className="font-semibold text-gray-800">{key}</div>
          <div className="ml-4 text-sm text-gray-700">
            {Object.entries(value).map(([subKey, subValue]) => (
              <div key={subKey}>
                <b>{subKey}</b>: {String(subValue)}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // ค่าธรรมดา
    return (
      <div key={key}>
        <b>{key}</b>: {String(value)}
      </div>
    );
  });
};

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-blue-800 mb-6">
        ระบบคำร้องออนไลน์
      </h1>

      {/* เมนู */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
        {[
          ['All Form Pages', '/forms'],
          ['Approver Management', '/manage-approvers'],
          ['Department Management', '/manage-departments'],
          ['Faculty Management', '/manage-faculty'],
          ['Edit Personal Info', '/edit-personal-info'],
          ['Staff Dashboard', '/staff-dashboard'],
          ['Student Approval Page', '/StudentApprovalPage'],
          ['Student Management', '/manage-students'],
          ['Student Search', '/student-info'],
          ['Contact Page', '/contact'],
        ].map(([label, path]) => (
          <Link
            key={path}
            to={path}
            className="
              bg-white border border-gray-300
              rounded-md p-4
              text-gray-800 font-medium
              hover:bg-gray-50
              shadow-sm
            "
          >
            {label}
          </Link>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-blue-700 mb-4">
        รายการคำร้องที่รอพิจารณา
      </h2>

      <div className="flex gap-6">
        {/* ตาราง */}
        <div className="flex-1 bg-white border border-gray-300 rounded-md shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-3 py-2 text-left">ลำดับ</th>
                <th className="border px-3 py-2 text-left">ชื่อคำร้อง</th>
                <th className="border px-3 py-2 text-left">สถานะ</th>
                <th className="border px-3 py-2 text-left">รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-500">
                    ไม่มีข้อมูลคำร้อง
                  </td>
                </tr>
              ) : (
                submissions.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{idx + 1}</td>
                    <td className="border px-3 py-2">{item.form_id}</td>
                    <td className="border px-3 py-2">{item.submission_status}</td>
                    <td className="border px-3 py-2">
                      {renderFormData(item.form_data)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ผู้อนุมัติ */}
        <div className="w-64 bg-white border border-gray-300 rounded-md p-4 shadow-sm">
          <h3 className="font-semibold mb-4 text-gray-800">
            ขั้นตอนการอนุมัติ
          </h3>

          <div className="space-y-2">
            <button
              onClick={handleFetchSubmissions}
              className="
                w-full px-3 py-2
                bg-blue-700 text-white
                rounded-md
                hover:bg-blue-800
                text-left
              "
            >
              อาจารย์ที่ปรึกษา
            </button>

            {[
              'หัวหน้าแผนก',
              'เจ้าหน้าที่สารบัญ',
              'รองคณบดี',
              'คณบดี',
              'งานทะเบียน',
            ].map((label) => (
              <button
                key={label}
                className="
                  w-full px-3 py-2
                  bg-gray-200
                  rounded-md
                  hover:bg-gray-300
                  text-left
                "
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

    {/* Footer     */}
    <footer className="w-full mt-12 flex justify-center">
      <div className="text-red-600 text-2xl font-extrabold text-center">
        หน้านี้จัดทำขึ้นเพื่อวัตถุประสงค์ในการพัฒนาระบบเท่านั้น และจะไม่ปรากฏในเวอร์ชันใช้งานจริง
      </div>
    </footer>

    </div>

    
  );
}

export default Mainscreen;
