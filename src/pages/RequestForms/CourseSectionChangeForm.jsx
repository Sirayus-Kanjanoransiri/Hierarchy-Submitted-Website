import React, { useEffect, useState } from 'react';

const CourseSectionChangeForm = () => {
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    year: '',
    phone: '',
    semester: '1',
    academicYear: (new Date().getFullYear() + 543).toString(),
    reason: '',
    courses: [
      { id: Date.now(), code: '', name: '', oldSection: '', newSection: '', note: '' }
    ]
  });

  // ดึงข้อมูล User เมื่อ Component Mount
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

  // ฟังก์ชันจัดการการเปลี่ยนแปลง Input ทั่วไป
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ฟังก์ชันจัดการการเปลี่ยนแปลงในตารางวิชา
  const handleCourseChange = (id, field, value) => {
    const updatedCourses = formData.courses.map(course => 
      course.id === id ? { ...course, [field]: value } : course
    );
    setFormData({ ...formData, courses: updatedCourses });
  };

  const addCourseRow = () => {
    if (formData.courses.length < 5) {
      setFormData({
        ...formData,
        courses: [...formData.courses, { id: Date.now(), code: '', name: '', oldSection: '', newSection: '', note: '' }]
      });
    }
  };

  const removeCourseRow = () => {
    if (formData.courses.length > 1) {
      const newCourses = [...formData.courses];
      newCourses.pop();
      setFormData({ ...formData, courses: newCourses });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userData?.id) {
      alert('ไม่พบข้อมูลนักศึกษา กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    try {
      const response = await fetch('/student/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: userData.id, // ใช้ ID จาก database (PK) ไม่ใช่ รหัสนักศึกษา (SK)
          form_id: 7, 
          form_data: formData, // ส่งก้อน formData ทั้งหมดเข้าคอลัมน์ JSON
        }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to submit form');

      alert('ส่งคำร้องเรียบร้อยแล้ว!');
      // อาจจะเปลี่ยนหน้าหรือ reset form ที่นี่
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-200 my-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">แบบคำขอเปลี่ยนกลุ่มเรียน</h1>
        <p className="text-gray-500 mt-1 text-sm">(Course Section Change Request Form)</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Personal Information (Read Only) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">ชื่อ-นามสกุล</label>
            <input type="text" className="border rounded px-3 py-2 bg-gray-50" value={userData?.full_name || ''} readOnly />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">รหัสนักศึกษา</label>
            <input type="text" className="border rounded px-3 py-2 bg-gray-50" value={userData?.student_id || ''} readOnly />
          </div>
        </div>

        {/* Input Fields (Editable) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">ชั้นปีที่</label>
            <input 
              type="number" 
              name="year"
              required
              className="border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
              value={formData.year}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="text-sm font-semibold mb-1">คณะ/สาขา</label>
            <input type="text" className="border rounded px-3 py-2 bg-gray-50" value={`${userData?.faculty_name || ''} / ${userData?.program_name || ''}`} readOnly/>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">โทรศัพท์ที่ติดต่อได้</label>
            <input 
              type="tel" 
              name="phone"
              required
              className="border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <hr className="my-6" />

        {/* Request Details */}
        <div className="bg-blue-50 p-4 rounded-md">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="font-semibold text-sm">มีความประสงค์ขอเปลี่ยนกลุ่มเรียนในภาคการศึกษาที่:</span>
            {['1', '2', 'summer'].map((s) => (
              <label key={s} className="flex items-center gap-1">
                <input 
                  type="radio" 
                  name="semester" 
                  value={s} 
                  checked={formData.semester === s}
                  onChange={handleInputChange}
                /> {s === 'summer' ? 'ฤดูร้อน' : s}
              </label>
            ))}
            <div className="flex items-center gap-2">
              <span className="text-sm">ปีการศึกษา</span>
              <input 
                type="text" 
                name="academicYear"
                className="border rounded px-2 py-1 w-20" 
                value={formData.academicYear}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">เนื่องจาก (ระบุเหตุผล)</label>
            <textarea 
              name="reason"
              required
              className="border rounded px-3 py-2 h-20 outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="ระบุเหตุผลความจำเป็น..."
              value={formData.reason}
              onChange={handleInputChange}
            ></textarea>
          </div>
        </div>

        {/* Course Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 w-10">ลำดับ</th>
                <th className="border border-gray-300 p-2">รหัสวิชา</th>
                <th className="border border-gray-300 p-2">ชื่อรายวิชา</th>
                <th className="border border-gray-300 p-2 w-20">กลุ่มเดิม</th>
                <th className="border border-gray-300 p-2 w-20">กลุ่มใหม่</th>
                <th className="border border-gray-300 p-2">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {formData.courses.map((course, index) => (
                <tr key={course.id}>
                  <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                  <td className="border border-gray-300 p-1">
                    <input type="text" className="w-full p-1 outline-none" value={course.code} onChange={(e) => handleCourseChange(course.id, 'code', e.target.value)} required />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input type="text" className="w-full p-1 outline-none" value={course.name} onChange={(e) => handleCourseChange(course.id, 'name', e.target.value)} required />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input type="text" className="w-full p-1 text-center outline-none" value={course.oldSection} onChange={(e) => handleCourseChange(course.id, 'oldSection', e.target.value)} required />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input type="text" className="w-full p-1 text-center outline-none" value={course.newSection} onChange={(e) => handleCourseChange(course.id, 'newSection', e.target.value)} required />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input type="text" className="w-full p-1 outline-none" value={course.note} onChange={(e) => handleCourseChange(course.id, 'note', e.target.value)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-4">
            <button type="button" onClick={addCourseRow} className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">+ เพิ่มรายวิชา</button>
            <button type="button" onClick={removeCourseRow} className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium">- ลบรายวิชา</button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <button type="button" className="px-6 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50">ยกเลิก</button>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold shadow-md">ส่งคำร้อง</button>
        </div>
      </form>
    </div>
  );
};

export default CourseSectionChangeForm;