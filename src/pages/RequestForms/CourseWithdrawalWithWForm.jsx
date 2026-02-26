import React, { useEffect, useState } from 'react';

const CourseWithdrawalWithWForm = () => {
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    studentType: 'ปกติ',
    yearLevel: '',
    address: {
      no: '', moo: '', village: '', soi: '', road: '',
      subdistrict: '', district: '', province: '', zipcode: '', tel: ''
    },
    semester: '1',
    academicYear: (new Date().getFullYear() + 543).toString(),
    withdrawals: [
      { id: Date.now(), code: '', name: '', sec: '', credits: '' }
    ]
  });

  // 1. ดึงข้อมูล User อัตโนมัติเมื่อเข้าหน้าฟอร์ม
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

  // 2. ฟังก์ชันจัดการ Input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: { ...formData[parent], [child]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCourseChange = (id, field, value) => {
    const updatedWithdrawals = formData.withdrawals.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setFormData({ ...formData, withdrawals: updatedWithdrawals });
  };

  const addRow = () => {
    if (formData.withdrawals.length < 5) {
      setFormData({
        ...formData,
        withdrawals: [...formData.withdrawals, { id: Date.now(), code: '', name: '', sec: '', credits: '' }]
      });
    }
  };

  const removeRow = () => {
    if (formData.withdrawals.length > 1) {
      const newList = [...formData.withdrawals];
      newList.pop();
      setFormData({ ...formData, withdrawals: newList });
    }
  };

  // 3. ส่งข้อมูลไปที่ Database
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
          student_id: userData.id,
          form_id: 10, // สมมติว่า ID ของฟอร์มถอนวิชาคือ 10
          form_data: formData,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Submission failed');

      alert('ส่งคำร้องขอถอนวิชาเรียบร้อยแล้ว!');
    } catch (error) {
      console.error('Submission error:', error);
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-xl rounded-xl border border-gray-200 my-10 font-sans">
      {/* Header Section */}
      <div className="text-center mb-10 border-b pb-6">
        <h1 className="text-2xl font-bold text-gray-800">คำร้องขอถอนรายวิชา (W)</h1>
        <p className="text-gray-500 mt-1 text-sm">(Course Withdrawal Request Form)</p>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        
        {/* ส่วนที่ 1: ข้อมูลนักศึกษา (Read Only) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">ชื่อ-นามสกุล</label>
            <input type="text" className="border rounded-lg px-3 py-2 bg-gray-50 text-gray-700" value={userData?.full_name || ''} readOnly />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">รหัสนักศึกษา</label>
            <input type="text" className="border rounded-lg px-3 py-2 bg-gray-50 text-gray-700 font-mono" value={userData?.student_id || ''} readOnly />
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">คณะ / สาขาวิชา</label>
            <input type="text" className="border rounded-lg px-3 py-2 bg-gray-50 text-gray-700" value={`${userData?.faculty_name || ''} / ${userData?.department_name || ''}`} readOnly />
          </div>
        </div>

        {/* ส่วนที่ 2: ข้อมูลเพิ่มเติมและการศึกษา */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-600 mb-1">ชั้นปีที่</label>
            <input type="number" name="yearLevel" required className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.yearLevel} onChange={handleInputChange} />
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="text-xs font-bold text-gray-600 mb-1">นักศึกษาภาค</label>
            <div className="flex gap-6 mt-2">
              {['ปกติ', 'สมทบ'].map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="studentType" value={type} checked={formData.studentType === type} onChange={handleInputChange} className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ส่วนที่ 3: ข้อมูลที่อยู่ติดต่อ */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 border-l-4 border-blue-600 pl-3">ที่อยู่ปัจจุบันที่ติดต่อได้</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <label className="text-[11px] text-gray-500 mb-1">เลขที่</label>
              <input type="text" name="address.no" value={userData?.address_no || ''} onChange={handleInputChange} className="border-b border-gray-300 py-1 outline-none focus:border-blue-500" />
            </div>
            <div className="flex flex-col">
              <label className="text-[11px] text-gray-500 mb-1">หมู่ที่</label>
              <input type="text" name="address.moo" value={userData?.address_moo || ''} onChange={handleInputChange} className="border-b border-gray-300 py-1 outline-none focus:border-blue-500" />
            </div>
            <div className="flex flex-col col-span-2">
              <label className="text-[11px] text-gray-500 mb-1">หมู่บ้าน / อาคาร</label>
              <input type="text" name="address.village" value={userData?.address_soi || ''}onChange={handleInputChange} className="border-b border-gray-300 py-1 outline-none focus:border-blue-500" />
            </div>
            <div className="flex flex-col">
              <label className="text-[11px] text-gray-500 mb-1">ตำบล / แขวง</label>
              <input type="text" name="address.subdistrict" value={userData?.address_subdistrict || ''} onChange={handleInputChange} className="border-b border-gray-300 py-1 outline-none focus:border-blue-500" />
            </div>
            <div className="flex flex-col">
              <label className="text-[11px] text-gray-500 mb-1">อำเภอ / เขต</label>
              <input type="text" name="address.district" value={userData?.address_district || ''} onChange={handleInputChange} className="border-b border-gray-300 py-1 outline-none focus:border-blue-500" />
            </div>
            <div className="flex flex-col">
              <label className="text-[11px] text-gray-500 mb-1">จังหวัด</label>
              <input type="text" name="address.province" value={userData?.address_province || ''} onChange={handleInputChange} className="border-b border-gray-300 py-1 outline-none focus:border-blue-500" />
            </div>
            <div className="flex flex-col">
              <label className="text-[11px] text-gray-500 mb-1">โทรศัพท์</label>
              <input type="tel" name="address.tel" onChange={handleInputChange} required className="border-b border-gray-300 py-1 outline-none focus:border-blue-500" />
            </div>
          </div>
        </div>

        {/* ส่วนที่ 4: ตารางรายวิชาที่จะถอน */}
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="font-semibold text-blue-900">ขอถอนวิชาในภาคเรียนที่:</span>
            {['1', '2', 'summer'].map((s) => (
              <label key={s} className="flex items-center gap-1 cursor-pointer">
                <input type="radio" name="semester" value={s} checked={formData.semester === s} onChange={handleInputChange} />
                <span className="text-sm">{s === 'summer' ? 'ฤดูร้อน' : s}</span>
              </label>
            ))}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm">ปีการศึกษา</span>
              <input type="text" name="academicYear" className="border rounded px-2 py-1 w-20 text-center" value={formData.academicYear} onChange={handleInputChange} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
              <thead className="bg-blue-600 text-white text-xs uppercase">
                <tr>
                  <th className="p-3 w-12">ที่</th>
                  <th className="p-3 text-left">รหัสวิชา</th>
                  <th className="p-3 text-left">ชื่อวิชา (English)</th>
                  <th className="p-3 w-20">SEC.</th>
                  <th className="p-3 w-20">หน่วยกิต.</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {formData.withdrawals.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 text-center text-gray-400">{index + 1}</td>
                    <td className="p-2">
                      <input type="text" required className="w-full bg-transparent outline-none focus:ring-1 focus:ring-blue-400 rounded p-1" value={item.code} onChange={(e) => handleCourseChange(item.id, 'code', e.target.value)} placeholder="เช่น 0123456" />
                    </td>
                    <td className="p-2">
                      <input type="text" required className="w-full bg-transparent outline-none focus:ring-1 focus:ring-blue-400 rounded p-1" value={item.name} onChange={(e) => handleCourseChange(item.id, 'name', e.target.value)} placeholder="Course Name" />
                    </td>
                    <td className="p-2">
                      <input type="text" required className="w-full bg-transparent text-center outline-none focus:ring-1 focus:ring-blue-400 rounded p-1" value={item.sec} onChange={(e) => handleCourseChange(item.id, 'sec', e.target.value)} placeholder="01" />
                    </td>
                    <td className="p-2">
                      <input type="number" required className="w-full bg-transparent text-center outline-none focus:ring-1 focus:ring-blue-400 rounded p-1" value={item.credits} onChange={(e) => handleCourseChange(item.id, 'credits', e.target.value)} placeholder="3" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex gap-4 mt-3">
            <button type="button" onClick={addRow} className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase tracking-widest">+ เพิ่มวิชา</button>
            <button type="button" onClick={removeRow} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-widest">- ลบวิชา</button>
          </div>
        </div>

        {/* Footer & Buttons */}
        <div className="text-center py-4">
          <p className="text-gray-500 italic text-sm">ตรวจสอบข้อมูลที่อยู่และรายวิชาให้ถูกต้องก่อนส่งคำร้อง</p>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t">
          <button type="button" className="px-6 py-2.5 text-gray-500 hover:bg-gray-100 rounded-lg font-medium transition-all">ยกเลิก</button>
          <button type="submit" className="px-10 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95">ยื่นคำร้อง</button>
        </div>
      </form>
    </div>
  );
};

export default CourseWithdrawalWithWForm;