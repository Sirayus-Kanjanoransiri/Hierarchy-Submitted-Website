import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function StaffManagement() {
  const [staffList, setStaffList] = useState([]);
  
  // State สำหรับฟอร์ม (ตรงกับตาราง staff ใน sql.sql)
  const [formData, setFormData] = useState({
    staff_id: '',
    username: '',
    password: '', // ใช้รับค่าเพื่อส่งไปเก็บใน password_hash
    full_name: '',
    email: '',
    role: 'เจ้าหน้าที่ทั่วไป'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchstaff();
  }, []);

  const fetchstaff = async () => {
    try {
      const response = await axios.get('/admin/api/staff-management');
      setStaffList(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      if (isEditing) {
        // แก้ไข
        await axios.put(`/admin/api/staff-management/${formData.staff_id}`, formData);
        setMessage('แก้ไขข้อมูลเรียบร้อย');
      } else {
        // เพิ่มใหม่
        await axios.post('/admin/api/staff-management', formData);
        setMessage('เพิ่มข้อมูลเรียบร้อย');
      }
      
      // รีเซ็ตฟอร์ม
      setFormData({ staff_id: '', username: '', password: '', full_name: '', email: '', role: 'เจ้าหน้าที่ทั่วไป' });
      setIsEditing(false);
      fetchstaff();
    } catch (error) {
      setMessage('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (staff) => {
    setFormData({
        ...staff,
        password: '' // เคลียร์รหัสผ่าน ไม่ต้องแสดง hash เดิม ให้กรอกใหม่ถ้าอยากเปลี่ยน
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('ยืนยันที่จะลบข้อมูลเจ้าหน้าที่นี้?')) {
      try {
        await axios.delete(`/admin/api/staff-management/${id}`);
        fetchstaff();
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการลบ');
      }
    }
  };

  const handleCancel = () => {
    setFormData({ staff_id: '', username: '', password: '', full_name: '', email: '', role: 'เจ้าหน้าที่ทั่วไป' });
    setIsEditing(false);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-['Inter']">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">จัดการข้อมูลเจ้าหน้าที่ (Staff)</h1>
            <Link to="/staff-dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium">
                &larr; กลับไปหน้า Dashboard
            </Link>
        </div>

        {/* --- Form Section --- */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-t-4 border-yellow-500">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {isEditing ? 'แก้ไขข้อมูล' : 'เพิ่มเจ้าหน้าที่ใหม่'}
          </h2>
          
          {message && (
            <div className={`p-3 mb-4 rounded ${message.includes('ผิดพลาด') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล (Full Name)</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล (Email)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
                placeholder="staff@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้ (Username)</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isEditing ? 'รหัสผ่านใหม่ (ว่างไว้ถ้าไม่เปลี่ยน)' : 'รหัสผ่าน (Password)'}
              </label>
              <input
                type="text"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                // ถ้าเพิ่มใหม่ต้องกรอก แต่ถ้าแก้ไขไม่บังคับ
                required={!isEditing} 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่ง/บทบาท (Role)</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="เช่น เจ้าหน้าที่ทะเบียน, Admin"
              />
            </div>
            
            <div className="md:col-span-2 flex gap-3 mt-2">
              <button
                type="submit"
                className={`flex-1 py-2 px-4 rounded-md text-white font-medium transition-colors ${
                  isEditing ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-yellow-500 hover:bg-yellow-600'
                }`}
              >
                {isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มข้อมูล'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  ยกเลิก
                </button>
              )}
            </div>
          </form>
        </div>

        {/* --- Table Section --- */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staffList.length > 0 ? (
                staffList.map((staff) => (
                  <tr key={staff.staff_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.staff_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{staff.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {staff.role || '-'}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(staff)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(staff.staff_id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    ไม่พบข้อมูลเจ้าหน้าที่
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StaffManagement;