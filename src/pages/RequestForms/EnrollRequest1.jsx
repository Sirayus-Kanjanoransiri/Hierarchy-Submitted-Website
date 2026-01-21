import React, { useEffect, useState } from 'react';

const EnrollRequest1 = () => {
  const [userData, setUserData] = useState(null);
  
  // Existing data formatting logic
  const advisorFullName = userData?.approver_prefix
    ? `${userData.approver_prefix} ${userData.approver_name}`
    : 'ข้อมูลไม่สมบูรณ์ / No Advisor Data';
  const std_department = userData?.department_name
    ? `${userData.department_name}`
    : 'ข้อมูลไม่สมบูรณ์ / No Major Data';
  const std_faculty = userData?.faculty_name
    ? `${userData.faculty_name}`
    : 'ข้อมูลไม่สมบูรณ์ / No Faculty Data';
  const program_name = userData?.program_name
    ? `${userData.program_name}`
    : 'ข้อมูลไม่สมบูรณ์ / No Course Data';
  
  // Existing data fetching logic
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const studentId = localStorage.getItem('std_id') ? JSON.parse(localStorage.getItem('std_id')).user.std_id : null;
        // NOTE: The fetch URL is 'http://localhost:5000/user/${studentId}'
        // In a production environment, this should be a relative path or an absolute path to a real API endpoint.
        const response = await fetch(`/student/user/${studentId}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    fetchUserData();
  }, []);
  
  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-xl font-medium text-gray-700">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className='max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-lg my-10'>

      <h2 className='text-2xl font-bold text-gray-800 mb-6 text-center border-b pb-3'>
        ใบคำร้องขอลงทะเบียนเรียนเกินกว่าหน่วยกิตที่กำหนด
      </h2>

      <form className='space-y-6'>

        {/* Form Header / Subject */}
        <div className='flex justify-between items-center border-b pb-2'>
          <label className='font-semibold text-gray-700'>เรื่อง/Subject</label>
          <label className='text-lg font-medium text-blue-700'>
            ขอลงทะเบียนเรียนเกินกว่าหน่วยกิตที่กำหนด
          </label>
        </div>

        {/* To Advisor */}
        <div className='space-y-1'>
          <label className="block text-sm font-medium text-gray-700">เรียน/To</label>
          <input
            type="text"
            value={advisorFullName}
            disabled
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Student Info Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>

          <div className='space-y-1'>
            <label className="block text-sm font-medium text-gray-700">
              ข้าพเจ้า (นาย/นาง/นางสาว)/(Mr./Mrs./Miss)
            </label>
            <input
              type="text"
              value={userData.std_prefix + ' ' + userData.std_name}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 sm:text-sm"
            />
          </div>

          <div className='space-y-1'>
            <label className="block text-sm font-medium text-gray-700">
              รหัสนักศึกษา/Student ID
            </label>
            <input
              type="text"
              value={userData.std_id}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 sm:text-sm"
            />
          </div>

          <div className='space-y-1'>
            <label className="block text-sm font-medium text-gray-700">ชั้นปีที่/Year</label>
            <input 
              type="text" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

        </div> 
        
        {/* Course, Faculty, Major Info */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='space-y-1'>
              <label className="block text-sm font-medium text-gray-700">หลักสูตร/Course</label>
              <input
                type="text"
                value={program_name}
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 sm:text-sm"
              />
              <input
                type="hidden"
                name="program_id"
                value={userData.program_id}
              />
            </div>

            <div className='space-y-1'>
              <label className="block text-sm font-medium text-gray-700">คณะ/Faculty</label>
              <input
                type="text"
                value={std_faculty}
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 sm:text-sm"
              />
              <input
                type="hidden"
                name="std_faculty"
                value={userData.std_faculty}
              />
            </div>
            
            <div className='space-y-1'>
              <label className="block text-sm font-medium text-gray-700">สาขาวิชา/Major</label>
              <input
                type="text"
                value={std_department}
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 sm:text-sm"
              />
              <input
                type="hidden"
                name="std_department"
                value={userData.std_department}
              />
            </div>
        </div>
        
        {/* Contact Info Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>

          <div className='space-y-1'>
            <label className="block text-sm font-medium text-gray-700">โทรศัพท์มือถือ/Mobile</label>
            <input
              type="tel"
              value={userData.std_tel}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 sm:text-sm"
            />
          </div>

          <div className='space-y-1'>
            <label className="block text-sm font-medium text-gray-700">LINE ID</label>
            <input 
              type="text" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className='space-y-1'>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              value={userData.std_email}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 sm:text-sm"
            />
          </div>

        </div>

        <hr className="my-6"/>

        {/* Overload Details Section */}
        <div className='flex flex-col space-y-3 p-4 border rounded-lg bg-indigo-50/50'>

          {/* Note: The original label text says "ขอลงทะเบียนเรียนต่ำกว่าหน่วยกิตที่กำหนด" (request to register **less** than the defined credits) 
            while the form title says "ขอลงทะเบียนเรียน**เกินกว่า**หน่วยกิตที่กำหนด" (request to register **more** than the defined credits). 
            I've kept the original label text.
          */}
          <div className='text-base font-medium text-gray-700'>
            มีความประสงค์ ขอลงทะเบียนเรียนต่ำกว่าหน่วยกิตที่กำหนด จำนวน 
            <input 
              type="text" 
              className="inline-block mx-2 w-20 text-center border-b border-gray-400 focus:border-blue-500 focus:ring-0"
            /> 
            หน่วยกิต
          </div>
          
          <div className='flex flex-wrap gap-4 items-center'>
            <label className="text-sm font-medium text-gray-700">
              ในภาคการศึกษาที่ 
              <input 
                type="text" 
                className="inline-block mx-2 w-16 text-center border-b border-gray-400 focus:border-blue-500 focus:ring-0"
              />
            </label>
            
            <label className="text-sm font-medium text-gray-700">
              ปีการศึกษา 
              <input 
                type="text" 
                className="inline-block mx-2 w-16 text-center border-b border-gray-400 focus:border-blue-500 focus:ring-0"
              />
            </label>
            
            <label className="text-sm font-medium text-gray-700">
              รวมหน่วยกิตที่ลงทะเบียนในภาคการศึกษานี้ทั้งสิ้น 
              <input 
                type="text" 
                className="inline-block mx-2 w-16 text-center border-b border-gray-400 focus:border-blue-500 focus:ring-0"
              />
              หน่วยกิต
            </label>
            
            <label className="text-sm font-medium text-gray-700">
              เกรดเฉลี่ยสะสม (GPA) 
              <input 
                type="text" 
                className="inline-block mx-2 w-16 text-center border-b border-gray-400 focus:border-blue-500 focus:ring-0"
              />
            </label>
            
          </div>
          
        </div>
        
        {/* Reasons Checkboxes */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-lg bg-gray-50'>

            <div className='text-base font-semibold text-gray-800'>เนื่องจาก</div>
            
            <div className='md:col-span-2 space-y-2'>
              <div>
                <label className='inline-flex items-center text-sm font-medium text-gray-700'>
                  <input type="checkbox" className="form-checkbox text-blue-600 h-4 w-4 mr-2 rounded" />
                  ภาคการศึกษาสุดท้ายที่สำเร็จการศึกษาตามหลักสูตร
                </label>
              </div>

              <div className='flex items-center space-x-2'>
                <label className='inline-flex items-center text-sm font-medium text-gray-700'>
                  <input type="checkbox" className="form-checkbox text-blue-600 h-4 w-4 mr-2 rounded" />
                  อื่น ๆ ระบุ
                </label>
                <input 
                  type="text" 
                  className="px-2 py-1 border border-gray-300 rounded-md shadow-sm flex-grow focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

        </div>

        {/* Conditions Checkboxes */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-lg bg-gray-50'>

            <div className='text-base font-semibold text-gray-800'>ซึ่งเป็นไปตามเงื่อนไข ดังนี้</div>
            
            <div className='md:col-span-2 space-y-2'>
              <div className='flex flex-wrap items-center space-x-2'>
                <label className='inline-flex items-center text-sm font-medium text-gray-700'>
                  <input type="checkbox" className="form-checkbox text-blue-600 h-4 w-4 mr-2 rounded" />
                  เคยลงทะเบียนเรียนเกินกว่าหน่วยกิตที่กำหนด ในภาคการศึกษาที่
                </label>
                <input 
                  type="text" 
                  className="inline-block w-16 text-center border-b border-gray-400 focus:border-blue-500 focus:ring-0"
                />
                <label className='text-sm font-medium text-gray-700'>ปีการศึกษา</label>
                <input 
                  type="text" 
                  className="inline-block w-16 text-center border-b border-gray-400 focus:border-blue-500 focus:ring-0"
                />
              </div>

              <div>
                <label className='inline-flex items-center text-sm font-medium text-gray-700'>
                  <input type="checkbox" className="form-checkbox text-blue-600 h-4 w-4 mr-2 rounded" />
                  ไม่เคยลงทะเบียนเรียนเกินกว่าหน่วยกิตที่กำหนด
                </label>
              </div>           
            </div>

        </div>

        {/* Closing Statement and Signature */}
        <div className='mt-8 p-3 bg-gray-100 rounded text-sm text-gray-600 italic'>
          จึงเรียนมาเพื่อโปรดทราบ และพิจารณาดำเนินการต่อไป/For your consideration
        </div>

        <div className='text-right mt-8 space-y-1 font-medium'>
          <p className='text-gray-700'>ขอแสดงความนับถือ/Kind regards</p>
          {/* Placeholder for Signature line */}
          <p className='text-gray-700 pt-6 border-t border-dashed border-gray-400'>
            {userData.std_name}
          </p>
          
        </div>

        {/* Submit Button */}
        <div className='flex justify-center mt-8'>
          <button 
            type='submit'
            className='px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out'
          >
            ส่งคำร้อง
          </button>
        </div>

      </form>
    </div>
  );
}

export default EnrollRequest1;