// import ReactDOM from 'react-dom/client';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function LoginPage({ setUser }) {
  const [std_id, setIdentification_number] = useState('');
  const [std_password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          std_id,
          std_password
        })
      });
      const data = await response.json();      navigate('/');
      if (response.ok) {
        setUser(data.user); 
        localStorage.setItem('std_id', JSON.stringify(data));
        navigate('/main');
      } else {
        setErrorMessage(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
        console.error('Login failed:', data.message);
      }
    } catch (error) {
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ API');
      console.error('API Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <img src="/images/RMUTTO_LOGO.png" alt="logo1" className="h-24 w-auto" />
          <img src="/images/RMUTTO_LOGO2.png" alt="logo2" className="h-24 w-auto mt-4" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            เข้าสู่ระบบ
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="std_id" className="block text-sm font-medium text-gray-700">
                รหัสประจำตัว
              </label>
              <input
                id="std_id"
                type="text"
                required
                value={std_id}
                onChange={(e) => setIdentification_number(e.target.value)}
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="กรุณากรอกรหัสประจำตัว"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="std_password" className="block text-sm font-medium text-gray-700">
                รหัสผ่าน
              </label>
              <input
                id="std_password"
                type="password"
                required
                value={std_password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="กรุณากรอกรหัสผ่าน"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              เข้าสู่ระบบ
            </button>
          </div>

          <div className="text-sm text-center mt-4">
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              ยังไม่มีบัญชี? ลงทะเบียนที่นี่
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;