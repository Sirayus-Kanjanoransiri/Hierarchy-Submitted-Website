import React from 'react';
import { Link } from 'react-router-dom';

function IndexPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              All Student Request Forms
            </h1>
            <h2 className="text-3xl font-semibold text-blue-600 mb-6">
              แบบคำร้องทั้งหมด
            </h2>
            <p className="text-lg text-gray-700 mb-12 max-w-3xl mx-auto">
              ระบบ Algorithm ที่จะโชว์ใบคำร้องที่ถูกส่งมากที่สุด 5 อันดับ
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">คำร้องทั่วไป</h3>
              <p className="text-gray-600 mb-4">สำหรับคำร้องขอต่างๆ ที่ไม่อยู่ในหมวดหมู่เฉพาะ</p>
              <Link to="/requestforms/general" className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                ส่งคำร้อง
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">คำร้องลงทะเบียนเกิน</h3>
              <p className="text-gray-600 mb-4">สำหรับการขอลงทะเบียนเรียนเกินจำนวนหน่วยกิตที่กำหนด</p>
              <Link to="/requestforms/over-credit" className="inline-block bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                ส่งคำร้อง
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">คำร้องลงทะเบียนต่ำ</h3>
              <p className="text-gray-600 mb-4">สำหรับการขอลงทะเบียนเรียนต่ำกว่าจำนวนหน่วยกิตมาตรฐาน</p>
              <Link to="/requestforms/under-credit" className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                ส่งคำร้อง
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm">
            © {new Date().getFullYear()} มหาวิทยาลัยเทคโนโลยีราชมงคลตะวันออก
          </p>
        </div>
      </footer>
    </div>
  );
}

export default IndexPage;