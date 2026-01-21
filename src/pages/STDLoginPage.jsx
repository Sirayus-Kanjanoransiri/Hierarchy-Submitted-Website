import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function LoginPage({ setUser }) {
  // State
  const [identification_id, setIdentificationId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // เคลียร์ error เก่าก่อน

    const dataToSend = {
      username: identification_id, 
      password: password,
    };

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (response.ok) {
        // รวม role เข้าไปใน object user เพื่อความสะดวกในการใช้งาน
        const userDataWithRole = { ...data.user, role: data.role };
        
        // อัปเดต State หลัก และ LocalStorage
        setUser(userDataWithRole);
        localStorage.setItem("user", JSON.stringify(userDataWithRole));

        // --- Routing แยกตาม Role ---
        switch (data.role) {
            case 'staff':
                navigate("/staff-dashboard");
                break;
            case 'approver':
                navigate("/approver-dashboard");
                break;
            case 'student':
                navigate("/forms"); // หรือหน้า dashboard ของนักเรียน
                break;
            default:
                navigate("/"); // กรณี role แปลกปลอม
        }

      } else {
        setErrorMessage(data.message || "เข้าสู่ระบบไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setErrorMessage("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center">
          <img
            src="/images/RMUTTO_LOGO.png"
            alt="RMUTTO Logo"
            className="h-24 w-auto object-contain"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/96x96/4A5568/FFFFFF?text=LOGO" }}
          />
           {/* ถ้ามี Logo ที่ 2 ก็ใส่ตรงนี้ */}
          
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
            ระบบคำร้องออนไลน์
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            มหาวิทยาลัยเทคโนโลยีราชมงคลตะวันออก
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            
            {/* Username Field */}
            <div>
              <label htmlFor="identification_id" className="block text-sm font-medium text-gray-700">
                รหัสผู้ใช้งาน (นักศึกษา / เจ้าหน้าที่ / อาจารย์)
              </label>
              <input
                id="identification_id"
                name="identification_id"
                type="text"
                required
                value={identification_id}
                onChange={(e) => setIdentificationId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="ระบุรหัสประจำตัว หรือ Username"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                รหัสผ่าน
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="ระบุรหัสผ่าน"
              />
            </div>
          </div>

          {/* Error Message Area */}
          {errorMessage && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  {/* Icon X */}
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">เกิดข้อผิดพลาด</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{errorMessage}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
            >
              เข้าสู่ระบบ
            </button>
          </div>

          <div className="text-center mt-4">
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500 text-sm"
            >
              ยังไม่มีบัญชีนักศึกษา? ลงทะเบียนที่นี่
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;