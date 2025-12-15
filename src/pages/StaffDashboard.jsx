import React from "react";
import { Link } from "react-router-dom";

function StaffDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-['Inter']">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
              Staff Dashboard
            </h1>
            <h2 className="text-2xl font-semibold text-indigo-600 mb-6">
              ระบบบริหารจัดการสำหรับเจ้าหน้าที่
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              ยินดีต้อนรับเข้าสู่ระบบจัดการคำร้อง เลือกเมนูเพื่อดำเนินการ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {/* *** CARD 1: อนุมัตินักศึกษา (ที่ได้รับการปรับปรุง) *** */}
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-indigo-500">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-indigo-100 rounded-full">
                  {/* Icon: Clipboard Check (ใช้ไอคอนเดิม หรือเปลี่ยนถ้ามีไอคอนที่เหมาะสมกว่า) */}
                  <svg
                    className="w-8 h-8 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    ></path>
                  </svg>
                </div>
                <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  งานใหม่
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                อนุมัตินักศึกษา
              </h3>
              <p className="text-gray-600 mb-6">
                จัดการและอนุมัติบัญชีนักศึกษาใหม่ที่ลงทะเบียนและรอการยืนยัน
              </p>
              <Link
                to="/StudentApprovalPage"
                className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                ดำเนินการอนุมัติ
              </Link>
            </div>

            {/* Card 2: ข้อมูลนักศึกษา */}
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  {/* Icon: User Group */}
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    ></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ข้อมูลนักศึกษา
              </h3>
              <p className="text-gray-600 mb-6">
                ค้นหา ดูรายละเอียดประวัติ และสถานะของนักศึกษา
              </p>
              {/* เปลี่ยนจากปุ่มเร็วๆ นี้ เป็น Link */}
              <Link
                to="/student-info"
                className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                ค้นหาข้อมูล
              </Link>
            </div>

            {/* Card 3: สถิติรายงาน (คงเดิม) */}
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-green-500">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  {/* Icon: Chart Bar */}
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    ></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                รายงานสรุป
              </h3>
              <p className="text-gray-600 mb-6">
                ดูสถิติการยื่นคำร้องรายเดือนและสถานะการดำเนินการ
              </p>
              <button className="block w-full text-center bg-gray-100 text-gray-400 font-medium py-2 px-4 rounded-lg cursor-not-allowed">
                เร็วๆ นี้
              </button>
            </div>

            {/* *** CARD 4: จัดการข้อมูล Staff *** */}
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-yellow-500">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <svg
                    className="w-8 h-8 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    ></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                จัดการเจ้าหน้าที่
              </h3>
              <p className="text-gray-600 mb-6">
                เพิ่ม ลบ แก้ไข ข้อมูลเจ้าหน้าที่ในระบบ (Staff Management)
              </p>
              <Link
                to="/manage-staff"
                className="block w-full text-center bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                เข้าสู่เมนูจัดการ
              </Link>
            </div>

            {/* *** CARD 5: จัดการผู้อนุมัติ (Approvers) *** */}
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-teal-500">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-teal-100 rounded-full">
                  {/* Icon: User Check */}
                  <svg
                    className="w-8 h-8 text-teal-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                จัดการผู้อนุมัติ
              </h3>
              <p className="text-gray-600 mb-6">
                จัดการข้อมูลอาจารย์ที่ปรึกษา หัวหน้าสาขา และผู้อนุมัติอื่นๆ
              </p>
              <Link
                to="/manage-approvers"
                className="block w-full text-center bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                จัดการข้อมูล
              </Link>
            </div>

            {/* *** CARD 6: จัดการสาขาวิชา (Departments) *** */}
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-pink-500">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-pink-100 rounded-full">
                  {/* Icon: Office Building / Collection */}
                  <svg
                    className="w-8 h-8 text-pink-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    ></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                จัดการสาขาวิชา
              </h3>
              <p className="text-gray-600 mb-6">
                เพิ่ม/ลบ/แก้ไข รายชื่อสาขาวิชาและคณะที่สังกัด
              </p>
              <Link
                to="/manage-departments"
                className="block w-full text-center bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                จัดการข้อมูล
              </Link>
            </div>

            {/* *** CARD 7: จัดการคณะ (Faculty) *** */}
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-purple-500">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  {/* Icon: Academic Cap / Building */}
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    ></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                จัดการคณะ
              </h3>
              <p className="text-gray-600 mb-6">
                เพิ่ม/ลบ/แก้ไข รายชื่อคณะในมหาวิทยาลัย
              </p>
              <Link
                to="/manage-faculty"
                className="block w-full text-center bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                จัดการข้อมูล
              </Link>
            </div>

            {/* *** CARD 8: จัดการตำแหน่ง (Roles) *** */}
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-orange-500">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  {/* Icon: Identification / Badge */}
                  <svg
                    className="w-8 h-8 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                    ></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                จัดการตำแหน่ง
              </h3>
              <p className="text-gray-600 mb-6">
                เพิ่ม/ลบ/แก้ไข ชื่อตำแหน่งงาน (Roles) สำหรับกำหนดสิทธิ์
              </p>
              <Link
                to="/manage-roles"
                className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                จัดการข้อมูล
              </Link>
            </div>

            {/* *** CARD 9: จัดการนักศึกษา (Student CRUD) *** */}
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  {/* Icon: Academic / Student */}
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                จัดการนักศึกษา
              </h3>
              <p className="text-gray-600 mb-6">
                เพิ่ม/ลบ/แก้ไข ข้อมูลประวัตินักศึกษาและสถานะ
              </p>
              <Link
                to="/manage-students"
                className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                จัดการข้อมูล
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm">
            © {new Date().getFullYear()} มหาวิทยาลัยเทคโนโลยีราชมงคลตะวันออก
            (สำหรับผู้ดูแลระบบ)
          </p>
        </div>
      </footer>
    </div>
  );
}

export default StaffDashboard;
