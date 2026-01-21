import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// เพิ่มช่องแนบบัตรนศึกษา และ รอแอดมินมาอนุมัติ

// Data for faculties and departments (Thai)
const facultyDepartmentData = [
  { display: "บริหารธุรกิจและเทคโนโลยีสารสนเทศ", value: "1", departments: [
    { display: "การบัญชี", value: "1" },
    { display: "การตลาด", value: "2" },
    { display: "การจัดการ", value: "3" },
    { display: "เศรษฐศาสตร์", value: "4" },
    { display: "ระบบสารสนเทศ", value: "5" },
    { display: "เทคโนโลยีสารสนเทศ", value: "6" },
    { display: "วิทยาการคอมพิวเตอร์", value: "7" },
    { display: "เทคโนโลยีการโฆษณาและประชาสัมพันธ์", value: "8" },
    { display: "เทคโนโลยีโลจิสติกส์และการจัดการระบบขนส่ง", value: "9" },
    { display: "เทคโนโลยีมัลติมีเดีย", value: "10" },
    { display: "นวัตกรรมและธุรกิจดิจิทัล", value: "11" },
    { display: "BUSIT INTER", value: "12" },
  ]},
  { display: "ศิลปศาสตร์", value: "2", departments: [
    { display: "ภาษาอังกฤษเพื่อการประกอบธุรกิจและการสื่อสารนานาชาติ", value: "13" },
    { display: "ภาษาจีนเพื่ออุตสาหกรรมบริการ", value: "14" },
    { display: "นวัตกรรมการท่องเที่ยวและการโรงแรม", value: "15" },
    { display: "การจัดการธุรกิจและเทคโนโลยี กีฬาอีสปอร์ต", value: "16" },
    { display: "การจัดการทุนมนุษย์และนวัตกรรมสังคม", value: "17" },
  ]},
];

function RegisterPage() {
  const [formData, setFormData] = useState({
    student_id: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    department_id: '',
    email: '',
    address_no: '',
    address_moo: '',
    address_soi: '',
    address_street: '',
    address_subdistrict: '',
    address_district: '',
    address_province: '',
    address_postcode: '',
  });
  const [departments, setDepartments] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  // useNavigate is generally used with React Router, assuming it's correctly set up.
  const navigate = useNavigate(); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value, // Dynamically update the field based on the input's name
    }));
  };

  const handleFacultyChange = (e) => {
    const selectedFaculty = facultyDepartmentData.find(faculty => faculty.value === e.target.value);
    setFormData(prevState => ({
      ...prevState,
      department_id: "", // Reset department
    }));
    setDepartments(selectedFaculty?.departments || []); // Update departments
  };

  const handleSubmit = async (e) => {
    // This is the critical part that prevents page reload and executes the logic.
    e.preventDefault(); 
    setErrorMessage('');

    console.log('handleSubmit triggered'); // Debugging log
    console.log('Form data being sent:', formData); // Debugging log

    // Check if passwords match using the correct state keys
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('รหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      const response = await fetch('/student/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Fetch request sent to /register'); // Debugging log

      const data = await response.json();

      console.log('Response from server:', data); // Debugging log

      if (response.ok) {
        // Successful registration, navigate to home page (or login page)
        navigate('/');
      } else {
        // Display error message from server or a generic one
        setErrorMessage(data.message || 'การลงทะเบียนไม่สำเร็จ');
      }
    } catch (error) {
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center px-4 sm:px-6 lg:px-8 font-['Inter']">

      {/* CRITICAL FIX: The entire form content (left, right columns, and button) is now wrapped
        in a single <form> tag to ensure the submit button triggers the handler.
      */}
      <form onSubmit={handleSubmit} className="max-w-3xl w-full bg-white rounded-xl shadow-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Left Column: Registration Form */}
        <div>
          <div className="flex flex-col items-center mb-6 border-b pb-4 border-gray-200">
            <h2 className="text-3xl font-extrabold text-gray-800 text-center">
              ลงทะเบียน 
              <br />(ข้อมูลส่วนตัว)
            </h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="student_id" className="block text-sm font-semibold text-gray-700">
                  รหัสประจำตัว <span className="text-red-500">*</span>
                </label>
                <input
                  id="student_id"
                  name="student_id"
                  type="text"
                  required
                  value={formData.student_id}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                  placeholder="กรุณากรอกรหัสประจำตัว"
                />
              </div>
              <div>
                <label htmlFor="full_name" className="block text-sm font-semibold text-gray-700">
                  ชื่อ-นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                  placeholder="กรุณากรอกชื่อ-นามสกุล"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                อีเมล <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                placeholder="กรุณากรอกอีเมล"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  รหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                  placeholder="กรุณากรอกรหัสผ่าน"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                  ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                  placeholder="กรุณายืนยันรหัสผ่าน"
                />
              </div>
            </div>

            <div>
              <label htmlFor="faculty" className="block text-sm font-semibold text-gray-700">
                คณะ <span className="text-red-500">*</span>
              </label>
              <select
                id="faculty"
                name="faculty"
                required
                onChange={handleFacultyChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white transition duration-150"
              >
                <option value="">เลือกคณะ</option>
                {facultyDepartmentData.map(faculty => (
                  <option key={faculty.value} value={faculty.value}>{faculty.display}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="department_id" className="block text-sm font-semibold text-gray-700">
                สาขา <span className="text-red-500">*</span>
              </label>
              <select
                id="department_id"
                name="department_id"
                required
                value={formData.department_id}
                onChange={handleChange}
                disabled={departments.length === 0}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 transition duration-150"
              >
                <option value="">เลือกสาขา</option>
                {departments.map(department => (
                  <option key={department.value} value={department.value}>{department.display}</option>
                ))}
              </select>
            </div>
            
          </div>
        </div>

        {/* Right Column: Address Form */}
        <div>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-800 text-center mb-6 border-b pb-4 border-gray-200">
            ที่อยู่
          </h2>
          <div className="space-y-4">
            
            <div className='grid grid-cols-2 gap-3'>
                <div>
                    <label htmlFor="address_no" className="block text-sm font-semibold text-gray-700">
                    บ้านเลขที่ <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="address_no"
                        name="address_no"
                        type="text"
                        required
                        value={formData.address_no}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        placeholder="กรุณากรอกบ้านเลขที่"
                    />
                </div>
                <div>
                    <label htmlFor="address_moo" className="block text-sm font-semibold text-gray-700">
                    หมู่ <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="address_moo"
                        name="address_moo"
                        type="text"
                        required
                        value={formData.address_moo}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        placeholder="กรุณากรอกหมู่"
                    />
                </div>
            </div>

            <div className='grid grid-cols-2 gap-3'>
                <div>
                    <label htmlFor="address_soi" className="block text-sm font-semibold text-gray-700">
                    ซอย <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="address_soi"
                        name="address_soi"
                        type="text"
                        required
                        value={formData.address_soi}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        placeholder="กรุณากรอกซอย"
                    />
                </div>
                <div>
                    <label htmlFor="address_street" className="block text-sm font-semibold text-gray-700">
                    ถนน <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="address_street"
                        name="address_street" 
                        type="text"
                        required
                        value={formData.address_street}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        placeholder="กรุณากรอกถนน"
                    />
                </div>
            </div>
            
            <div className='grid grid-cols-2 gap-3'>
                <div>
                    <label htmlFor="address_subdistrict" className="block text-sm font-semibold text-gray-700">
                    ตำบล <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="address_subdistrict"
                        name="address_subdistrict"
                        type="text"
                        required
                        value={formData.address_subdistrict}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        placeholder="กรุณากรอกตำบล"
                    />
                </div>
                <div>
                    <label htmlFor="address_district" className="block text-sm font-semibold text-gray-700">
                    อำเภอ <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="address_district"
                        name="address_district"
                        type="text"
                        required
                        value={formData.address_district}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        placeholder="กรุณากรอกอำเภอ"
                    />
                </div>
            </div>

            <div className='grid grid-cols-2 gap-3'>
                <div>
                    <label htmlFor="address_province" className="block text-sm font-semibold text-gray-700">
                    จังหวัด <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="address_province"
                        name="address_province"
                        type="text"
                        required
                        value={formData.address_province}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        placeholder="กรุณากรอกจังหวัด"
                    />
                </div>
                <div>
                    <label htmlFor="address_postcode" className="block text-sm font-semibold text-gray-700">
                    รหัสไปรษณีย์ <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="address_postcode"
                        name="address_postcode"
                        type="text"
                        required
                        value={formData.address_postcode}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        placeholder="กรุณากรอกรหัสไปรษณีย์"
                    />
                </div>
            </div>
          </div>
        </div>

        {/* Center: Error Message, Submit Button and Link - Now inside the <form> */}
        <div className="col-span-1 md:col-span-2 mt-6 flex flex-col items-center space-y-4">
          
          {errorMessage && (
            <div className="rounded-xl w-full max-w-sm bg-red-100 p-4 text-center border border-red-400">
              <p className="text-sm font-medium text-red-700">
                {errorMessage}
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full md:w-1/2 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 transform hover:scale-[1.02]"
          >
            ลงทะเบียน
          </button>
          <div className="text-center">
            <Link 
              to="/" 
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition duration-150"
            >
              มีบัญชีอยู่แล้ว? เข้าสู่ระบบที่นี่
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage;
