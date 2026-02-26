import React, { useEffect, useState } from 'react';

const EnrollmentAdjustmentForm = () => {
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    yearLevel: '',
    studentType: 'ปกติ',
    phone: '',
    address: {
      no: '', moo: '', village: '', soi: '', road: '',
      subdistrict: '', district: '', province: '', zipcode: ''
    },
    semester: '1',
    academicYear: (new Date().getFullYear() + 543).toString(),
    reason: '',
    addCourses: [{ id: Date.now(), code: '', name: '', sec: '', credits: '' }],
    dropCourses: [{ id: Date.now() + 1, code: '', name: '', sec: '', credits: '' }]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({ ...formData, [parent]: { ...formData[parent], [child]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleTableChange = (type, id, field, value) => {
    const targetTable = type === 'add' ? 'addCourses' : 'dropCourses';
    const updated = formData[targetTable].map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setFormData({ ...formData, [targetTable]: updated });
  };

  const addRow = (type) => {
    const targetTable = type === 'add' ? 'addCourses' : 'dropCourses';
    setFormData({
      ...formData,
      [targetTable]: [...formData[targetTable], { id: Date.now(), code: '', name: '', sec: '', credits: '' }]
    });
  };

  // --- เพิ่มฟังก์ชันลบแถว ---
  const removeRow = (type, id) => {
    const targetTable = type === 'add' ? 'addCourses' : 'dropCourses';
    // ป้องกันการลบจนไม่เหลือแถวเลย (เหลือไว้อย่างน้อย 1 แถว)
    if (formData[targetTable].length > 1) {
      const updated = formData[targetTable].filter(item => item.id !== id);
      setFormData({ ...formData, [targetTable]: updated });
    } else {
      alert("ต้องมีอย่างน้อย 1 รายวิชา");
    }
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/student/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: userData?.id,
          form_id: 11,
          form_data: formData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'เกิดข้อผิดพลาด');
      }

      setSuccess(true);
      alert('ส่งคำร้องสำเร็จแล้ว!');
      console.log('Submission successful:', data);
      
      // รีเซ็ตฟอร์ม
      setFormData({
        requestType: '', // ล้างค่าประเภทคำร้องด้วย
            yearLevel: '',
            studentType: 'ปกติ',
            phone: '',
            address: {
                no: '', moo: '', village: '', soi: '', road: '',
                subdistrict: '', district: '', province: '', zipcode: ''
            },
            semester: '1',
            academicYear: (new Date().getFullYear() + 543).toString(),
            reason: '',
            addCourses: [{ id: Date.now(), code: '', name: '', sec: '', credits: '' }],
            dropCourses: [{ id: Date.now() + 1, code: '', name: '', sec: '', credits: '' }
            ]
      });
    } catch (err) {
      setError(err.message);
      console.error('Submission Error:', err);
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow-2xl rounded-2xl border border-gray-100 my-10 font-sans text-gray-800">
      {/* Header จากรูปภาพ */}
      <div className="flex justify-between items-start mb-8 border-b pb-6">
        <div className="flex gap-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">คำร้องขอเพิ่ม-ถอนรายวิชาล่าช้า</h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* เลือกประเภทคำร้อง */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <label className="block text-sm font-bold text-blue-900 mb-3 uppercase">ประเภทคำร้องที่ต้องการยื่น</label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { id: 'late_add', label: 'เพิ่มรายวิชาล่าช้า' },
              { id: 'late_drop', label: 'ถอนรายวิชาล่าช้า' },
              { id: 'late_both', label: 'เพิ่ม-ถอนล่าช้า' }
            ].map((type) => (
              <label key={type.id} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${formData.requestType === type.id ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
                <input type="radio" name="requestType" value={type.id} checked={formData.requestType === type.id} onChange={handleInputChange} className="hidden" />
                <span className="text-sm font-medium">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ข้อมูลส่วนตัว (Read Only) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-500 mb-1">ชื่อ-นามสกุล</label>
              <input type="text" className="border rounded-lg px-3 py-2 bg-gray-50" value={userData?.full_name || ''} readOnly />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-500 mb-1">รหัสนักศึกษา</label>
              <input type="text" className="border rounded-lg px-3 py-2 bg-gray-50 font-mono" value={userData?.student_id || ''} readOnly />
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="text-xs font-semibold text-gray-500 mb-1">คณะ/สาขา</label>
              <input type="text" className="border rounded-lg px-3 py-2 bg-gray-50" value={`${userData?.faculty_name || ''} / ${userData?.program_name || ''}`} readOnly />
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-500 mb-1">ชั้นปีที่</label>
              <input type="number" name="yearLevel" className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.yearLevel} onChange={handleInputChange} required />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-500 mb-1">นักศึกษาภาค</label>
              <div className="flex gap-4 mt-1">
                {['ปกติ', 'สมทบ'].map(t => (
                  <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="studentType" value={t} checked={formData.studentType === t} onChange={handleInputChange} /> {t}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ข้อมูลที่อยู่ติดต่อ */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-700 border-l-4 border-blue-600 pl-3">ที่อยู่ปัจจุบันที่ติดต่อได้</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            {[
              { label: 'เลขที่', name: 'address.no' },
              { label: 'หมู่ที่', name: 'address.moo' },
              { label: 'หมู่บ้าน/อาคาร', name: 'address.village' },
              { label: 'ซอย', name: 'address.soi' },
              { label: 'ถนน', name: 'address.road' },
              { label: 'ตำบล/แขวง', name: 'address.subdistrict' },
              { label: 'อำเภอ/เขต', name: 'address.district' },
              { label: 'จังหวัด', name: 'address.province' },
              { label: 'รหัสไปรษณีย์', name: 'address.zipcode' },
              { label: 'โทรศัพท์', name: 'phone' }
            ].map((field) => (
              <div key={field.name} className="flex flex-col">
                <label className="text-[10px] uppercase font-bold text-gray-400 mb-1">{field.label}</label>
                <input type="text" name={field.name} onChange={handleInputChange} className="border-b border-gray-200 py-1 outline-none focus:border-blue-500 text-sm" />
              </div>
            ))}
          </div>
        </div>

        {/* รายละเอียดความประสงค์ */}
        <div className="flex flex-wrap items-center gap-4 bg-gray-50 p-4 rounded-lg">
          <span className="font-semibold text-sm">ในภาคการศึกษาที่:</span>
          {['1', '2', 'ฤดูร้อน'].map((s) => (
            <label key={s} className="flex items-center gap-1 text-sm"><input type="radio" name="semester" value={s} checked={formData.semester === s} onChange={handleInputChange} /> {s}</label>
          ))}
          <span className="text-sm ml-4">ปีการศึกษา:</span>
          <input type="text" name="academicYear" className="border rounded px-2 py-1 w-24 text-center text-sm" value={formData.academicYear} onChange={handleInputChange} />
        </div>

        {/* ตารางจัดการวิชา */}
        <div className="space-y-8">
          {(formData.requestType === 'late_add' || formData.requestType === 'late_both') && (
            <div className="space-y-3">
              <h3 className="font-bold text-green-700">รายวิชาที่ต้องการเพิ่ม</h3>
              <CourseTable 
                data={formData.addCourses} 
                type="add" 
                onChange={handleTableChange} 
                onAdd={() => addRow('add')}
                onRemove={(id) => removeRow('add', id)} // ส่งฟังก์ชันลบไป
              />
            </div>
          )}

          {(formData.requestType !== 'late_add') && (
            <div className="space-y-3">
              <h3 className="font-bold text-red-700">รายวิชาที่ต้องการถอน</h3>
              <CourseTable 
                data={formData.dropCourses} 
                type="drop" 
                onChange={handleTableChange} 
                onAdd={() => addRow('drop')}
                onRemove={(id) => removeRow('drop', id)} // ส่งฟังก์ชันลบไป
              />
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-bold mb-2">เนื่องจาก (ระบุเหตุผลความจำเป็น)</label>
          <textarea name="reason" className="border rounded-xl p-4 h-24 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" placeholder="กรุณาระบุเหตุผล..." onChange={handleInputChange}></textarea>
        </div>

        <div className="flex justify-end gap-4 border-t pt-8">
          <button type="button" className="px-8 py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium transition-all">ยกเลิก</button>
          <button type="submit" className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95">ส่งคำร้องเข้าระบบ</button>
        </div>
      </form>
    </div>
  );
};

// Sub-component สำหรับตารางรายวิชา (ปรับปรุงเพิ่มปุ่มลบ)
const CourseTable = ({ data, type, onChange, onAdd, onRemove }) => (
  <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
    <table className="w-full text-sm">
      <thead className={`${type === 'add' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
        <tr>
          <th className="p-3 w-12">ที่</th>
          <th className="p-3 text-left">รหัสวิชา</th>
          <th className="p-3 text-left">ชื่อวิชา (English)</th>
          <th className="p-3 w-20">SEC.</th>
          <th className="p-3 w-20">หน่วยกิต</th>
          <th className="p-3 w-12">ลบ</th> {/* หัวตารางปุ่มลบ */}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.map((item, index) => (
          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
            <td className="p-3 text-center text-gray-400 font-medium">{index + 1}</td>
            <td className="p-2"><input type="text" className="w-full p-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-blue-400 outline-none" value={item.code} placeholder="รหัสวิชา" onChange={(e) => onChange(type, item.id, 'code', e.target.value)} /></td>
            <td className="p-2"><input type="text" className="w-full p-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-blue-400 outline-none" value={item.name} placeholder="Course Name" onChange={(e) => onChange(type, item.id, 'name', e.target.value)} /></td>
            <td className="p-2"><input type="text" className="w-full p-1.5 border border-gray-200 rounded text-center focus:ring-1 focus:ring-blue-400 outline-none" value={item.sec} placeholder="01" onChange={(e) => onChange(type, item.id, 'sec', e.target.value)} /></td>
            <td className="p-2"><input type="number" className="w-full p-1.5 border border-gray-200 rounded text-center focus:ring-1 focus:ring-blue-400 outline-none" value={item.credits} placeholder="3" onChange={(e) => onChange(type, item.id, 'credits', e.target.value)} /></td>
            <td className="p-2 text-center">
              {/* ปุ่มลบแถว */}
              <button 
                type="button" 
                onClick={() => onRemove(item.id)}
                className="text-red-400 hover:text-red-600 p-1 transition-colors"
                title="ลบแถวนี้"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <button type="button" onClick={onAdd} className="w-full p-3 bg-gray-50 text-gray-500 hover:text-blue-600 hover:bg-blue-50 text-xs font-bold transition-all border-t border-gray-100">+ เพิ่มแถวรายวิชา</button>
  </div>
);

export default EnrollmentAdjustmentForm;