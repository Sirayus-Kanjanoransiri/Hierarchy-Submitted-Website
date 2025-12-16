import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function EditPersonalInfo() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '', // ว่างไว้ถ้าไม่เปลี่ยน
    // Address fields (Student only)
    address_no: '', address_moo: '', address_soi: '', address_street: '',
    address_subdistrict: '', address_district: '', address_province: '', address_postcode: ''
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // ตรวจสอบ Role
      setRole(parsedUser.role || (parsedUser.staffs_id ? 'staff' : 'student'));
      
      fetchCurrentData(parsedUser);
    } else {
      navigate('/'); 
    }
  }, [navigate]);

  const fetchCurrentData = async (currentUser) => {
    try {
      let response;
      const userRole = currentUser.role || (currentUser.staffs_id ? 'staff' : 'student');

      if (userRole === 'staff') {
        // Staff
        response = await axios.get(`http://localhost:5000/api/staff/${currentUser.staffs_id}`);
        setFormData(prev => ({
            ...prev,
            full_name: response.data.full_name,
            email: response.data.email || ''
        }));
      } else {
        // Student
        const studentId = currentUser.student_id;
        response = await axios.get(`http://localhost:5000/user/${studentId}`);
        const d = response.data;
        setFormData({
            full_name: d.full_name,
            email: d.email || '',
            password: '',
            address_no: d.address_no || '', address_moo: d.address_moo || '',
            address_soi: d.address_soi || '', address_street: d.address_street || '',
            address_subdistrict: d.address_subdistrict || '', address_district: d.address_district || '',
            address_province: d.address_province || '', address_postcode: d.address_postcode || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setMessage({ type: 'error', text: 'ไม่สามารถดึงข้อมูลปัจจุบันได้' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      if (role === 'staff') {
        await axios.put(`http://localhost:5000/api/staff/update-profile/${user.staffs_id}`, {
            email: formData.email,
            password: formData.password,
            full_name: formData.full_name
        });
      } else {
        await axios.put(`http://localhost:5000/api/student/update-profile/${user.student_id}`, formData);
      }

      setMessage({ type: 'success', text: 'บันทึกข้อมูลเรียบร้อยแล้ว' });
      setFormData(prev => ({ ...prev, password: '' }));

    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message) });
    }
  };

  if (loading) return <div className="p-10 text-center font-['Inter']">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-['Inter']">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">แก้ไขข้อมูลส่วนตัว</h1>
        
        <div className="bg-white rounded-xl shadow-md p-8 border-t-4 border-blue-500">
          
          {message.text && (
            <div className={`p-4 mb-6 rounded-md ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* --- ข้อมูลบัญชี --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
                    <input 
                        type="text" name="full_name" 
                        value={formData.full_name} onChange={handleChange}
                        readOnly={role === 'student'} 
                        className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${role==='student' ? 'bg-gray-100 text-gray-500':''}`}
                    />
                    {role === 'student' && <p className="text-xs text-gray-400 mt-1">*นักศึกษาไม่สามารถเปลี่ยนชื่อเองได้ หากต้องการเปลี่ยนโปรดติดต่อฝ่ายทะเบียน</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล (Email)</label>
                    <input 
                        type="email" name="email" 
                        value={formData.email} onChange={handleChange} required
                        className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500" 
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านใหม่ (ว่างไว้ถ้าไม่เปลี่ยน)</label>
                    <input 
                        type="password" name="password" 
                        value={formData.password} onChange={handleChange} 
                        placeholder="********"
                        className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500" 
                    />
                </div>
            </div>

            {/* --- ส่วนที่อยู่ (ปรับปรุงใหม่ เพิ่ม Label) --- */}
            {role === 'student' && (
                <>
                    <hr className="border-gray-200 my-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-4">ข้อมูลที่อยู่</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">บ้านเลขที่</label>
                            <input type="text" name="address_no" value={formData.address_no} onChange={handleChange} className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">หมู่ที่</label>
                            <input type="text" name="address_moo" value={formData.address_moo} onChange={handleChange} className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">ซอย</label>
                            <input type="text" name="address_soi" value={formData.address_soi} onChange={handleChange} className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">ถนน</label>
                            <input type="text" name="address_street" value={formData.address_street} onChange={handleChange} className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">แขวง/ตำบล</label>
                            <input type="text" name="address_subdistrict" value={formData.address_subdistrict} onChange={handleChange} className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">เขต/อำเภอ</label>
                            <input type="text" name="address_district" value={formData.address_district} onChange={handleChange} className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">จังหวัด</label>
                            <input type="text" name="address_province" value={formData.address_province} onChange={handleChange} className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">รหัสไปรษณีย์</label>
                            <input type="text" name="address_postcode" value={formData.address_postcode} onChange={handleChange} className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>
                </>
            )}

            <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors shadow-sm">
                    บันทึกการเปลี่ยนแปลง
                </button>
                <button 
                    type="button" 
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium transition-colors"
                >
                    ยกเลิก
                </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default EditPersonalInfo;