import React, { useEffect, useState } from 'react';

const ConfirmRegistrationForm = () => {
  const [userData, setUserData] = useState(null);
  
  const [studentType, setStudentType] = useState('ปกติ'); 
  const [yearOfStudy, setYearOfStudy] = useState('1'); 
  const [term, setTerm] = useState('1'); 
  const [academicYear, setAcademicYear] = useState(''); 
  const [requestReason, setRequestReason] = useState(''); 
  const [totalCredits, setTotalCredits] = useState(''); 
  
  const [courses, setCourses] = useState([
    { id: 1, courseCode: '', courseName: '', section: '', credits: '' },
    { id: 2, courseCode: '', courseName: '', section: '', credits: '' },
    { id: 3, courseCode: '', courseName: '', section: '', credits: '' },
    { id: 4, courseCode: '', courseName: '', section: '', credits: '' },
    { id: 5, courseCode: '', courseName: '', section: '', credits: '' },
  ]);

  const std_department = userData?.department_name || '';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const localUserRaw = localStorage.getItem('user');
        if (!localUserRaw) return;

        const localUser = JSON.parse(localUserRaw);
        const studentCode = localUser.student_id;
        if (!studentCode) return;

        const response = await fetch(`/student/user/${studentCode}`);
        if (!response.ok) throw new Error('Failed to fetch user data');

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleCourseChange = (id, field, value) => {
    setCourses(courses.map(course => 
      course.id === id ? { ...course, [field]: value } : course
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userData?.id) {
      alert('ไม่พบข้อมูลนักศึกษาในระบบ');
      return;
    }

    const filledCourses = courses.filter(c => c.courseCode.trim() !== '');

    if (filledCourses.length === 0) {
        alert('กรุณากรอกรายวิชาที่ต้องการขอยืนยันอย่างน้อย 1 วิชานะคะ');
        return;
    }

    if (!window.confirm("คุณยืนยันที่จะส่งคำร้องขอยืนยันการลงทะเบียนเรียนใช่หรือไม่?")) return;

    const formData = {
      subject: "ขอยืนยันการลงทะเบียนเรียน",
      student_type: studentType, 
      year_of_study: yearOfStudy, 
      term: term,
      academic_year: academicYear,
      request_reason: requestReason,
      total_credits_requested: totalCredits,
      courses_list: filledCourses 
    };

    try {
      const response = await fetch('/student/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: userData.id,   
          form_id: 5, // form_id = 5 สำหรับยืนยันการลงทะเบียน
          form_data: formData
        }),
      });

      if (response.ok) {
        alert('ส่งคำร้องสำเร็จ! ระบบได้ส่งเอกสารเพื่อรอการพิจารณาแล้วค่ะ');
        setAcademicYear('');
        setRequestReason('');
        setTotalCredits('');
        setCourses(courses.map(c => ({ ...c, courseCode: '', courseName: '', section: '', credits: '' })));
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown Error' }));
        alert(`เกิดข้อผิดพลาด: ${errorData.error || errorData.message}`);
      }
    } catch (error) {
      alert('ไม่สามารถติดต่อเซิร์ฟเวอร์ได้');
    }
  };

  if (!userData) return <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow-xl rounded-md my-10 border-t-8 border-emerald-600">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">ใบคำร้องขอยืนยันการลงทะเบียนเรียน</h2>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <span className="font-bold w-24">เรื่อง/Subject:</span>
            <span>ขอยืนยันการลงทะเบียนเรียน</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold w-24">เรียน/To:</span>
            <input type="text" disabled value="คณบดี" className="bg-transparent border-b border-gray-400 flex-1 px-2 focus:outline-none" />
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 shadow-inner">
          <h3 className="font-bold text-emerald-800 mb-4 border-b-2 border-emerald-200 pb-2">ข้อมูลส่วนตัว (Personal Information)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 font-semibold">ชื่อ-นามสกุล</label>
              <input disabled value={userData.full_name} className="mt-1 block w-full bg-gray-200 border border-gray-300 rounded p-2 text-gray-700" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-semibold">รหัสนักศึกษา</label>
              <input disabled value={userData.student_id} className="mt-1 block w-full bg-gray-200 border border-gray-300 rounded p-2 text-gray-700" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500 font-semibold">นักศึกษาภาค</label>
              <div className="flex gap-4 p-2">
                <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="studentType" value="ปกติ" checked={studentType === 'ปกติ'} onChange={(e) => setStudentType(e.target.value)} /> ปกติ</label>
                <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="studentType" value="สมทบ" checked={studentType === 'สมทบ'} onChange={(e) => setStudentType(e.target.value)} /> สมทบ</label>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-semibold">ชั้นปีที่</label>
              <select value={yearOfStudy} onChange={(e) => setYearOfStudy(e.target.value)} className="mt-1 block w-full border border-gray-300 bg-white rounded p-2 text-gray-700 outline-none focus:border-emerald-500">
                <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 font-semibold">สาขาวิชา</label>
              <input disabled value={std_department} className="mt-1 block w-full bg-gray-200 border border-gray-300 rounded p-2 text-gray-700" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex flex-wrap items-center gap-2 mb-6 text-gray-800">
            <span>มีความประสงค์ขอยืนยันการลงทะเบียนเรียน ในภาคการศึกษาที่</span>
            <select value={term} onChange={(e) => setTerm(e.target.value)} className="border-b-2 border-emerald-400 focus:outline-none px-2 w-20 text-center bg-transparent font-semibold">
              <option value="1">1</option><option value="2">2</option><option value="ฤดูร้อน">ฤดูร้อน</option>
            </select>
            <span>ปีการศึกษา</span>
            <input type="text" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="border-b-2 border-emerald-400 focus:outline-none px-2 w-24 text-center bg-transparent font-semibold" placeholder="25XX" required />
          </div>

          <div className="flex flex-col gap-2 mb-6">
            <label className="font-semibold text-gray-700">เนื่องจาก (ระบุเหตุผลความจำเป็น):</label>
            <textarea rows="2" value={requestReason} onChange={(e) => setRequestReason(e.target.value)} className="w-full border-b-2 border-gray-400 focus:border-emerald-600 focus:outline-none p-2 bg-transparent transition-colors" placeholder="พิมพ์เหตุผลที่นี่..." required />
          </div>

          <p className="font-semibold mb-2 text-gray-800">โดยมีรายวิชาที่ต้องการขอยืนยัน ดังนี้:</p>
          
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse border border-gray-400 text-sm text-center">
              <thead className="bg-emerald-100">
                <tr>
                  <th className="border border-gray-400 p-2 w-12">ลำดับ</th>
                  <th className="border border-gray-400 p-2 w-32">รหัสวิชา</th>
                  <th className="border border-gray-400 p-2">ชื่อรายวิชา</th>
                  <th className="border border-gray-400 p-2 w-20">กลุ่ม (SEC)</th>
                  <th className="border border-gray-400 p-2 w-20">หน่วยกิต</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, index) => (
                  <tr key={course.id} className="hover:bg-gray-50 focus-within:bg-emerald-50 transition-colors">
                    <td className="border border-gray-400 p-2 font-medium">{index + 1}</td>
                    <td className="border border-gray-400 p-0"><input type="text" className="w-full h-full p-2 outline-none text-center bg-transparent" value={course.courseCode} onChange={(e) => handleCourseChange(course.id, 'courseCode', e.target.value)} /></td>
                    <td className="border border-gray-400 p-0"><input type="text" className="w-full h-full p-2 outline-none text-left bg-transparent" value={course.courseName} onChange={(e) => handleCourseChange(course.id, 'courseName', e.target.value)} /></td>
                    <td className="border border-gray-400 p-0"><input type="text" className="w-full h-full p-2 outline-none text-center bg-transparent" value={course.section} onChange={(e) => handleCourseChange(course.id, 'section', e.target.value)} /></td>
                    <td className="border border-gray-400 p-0"><input type="number" className="w-full h-full p-2 outline-none text-center bg-transparent" value={course.credits} onChange={(e) => handleCourseChange(course.id, 'credits', e.target.value)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end items-center gap-4 bg-gray-50 p-4 rounded border border-gray-200">
            <label className="font-bold text-gray-700">รวมจำนวนหน่วยกิตทั้งหมด:</label>
            <input type="number" value={totalCredits} onChange={(e) => setTotalCredits(e.target.value)} className="border-b-2 border-emerald-500 focus:outline-none w-24 text-center text-xl font-bold text-emerald-700 bg-transparent" placeholder="0" required />
          </div>

        </div>

        <div className="text-center pt-8 pb-4">
          <button
            type="submit"
            className="px-12 py-3 bg-emerald-600 text-white text-lg font-bold rounded-full shadow-lg hover:bg-emerald-700 hover:shadow-xl transition-all active:scale-95"
          >
            ยื่นคำร้องเข้าสู่ระบบ
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfirmRegistrationForm;