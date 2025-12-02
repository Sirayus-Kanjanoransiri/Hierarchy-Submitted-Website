import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function LoginPage({ setUser }) {
  // ใช้ State เพียงชุดเดียวสำหรับ Input Field
  const [identification_id, setIdentificationId] = useState("");
  const [password, setPassword] = useState("");

  // State สำหรับการแสดงผลข้อผิดพลาด
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // ตรวจสอบว่าผู้ใช้กรอกข้อมูลครบถ้วนหรือไม่
    if (!identification_id || !password) {
      setErrorMessage("กรุณากรอกรหัสประจำตัวและรหัสผ่านให้ครบถ้วน");
      return;
    }

    // 2. เตรียมข้อมูลที่จะส่งไป Backend
    //    *ส่งค่าเดียวกันภายใต้ Key ทั้งสองชุด* เพื่อให้ Backend ทำการตรวจสอบทั้ง Student และ Staff
    const dataToSend = {
      std_id: identification_id, // ให้ Backend ตรวจสอบ Student
      std_password: password,
      staffs_id: identification_id, // ให้ Backend ตรวจสอบ Staff
      staff_password: password,
    };

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (response.ok) {
        // Backend ควรจะส่ง 'role' และ 'user' กลับมา
        // data.role จะเป็น 'student' หรือ 'staff'

        // เก็บข้อมูลผู้ใช้และ Role
        setUser(data.user);
        localStorage.setItem("user_data", JSON.stringify(data));

        // นำทางไปยังหน้าหลัก
        navigate("/main");
      } else {
        setErrorMessage(data.message || "เข้าสู่ระบบไม่สำเร็จ");
        console.error("Login failed:", data.message);
      }
    } catch (error) {
      setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ API หรือเซิร์ฟเวอร์");
      console.error("API Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <img
            src="/images/RMUTTO_LOGO.png"
            alt="logo1"
            className="h-24 w-auto"
          />

          <img
            src="/images/RMUTTO_LOGO2.png"
            alt="logo2"
            className="h-24 w-auto mt-4"
          />

          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            เข้าสู่ระบบ
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Input Field สำหรับ ID (ใช้ได้ทั้ง Student/Staff) */}
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label
                htmlFor="identification_id"
                className="block text-sm font-medium text-gray-700"
              >
                รหัสประจำตัว (นักเรียน/เจ้าหน้าที่)
              </label>
              <input
                id="identification_id"
                name="identification_id"
                type="text"
                required
                value={identification_id}
                onChange={(e) => setIdentificationId(e.target.value)}
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="กรุณากรอกรหัสประจำตัว"
              />
            </div>

            {/* Input Field สำหรับ Password */}
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                รหัสผ่าน
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="กรุณากรอกรหัสผ่าน"
              />
            </div>
          </div>

          {/* === Error Message === */}
          {errorMessage && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-12a1 1 0 102 0V9a1 1 0 10-2 0V6zm0 6a1 1 0 102 0 1 1 0 00-2 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* === Submit Button === */}
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            >
              เข้าสู่ระบบ
            </button>
          </div>

          <div className="text-sm text-center mt-4">
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              ยังไม่มีบัญชี? ลงทะเบียนที่นี่
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
