import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const RepeatCourseForm = () => {
  const [userData, setUserData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const [loadingSubmission, setLoadingSubmission] = useState(false);
  
  const [formData, setFormData] = useState({
    semester: '',
    academicYear: '',
    gpa: '',
    programYear: '',
    courses: [
      { id: 1, code: '', nameEn: '', nameTh: '', section: '', credits: '', oldSemester: '', oldYear: '', oldGrade: '' }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [searchParams] = useSearchParams();

useEffect(() => {
    const idFromQuery = searchParams.get('submissionId');
    
    const initializeData = async () => {
      const user = await fetchUserData();
      
      if (idFromQuery && user) {
        setIsEditMode(true);
        setSubmissionId(idFromQuery);
        fetchExistingSubmission(idFromQuery);
      }
    };

    initializeData();
  }, [searchParams]);

  const fetchUserData = async () => {
    try {
      const localUserRaw = localStorage.getItem('user');
      if (!localUserRaw) return null;

      const localUser = JSON.parse(localUserRaw);
      const studentCode = localUser.student_id;

      const response = await fetch(`/student/user/${studentCode}`);
      if (!response.ok) throw new Error('Failed to fetch user data');

      const data = await response.json();
      setUserData(data);
      return data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const fetchExistingSubmission = async (id) => {
    setLoadingSubmission(true);
    try {
      const res = await fetch(`/student/api/submissions/detail?id=${id}`);
      if (!res.ok) throw new Error('Submission not found');

      const submission = await res.json();
      const data = typeof submission.form_data === 'string'
        ? JSON.parse(submission.form_data)
        : submission.form_data;

      setFormData(data);
    } catch (error) {
      alert('ไม่พบข้อมูลคำร้องเดิม');
      setIsEditMode(false);
    } finally {
      setLoadingSubmission(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCourseChange = (id, field, value) => {
    const updatedCourses = formData.courses.map(course =>
      course.id === id ? { ...course, [field]: value } : course
    );
    setFormData({ ...formData, courses: updatedCourses });
  };
  const addCourseRow = () => {
    const newId = formData.courses.length + 1;
    setFormData({
      ...formData,
      courses: [...formData.courses, { id: newId, code: '', nameEn: '', nameTh: '', section: '', credits: '', oldSemester: '', oldYear: '', oldGrade: '' }]
    });
  };

  const removeCourseRow = () => {
    if (formData.courses.length > 1) {
      setFormData({
        ...formData,
        courses: formData.courses.slice(0, -1)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userData?.id) {
      alert('ไม่พบข้อมูลนักศึกษา กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    try {
      let response;
      
      if (isEditMode && submissionId) {
        response = await fetch(`/student/api/submissions/${submissionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ form_data: formData }),
        });
      } else {
        response = await fetch('/student/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: userData.id, 
            form_id: 8, 
            form_data: formData, 
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'เกิดข้อผิดพลาด');
      }

      setSuccess(true);
      alert(isEditMode ? 'แก้ไขคำร้องสำเร็จ!' : 'ส่งคำร้องสำเร็จแล้ว!');
      console.log('Submission successful:', data);
      
      if (!isEditMode) {
        setFormData({
          semester: '',
          academicYear: '',
        gpa: '',
        programYear: '',
        courses: [
          { id: 1, code: '', nameEn: '', nameTh: '', section: '', credits: '', oldSemester: '', oldYear: '', oldGrade: '' }
        ]
      });
      }
    } catch (err) {
      setError(err.message);
      console.error('Submission Error:', err);
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow-lg rounded-lg border border-gray-200 my-10 font-sans">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">แบบขอลงทะเบียนเรียนซ้ำวิชา</h1>
        <p className="text-gray-500 mt-1 text-sm">(Request Form for Course Repetition)</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* ส่วนข้อมูลผู้สมัคร */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">ข้าพเจ้า (นาย/นาง/นางสาว)</label>
            <input type="text" className="border rounded px-3 py-2 bg-gray-50" value={userData?.full_name || ''} readOnly />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">รหัสนักศึกษา</label>
            <input type="text" className="border rounded px-3 py-2 bg-gray-50" value={userData?.student_id || ''} readOnly />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col md:col-span-1">
            <label className="text-sm font-semibold mb-1">สาขาวิชา</label>
            <input type="text" className="border rounded px-3 py-2 bg-gray-50" value={userData?.program_name || ''} readOnly />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">หลักสูตร (ปี)</label>
            <input 
              type="text" 
              name="programYear"
              placeholder="เช่น 2563"
              className="border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
              value={formData.programYear}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">GPA สะสมปัจจุบัน</label>
            <input 
              type="number" 
              step="0.01"
              name="gpa"
              placeholder="0.00"
              className="border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
              value={formData.gpa}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <hr className="my-6" />

        {/* ส่วนความประสงค์ */}
        <div className="bg-blue-50 p-5 rounded-md border border-blue-100">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-sm">มีความประสงค์ขอลงทะเบียนเรียนซ้ำวิชา ในภาคการศึกษาที่:</span>
            <div className="flex gap-4">
              {['1', '2', 'ฤดูร้อน'].map((s) => (
                <label key={s} className="flex items-center gap-1 cursor-pointer">
                  <input 
                    type="radio" 
                    name="semester" 
                    value={s} 
                    checked={formData.semester === s}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600"
                  /> {s}
                </label>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">ปีการศึกษา</span>
              <input 
                type="text" 
                name="academicYear"
                className="border rounded px-2 py-1 w-24 outline-none focus:ring-2 focus:ring-blue-400" 
                placeholder="25XX"
                value={formData.academicYear}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* ตารางรายวิชา */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-[13px]">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th rowSpan="2" className="border border-gray-300 p-2 w-8">ที่</th>
                <th rowSpan="2" className="border border-gray-300 p-2 w-24">รหัสวิชา</th>
                <th rowSpan="2" className="border border-gray-300 p-2">ชื่อรายวิชา (อังกฤษ/ไทย)</th>
                <th rowSpan="2" className="border border-gray-300 p-2 w-16">กลุ่ม</th>
                <th rowSpan="2" className="border border-gray-300 p-2 w-16">หน่วยกิต</th>
                <th colSpan="3" className="border border-gray-300 p-2 bg-gray-50">ประวัติการลงทะเบียนเดิม</th>
              </tr>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-1 w-16">ภาค</th>
                <th className="border border-gray-300 p-1 w-20">ปีการศึกษา</th>
                <th className="border border-gray-300 p-1 w-14">เกรด</th>
              </tr>
            </thead>
            <tbody>
              {formData.courses.map((course, index) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                  <td className="border border-gray-300 p-1">
                    <input type="text" className="w-full p-1 outline-none bg-transparent" placeholder="รหัสวิชา" value={course.code} onChange={(e) => handleCourseChange(course.id, 'code', e.target.value)} />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input type="text" className="w-full p-1 outline-none bg-transparent mb-1 border-b border-gray-100" placeholder="English Name" value={course.nameEn} onChange={(e) => handleCourseChange(course.id, 'nameEn', e.target.value)} />
                    <input type="text" className="w-full p-1 outline-none bg-transparent" placeholder="ชื่อภาษาไทย" value={course.nameTh} onChange={(e) => handleCourseChange(course.id, 'nameTh', e.target.value)} />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input type="text" className="w-full p-1 text-center outline-none bg-transparent" value={course.section} onChange={(e) => handleCourseChange(course.id, 'section', e.target.value)} />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input type="text" className="w-full p-1 text-center outline-none bg-transparent" value={course.credits} onChange={(e) => handleCourseChange(course.id, 'credits', e.target.value)} />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input type="text" className="w-full p-1 text-center outline-none bg-transparent" value={course.oldSemester} onChange={(e) => handleCourseChange(course.id, 'oldSemester', e.target.value)} />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input type="text" className="w-full p-1 text-center outline-none bg-transparent" value={course.oldYear} onChange={(e) => handleCourseChange(course.id, 'oldYear', e.target.value)} />
                  </td>
                  <td className="border border-gray-300 p-1 text-center">
                    <input type="text" className="w-full p-1 text-center font-bold text-red-600 outline-none bg-transparent" value={course.oldGrade} onChange={(e) => handleCourseChange(course.id, 'oldGrade', e.target.value)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-4 mt-3">
            <button type="button" onClick={addCourseRow} className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">+ เพิ่มรายวิชา</button>
            <button type="button" onClick={removeCourseRow} className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors">- ลบรายวิชา</button>
          </div>
        </div>

        {/* ปุ่มดำเนินการ */}
        <div className="flex justify-end gap-4 mt-10">
          <button type="button" className="px-6 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition-all">ยกเลิก</button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-8 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 font-semibold shadow-md transition-all active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'กำลังส่ง...' : 'ยืนยันการลงทะเบียนเรียนซ้ำ'}
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
            บันทึกแบบฟอร์มสำเร็จแล้ว
          </div>
        )}
      </form>

      <div className="mt-12 border-t pt-8">
          <div className="bg-green-50 rounded-xl p-6 border border-green-200 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-bold text-green-800 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              ขั้นตอนการขอลงทะเบียนเรียนซ้ำรายวิชา
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs mt-1">1</div>
                <p className="text-gray-700">นักศึกษารับคำร้องขอลงทะเบียนเรียนซ้ำที่สำนักส่งเสริมวิชาการและงานทะเบียน (หรือยื่นผ่านระบบออนไลน์นี้)</p>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs mt-1">2</div>
                <p className="text-gray-700">
                  นักศึกษากรอกใบ **ทบ.13** ให้ครบถ้วนสมบูรณ์พร้อมลงลายมือชื่อ โดยผ่านอาจารย์ที่ปรึกษา รองคณบดีฝ่ายวิชาการ 
                  (หรือรองประธานคณะทำงานฝ่ายวิชาการ) และคณบดี (หรือประธานคณะทำงาน) พิจารณาให้ความเห็นชอบ
                </p>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs mt-1">3</div>
                <p className="text-gray-700">นำใบ ทบ.13 ที่ดำเนินการแล้วตามข้อ 2. ส่งสำนักส่งเสริมวิชาการและงานทะเบียน **พร้อมสำเนาผลการเรียน**</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-green-200">
              <h4 className="text-sm font-bold text-green-900 mb-2 uppercase tracking-wide">หมายเหตุ / เงื่อนไข:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
                <li>นักศึกษาสามารถขอลงทะเบียนเรียนในรายวิชาที่ได้รับระดับคะแนนตัวอักษร <span className="font-bold underline text-red-600">F, D หรือ D+</span> เท่านั้น</li>
                <li>นักศึกษาต้องดำเนินการให้แล้วเสร็จภายใน <span className="font-bold">2 สัปดาห์แรก</span> ของภาคการศึกษา</li>
              </ul>
            </div>
          </div>
        </div>
    </div>
  );
};

export default RepeatCourseForm;