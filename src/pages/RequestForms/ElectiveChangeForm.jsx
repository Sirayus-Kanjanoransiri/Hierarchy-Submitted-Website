import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const ElectiveChangeForm = () => {
  const [userData, setUserData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const [loadingSubmission, setLoadingSubmission] = useState(false);
  
  const [formData, setFormData] = useState({
    faculty: '',
    academicYear: '',
    semester: '',
    major: '',
    minor: '',
    curriculumYear: '',
    gpa: '',
    changes: [
      { 
        id: 1, 
        oldCode: '', oldName: '', oldCredits: '', oldSemester: '', oldYear: '', oldGrade: '',
        newCode: '', newName: '', newCredits: '', newSemester: '', newYear: ''
      }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [searchParams] = useSearchParams();

  // รายการเกรดที่อนุญาตให้เลือก
  const gradeOptions = ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F', 'W', 'U', 'S'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCourseChange = (id, field, value) => {
    const updatedChanges = formData.changes.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setFormData({ ...formData, changes: updatedChanges });
  };

  const addChangeRow = () => {
    const newId = formData.changes.length > 0 ? formData.changes[formData.changes.length - 1].id + 1 : 1;
    setFormData({
      ...formData,
      changes: [...formData.changes, { 
        id: newId, 
        oldCode: '', oldName: '', oldCredits: '', oldSemester: '', oldYear: '', oldGrade: '',
        newCode: '', newName: '', newCredits: '', newSemester: '', newYear: ''
      }]
    });
  };

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

  const removeChangeRow = () => {
    if (formData.changes.length > 1) {
      setFormData({
        ...formData,
        changes: formData.changes.slice(0, -1)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

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
            student_id: userData?.id,
            form_id: 9,
            form_data: formData
          })
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
          faculty: '',
          academicYear: '',
          semester: '',
          major: '',
          minor: '',
          curriculumYear: '',
          gpa: '',
          changes: [
            { 
              id: 1, 
              oldCode: '', oldName: '', oldCredits: '', oldSemester: '', oldYear: '', oldGrade: '',
              newCode: '', newName: '', newCredits: '', newSemester: '', newYear: ''
            }
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
    <div className="max-w-6xl mx-auto p-8 bg-white shadow-lg rounded-lg border border-gray-200 my-10 font-sans text-gray-800">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div className="text-center md:text-left flex-1">
          <h1 className="text-2xl font-bold text-gray-800">คำร้องขอเปลี่ยนวิชาเลือก</h1>
          <p className="text-gray-500 mt-1 text-sm">(Request Form for Elective Course Change)</p>
          <div className="flex flex-wrap gap-4 mt-4">
            {['เกษตรศาสตร์ฯ', 'วิทยาศาสตร์ฯ', 'มนุษยศาสตร์ฯ'].map((fac) => (
              <label key={fac} className="flex items-center gap-2 text-sm cursor-pointer hover:text-blue-600 transition-colors">
                <input 
                  type="radio" 
                  name="faculty" 
                  value={fac} 
                  checked={formData.faculty_name === fac}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                /> คณะ{fac}
              </label>
            ))}
          </div>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Personal Information */}
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col md:col-span-1">
            <label className="text-sm font-semibold mb-1">สาขาวิชา</label>
            <input type="text" name="major" className="border rounded px-3 py-2 bg-gray-50" value={userData?.department_name || ''} readOnly />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">วิชาเอก (ถ้ามี)</label>
            <input type="text" name="minor" className="border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.minor || '' } onChange={handleInputChange} />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">หลักสูตร (ปี)</label>
            <input type="text" name="curriculumYear" className="border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.curriculumYear} onChange={handleInputChange} placeholder="25XX" />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">GPA สะสม</label>
            <input type="number" step="0.01" name="gpa" className="border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.gpa} onChange={handleInputChange} placeholder="0.00" />
          </div>
        </div>

        <div className="bg-blue-50 p-5 rounded-md border border-blue-100 flex flex-wrap items-center gap-4">
          <span className="font-semibold text-sm">มีความประสงค์ขอเปลี่ยนวิชาเลือกในภาคการศึกษาที่:</span>
          <input type="text" name="semester" className="border rounded px-2 py-1 w-16 outline-none focus:ring-2 focus:ring-blue-400" value={formData.semester} onChange={handleInputChange} />
          <span className="text-sm">ปีการศึกษา</span>
          <input type="text" name="academicYear" className="border rounded px-2 py-1 w-24 outline-none focus:ring-2 focus:ring-blue-400" value={formData.academicYear} onChange={handleInputChange} placeholder="25XX" />
        </div>

        {/* Change Course Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-[12px]">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th rowSpan="2" className="border border-gray-300 p-2 w-8">ที่</th>
                <th colSpan="5" className="border border-gray-300 p-2 bg-red-50 text-red-700">เปลี่ยนจากวิชา (เดิม)</th>
                <th colSpan="4" className="border border-gray-300 p-2 bg-green-50 text-green-700">เป็นวิชา (ใหม่)</th>
              </tr>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-1 w-20">รหัสวิชา</th>
                <th className="border border-gray-300 p-1">ชื่อวิชา</th>
                <th className="border border-gray-300 p-1 w-12 text-center">หน่วยกิต</th>
                <th className="border border-gray-300 p-1 w-16 text-center">ภาค/ปี</th>
                <th className="border border-gray-300 p-1 w-12 text-center text-red-600">เกรด</th>
                <th className="border border-gray-300 p-1 w-20">รหัสวิชา</th>
                <th className="border border-gray-300 p-1">ชื่อวิชา</th>
                <th className="border border-gray-300 p-1 w-12 text-center">หน่วยกิต</th>
                <th className="border border-gray-300 p-1 w-16 text-center">ภาค/ปี</th>
              </tr>
            </thead>
            <tbody>
              {formData.changes.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="border border-gray-300 p-2 text-center bg-gray-50 font-medium">{index + 1}</td>
                  <td className="border border-gray-300 p-1">
                    <input type="text" className="w-full p-1 outline-none bg-transparent" value={item.oldCode} onChange={(e) => handleCourseChange(item.id, 'oldCode', e.target.value)} />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input type="text" className="w-full p-1 outline-none bg-transparent" value={item.oldName} onChange={(e) => handleCourseChange(item.id, 'oldName', e.target.value)} />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input type="text" className="w-full p-1 text-center outline-none bg-transparent" value={item.oldCredits} onChange={(e) => handleCourseChange(item.id, 'oldCredits', e.target.value)} />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input type="text" className="w-full p-1 text-center outline-none bg-transparent placeholder-gray-300" placeholder="1/66" value={item.oldSemester} onChange={(e) => handleCourseChange(item.id, 'oldSemester', e.target.value)} />
                  </td>
                  
                  {/* แก้ไขเป็น Select สำหรับเลือกเกรด */}
                  <td className="border border-gray-300 p-1 text-center font-bold">
                    <select 
                      className="w-full p-1 bg-transparent text-red-600 outline-none cursor-pointer text-center appearance-none"
                      value={item.oldGrade} 
                      onChange={(e) => handleCourseChange(item.id, 'oldGrade', e.target.value)}
                    >
                      <option value="">-</option>
                      {gradeOptions.map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </td>

                  <td className="border border-gray-300 p-1 bg-green-50/30">
                    <input type="text" className="w-full p-1 outline-none bg-transparent font-semibold" value={item.newCode} onChange={(e) => handleCourseChange(item.id, 'newCode', e.target.value)} />
                  </td>
                  <td className="border border-gray-300 p-1 bg-green-50/30">
                    <input type="text" className="w-full p-1 outline-none bg-transparent font-semibold" value={item.newName} onChange={(e) => handleCourseChange(item.id, 'newName', e.target.value)} />
                  </td>
                  <td className="border border-gray-300 p-1 bg-green-50/30">
                    <input type="text" className="w-full p-1 text-center outline-none bg-transparent" value={item.newCredits} onChange={(e) => handleCourseChange(item.id, 'newCredits', e.target.value)} />
                  </td>
                  <td className="border border-gray-300 p-1 bg-green-50/30 text-center">
                    <input type="text" className="w-full p-1 text-center outline-none bg-transparent" placeholder="2/67" value={item.newSemester} onChange={(e) => handleCourseChange(item.id, 'newSemester', e.target.value)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-4 mt-3">
            <button type="button" onClick={addChangeRow} className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">+ เพิ่มรายการเปลี่ยนวิชา</button>
            <button type="button" onClick={removeChangeRow} className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors">- ลบรายการ</button>
          </div>
        </div>

        <div className="text-center py-6 text-gray-600 italic text-sm">
          จึงเรียนมาเพื่อโปรดพิจารณา
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-10">
          <button type="button" className="px-6 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition-all">ยกเลิก</button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-8 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 font-semibold shadow-md transition-all active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'กำลังส่ง...' : 'ยื่นคำร้องเปลี่ยนวิชาเลือก'}
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
      
      <div className="mt-12 space-y-8 border-t border-gray-200 pt-8">

       

        {/* 1. คำอธิบาย */}

        <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">

          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">1. คำอธิบาย</h2>

          <div className="text-sm text-gray-700 space-y-3 leading-relaxed">

            <p>

              ในคำร้องขอเปลี่ยนวิชาเลือก นักศึกษาสามารถเปลี่ยนได้เฉพาะวิชาเลือกที่ได้รับระดับคะแนนตัวอักษร <strong>F, W หรือ U เท่านั้น</strong> ตามข้อบังคับสถาบันฯ ว่าด้วยการศึกษาระดับปริญญาตรี (ฉบับที่ 7) พ.ศ. 2547 ข้อ 20.3

            </p>

            <p className="bg-white p-3 rounded border-l-4 border-blue-500 italic">

              "รายวิชาใดที่นักศึกษาได้รับระดับคะแนน F หรือ U หรือ W หากเป็นวิชาบังคับในหลักสูตรแล้ว นักศึกษาจะต้องลงทะเบียนเรียนรายวิชานั้นซ้ำอีกจนกว่าจะได้รับระดับคะแนนตามที่หลักสูตรกำหนดไว้"

            </p>

            <p>

              ถ้ารายวิชาใดที่นักศึกษาได้รับระดับคะแนนตามบรรทัดแรก เป็นรายวิชาเลือกในหลักสูตรนักศึกษาจะลงทะเบียนรายวิชาอื่นแทนก็ได้ รายวิชาใดที่นักศึกษาได้รับระดับคะแนน F หรือ U เมื่อมีการลงทะเบียนรายวิชาซ้ำหรือแทนกันแล้ว ให้นับหน่วยกิตสะสมเพียงครั้งเดียวในการคำนวณหาค่าระดับคะแนนเฉลี่ยสะสม

            </p>

          </div>



          <h3 className="text-md font-bold text-gray-800 mt-6 mb-3 underline">2. ขั้นตอนการขอเปลี่ยนวิชาเลือก</h3>

          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2 pl-2">

            <li>นักศึกษารับคำร้องเปลี่ยนวิชาเลือกที่สำนักส่งเสริมวิชาการและงานทะเบียน</li>

            <li>นักศึกษากรอกข้อมูลให้ครบถ้วนสมบูรณ์พร้อมลงลายมือชื่อ โดยผ่านอาจารย์ที่ปรึกษา รองคณบดีฝ่ายวิชาการ และคณบดี พิจารณาให้ความเห็นชอบ พร้อมแนบสำเนาผลการเรียนของภาคเรียนที่ได้ลงทะเบียนวิชาเลือกแล้วได้ระดับคะแนนตัวอักษร F, W หรือ U</li>

            <li>นำใบคำร้องที่ดำเนินการแล้วตามข้อ 2 ส่งสำนักส่งเสริมวิชาการและงานทะเบียน พร้อมสำเนาผลการเรียน</li>

          </ol>

          <p className="mt-4 text-center font-bold text-red-600 text-[15px] animate-pulse">

            “นักศึกษาต้องดำเนินการให้แล้วเสร็จภายใน 2 สัปดาห์แรกของภาคการศึกษา”

          </p>

        </section>



        {/* 2. หมายเหตุ: คณะและสาขาวิชา */}

        <section className="p-6">

          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">หมายเหตุ : รายชื่อคณะและสาขาวิชา</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

           

            {/* คณะเกษตรศาสตร์ฯ */}

            <div className="space-y-3">

              <div className="flex items-center gap-2 font-bold text-green-700">

                <div className="w-4 h-4 border border-gray-400 rounded-sm"></div> คณะเกษตรศาสตร์และทรัพยากรธรรมชาติ

              </div>

              <ul className="text-xs text-gray-600 space-y-1.5 pl-6 list-disc">

                <li>สาขาพืชศาสตร์</li>

                <li>สาขาพืชศาสตร์-พืชสวน</li>

                <li>สาขาพืชศาสตร์-พืชไร่นา</li>

                <li>สาขาสัตวศาสตร์</li>

                <li>สาขาเกษตรกลวิธาน</li>

                <li>สาขาประมง</li>

                <li>สาขาวิทยาศาสตร์สุขภาพสัตว์</li>

                <li>สาขาเทคโนโลยีภูมิทัศน์</li>

              </ul>

            </div>



            {/* คณะวิทยาศาสตร์ฯ */}

            <div className="space-y-3">

              <div className="flex items-center gap-2 font-bold text-blue-700">

                <div className="w-4 h-4 border border-gray-400 rounded-sm"></div> คณะวิทยาศาสตร์และเทคโนโลยี

              </div>

              <ul className="text-xs text-gray-600 space-y-1.5 pl-6 list-disc">

                <li>สาขาวิทยาศาสตร์และเทคโนโลยีการอาหาร</li>

                <li>สาขาเทคโนโลยีชีวภาพ</li>

                <li>สาขาพัฒนาผลิตภัณฑ์อุตสาหกรรมเกษตร</li>

                <li>สาขาวิทยาการคอมพิวเตอร์</li>

                <li>สาขาวิศวกรรมหลังการเก็บเกี่ยวและแปรสภาพ</li>

              </ul>

            </div>

            {/* คณะมนุษยศาสตร์ฯ */}

            <div className="space-y-3">

              <div className="flex items-center gap-2 font-bold text-orange-700">

                <div className="w-4 h-4 border border-gray-400 rounded-sm"></div> คณะมนุษยศาสตร์และสังคมศาสตร์

              </div>

              <ul className="text-xs text-gray-600 space-y-1.5 pl-6 list-disc">

                <li>สาขาการบริหารธุรกิจเกษตร</li>

                <li>สาขาเกษตรศึกษา</li>

                <li>สาขาเศรษฐศาสตร์</li>

                <li>สาขาเศรษฐศาสตร์ธุรกิจ</li>

                <li>สาขาการจัดการ-การจัดการทั่วไป</li>

                <li>สาขาภาษาอังกฤษเพื่อการสื่อสารสากล</li>

                <li>สาขาเทคโนโลยีโลจิสติกส์และการจัดการระบบขนส่ง</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

};



export default ElectiveChangeForm;