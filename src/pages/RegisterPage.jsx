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
    std_id: '',
    std_password: '',
    std_confirmPassword: '',
    std_prefix: '',
    std_name: '',
    std_faculty: '', // Correct state key
    std_department: '',
    std_address_no: '',
    std_address_moo: '',
    std_address_soi: '',
    std_address_street: '',
    std_address_tumbol: '',
    std_address_amphoe: '',
    std_province: '',
    std_postcode: '',
    std_tel: '',
    std_facebook: '',
    std_email: '',
    std_STATUS: '',
    program_id: '',
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
      std_faculty: selectedFaculty?.value || "", // Set faculty value
      std_department: "", // Reset department
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
    if (formData.std_password !== formData.std_confirmPassword) {
      setErrorMessage('รหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      // NOTE: This fetch call assumes a server is running at http://localhost:5000/register
      // Ensure the server is running and accessible.
      const response = await fetch('http://localhost:5000/register', {
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
                <label htmlFor="std_id" className="block text-sm font-semibold text-gray-700">
                  รหัสประจำตัว <span className="text-red-500">*</span>
                </label>
                <input
                  id="std_id"
                  name="std_id"
                  type="text"
                  required
                  value={formData.std_id}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                  placeholder="กรุณากรอกรหัสประจำตัว"
                />
              </div>
              <div>
                <label htmlFor="std_prefix" className="block text-sm font-semibold text-gray-700">
                  คำนำหน้า <span className="text-red-500">*</span>
                </label>
                <select
                  id="std_prefix"
                  name="std_prefix"
                  required
                  value={formData.std_prefix}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white transition duration-150"
                >
                  <option value="">เลือกคำนำหน้า</option>
                  <option value="นาย">นาย</option>
                  <option value="นาง">นาง</option>
                  <option value="นางสาว">นางสาว</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="std_name" className="block text-sm font-semibold text-gray-700">
                ชื่อ-นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                id="std_name"
                name="std_name"
                type="text"
                required
                value={formData.std_name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                placeholder="กรุณากรอกชื่อ-นามสกุล"
              />
            </div>

            <div>
              <label htmlFor="std_email" className="block text-sm font-semibold text-gray-700">
                อีเมล <span className="text-red-500">*</span>
              </label>
              <input
                id="std_email"
                name="std_email"
                type="email"
                required
                value={formData.std_email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                placeholder="กรุณากรอกอีเมล"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="std_password" className="block text-sm font-semibold text-gray-700">
                  รหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <input
                  id="std_password"
                  name="std_password"
                  type="password"
                  required
                  value={formData.std_password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                  placeholder="กรุณากรอกรหัสผ่าน"
                />
              </div>
              <div>
                <label htmlFor="std_confirmPassword" className="block text-sm font-semibold text-gray-700">
                  ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <input
                  id="std_confirmPassword"
                  name="std_confirmPassword"
                  type="password"
                  required
                  value={formData.std_confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                  placeholder="กรุณายืนยันรหัสผ่าน"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="std_faculty" className="block text-sm font-semibold text-gray-700">
                  คณะ <span className="text-red-500">*</span>
                </label>
                <select
                  id="std_faculty"
                  name="std_faculty" // CORRECTED: Changed name from "faculty" to "std_faculty"
                  required
                  value={formData.std_faculty} // CORRECTED: Changed value from "formData.faculty" to "formData.std_faculty"
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
                <label htmlFor="std_department" className="block text-sm font-semibold text-gray-700">
                  ภาควิชา <span className="text-red-500">*</span>
                </label>
                <select
                  id="std_department"
                  name="std_department"
                  required
                  value={formData.std_department}
                  onChange={handleChange}
                  disabled={!formData.std_faculty}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 transition duration-150"
                >
                  <option value="">เลือกภาควิชา</option>
                  {departments.map(department => (
                    <option key={department.value} value={department.value}>{department.display}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="program_id" className="block text-sm font-semibold text-gray-700">
                หลักสูตร <span className="text-red-500">*</span>
              </label>
              <select
                id="program_id"
                name="program_id"
                value={formData.program_id}
                required
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white transition duration-150"
              >
                <option value="">เลือกหลักสูตร</option>
                <option value="1">ภาคปกติ</option>
                <option value="2">ภาคมสทบ(จ-ศ)</option>
                <option value="3">ภาคสมทบ(ส-อ)</option>
              </select>
            </div>

            <div>
              <label htmlFor="std_tel" className="block text-sm font-semibold text-gray-700">
                เบอร์โทรศัพท์ <span className="text-red-500">*</span>
              </label>
              <input
                id="std_tel"
                name="std_tel"
                type="tel" // Use type tel for better mobile keyboard
                required
                value={formData.std_tel}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                placeholder="กรุณากรอกเบอร์โทรศัพท์"
              />
            </div>

            <div>
              <label htmlFor="std_facebook" className="block text-sm font-semibold text-gray-700">
                Facebook <span className="text-red-500">*</span>
              </label>
              <input
                id="std_facebook"
                name="std_facebook"
                type="text"
                required
                value={formData.std_facebook}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                placeholder="กรุณากรอก Facebook"
              />
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
                    <label htmlFor="std_address_no" className="block text-sm font-semibold text-gray-700">
                    บ้านเลขที่ <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="std_address_no"
                        name="std_address_no" // CORRECTED: Changed from std_adress_no to std_address_no
                        type="text"
                        required
                        value={formData.std_address_no}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        placeholder="กรุณากรอกบ้านเลขที่"
                    />
                </div>
                <div>
                    <label htmlFor="std_address_moo" className="block text-sm font-semibold text-gray-700">
                    หมู่ <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="std_address_moo"
                        name="std_address_moo" // CORRECTED: Changed from std_adress_moo to std_address_moo
                        type="text"
                        required
                        value={formData.std_address_moo}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        placeholder="กรุณากรอกหมู่"
                    />
                </div>
            </div>

            <div className='grid grid-cols-2 gap-3'>
                <div>
                    <label htmlFor="std_address_soi" className="block text-sm font-semibold text-gray-700">
                    ซอย <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="std_address_soi"
                        name="std_address_soi" // CORRECTED: Changed from std_adress_soi to std_address_soi
                        type="text"
                        required
                        value={formData.std_address_soi}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        placeholder="กรุณากรอกซอย"
                    />
                </div>
                <div>
                    <label htmlFor="std_address_street" className="block text-sm font-semibold text-gray-700">
                    ถนน <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="std_address_street"
                        name="std_address_street" 
                        type="text"
                        required
                        value={formData.std_address_street}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        placeholder="กรุณากรอกถนน"
                    />
                </div>
            </div>
            
            <div className='grid grid-cols-2 gap-3'>
                <div>
                    <label htmlFor="std_address_tumbol" className="block text-sm font-semibold text-gray-700">
                    ตำบล <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="std_address_tumbol"
                        name="std_address_tumbol" // CORRECTED: Changed from std_adress_tumbol to std_address_tumbol
                        type="text"
                        required
                        value={formData.std_address_tumbol}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        placeholder="กรุณากรอกตำบล"
                    />
                </div>
                <div>
                    <label htmlFor="std_address_amphoe" className="block text-sm font-semibold text-gray-700">
                    อำเภอ <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="std_address_amphoe"
                        name="std_address_amphoe" // CORRECTED: Changed from std_adress_amphoe to std_address_amphoe
                        type="text"
                        required
                        value={formData.std_address_amphoe}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        placeholder="กรุณากรอกอำเภอ"
                    />
                </div>
            </div>

            <div className='grid grid-cols-2 gap-3'>
                <div>
                    <label htmlFor="std_province" className="block text-sm font-semibold text-gray-700">
                    จังหวัด <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="std_province"
                        name="std_province"
                        type="text"
                        required
                        value={formData.std_province}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        placeholder="กรุณากรอกจังหวัด"
                    />
                </div>
                <div>
                    <label htmlFor="std_postcode" className="block text-sm font-semibold text-gray-700">
                    รหัสไปรษณีย์ <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="std_postcode"
                        name="std_postcode"
                        type="text"
                        required
                        value={formData.std_postcode}
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
