import React from 'react';
import { Link } from 'react-router-dom';

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
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                  </svg>
                </div>
                <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  งานใหม่
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">อนุมัตินักศึกษา</h3>
              <p className="text-gray-600 mb-6">
                จัดการและอนุมัติบัญชีนักศึกษาใหม่ที่ลงทะเบียนและรอการยืนยัน
              </p>
              <Link to="/StudentApprovalPage" className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                ดำเนินการอนุมัติ
              </Link>
            </div>
            
            {/* Card 2: ข้อมูลนักศึกษา (คงเดิม) */}
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                   {/* Icon: User Group */}
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">ข้อมูลนักศึกษา</h3>
              <p className="text-gray-600 mb-6">
                ค้นหาและดูรายละเอียดข้อมูลพื้นฐานของนักศึกษาในคณะ
              </p>
              <button className="block w-full text-center bg-gray-100 text-gray-400 font-medium py-2 px-4 rounded-lg cursor-not-allowed">
                เร็วๆ นี้
              </button>
            </div>
            
            {/* Card 3: สถิติรายงาน (คงเดิม) */}
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-green-500">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                   {/* Icon: Chart Bar */}
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">รายงานสรุป</h3>
              <p className="text-gray-600 mb-6">
                ดูสถิติการยื่นคำร้องรายเดือนและสถานะการดำเนินการ
              </p>
              <button className="block w-full text-center bg-gray-100 text-gray-400 font-medium py-2 px-4 rounded-lg cursor-not-allowed">
                เร็วๆ นี้
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm">
            © {new Date().getFullYear()} มหาวิทยาลัยเทคโนโลยีราชมงคลตะวันออก (สำหรับผู้ดูแลระบบ)
          </p>
        </div>
      </footer>
    </div>
  );
}

export default StaffDashboard;