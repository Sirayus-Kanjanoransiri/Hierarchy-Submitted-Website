import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [formData, setFormData] = useState({
    identification_number: '',
    name: '',
    password: '',
    confirmPassword: '',
    email: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('รหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login');
      } else {
        setErrorMessage(data.message || 'การลงทะเบียนไม่สำเร็จ');
      }
    } catch (error) {
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="flex justify-center space-x-4">
            <img src="/images/RMUTTO_LOGO.png" alt="logo1" className="h-20 w-auto" />
            <img src="/images/RMUTTO_LOGO2.png" alt="logo2" className="h-20 w-auto" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 text-center">
            ลงทะเบียน
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="identification_number" className="block text-sm font-medium text-gray-700">
                รหัสประจำตัว
              </label>
              <input
                id="identification_number"
                name="identification_number"
                type="text"
                required
                value={formData.identification_number}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="กรุณากรอกรหัสประจำตัว"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                ชื่อ-นามสกุล
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="กรุณากรอกชื่อ-นามสกุล"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                อีเมล
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="กรุณากรอกอีเมล"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                รหัสผ่าน
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="กรุณากรอกรหัสผ่าน"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                ยืนยันรหัสผ่าน
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="กรุณายืนยันรหัสผ่าน"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-md bg-red-50 p-4 text-center">
              <p className="text-sm font-medium text-red-800">
                {errorMessage}
              </p>
            </div>
          )}

          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ลงทะเบียน
            </button>
            
            <div className="text-center">
              <Link 
                to="/login" 
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                มีบัญชีอยู่แล้ว? เข้าสู่ระบบที่นี่
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
