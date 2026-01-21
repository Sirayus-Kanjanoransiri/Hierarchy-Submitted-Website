import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ApproverManagement() {
  const [approvers, setApprovers] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  const [formData, setFormData] = useState({
    id: '',
    approver_prefix: '',
    full_name: '',
    username: '',
    password: '',
    email: '',
    department_id: '',
    approver_tel: '',
    is_active: 1
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  // โหลดข้อมูลเมื่อเข้าหน้าเว็บ
  useEffect(() => {
    fetchApprovers();
    fetchDepartments();
  }, []);

  const fetchApprovers = async () => {
    try {
      const response = await axios.get('/admin/api/approvers');
      setApprovers(response.data);
    } catch (error) {
      console.error('Error fetching approvers:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/admin/api/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      if (isEditing) {
        await axios.put(`/admin/api/approvers/${formData.id}`, formData);
        setMessage('แก้ไขข้อมูลเรียบร้อย');
      } else {
        await axios.post('/admin/api/approvers', formData);
        setMessage('เพิ่มข้อมูลเรียบร้อย');
      }
      
      // Reset Form
      setFormData({ 
        id: '', approver_prefix: '', full_name: '', username: '', 
        password: '', email: '', department_id: '', approver_tel: '', is_active: 1 
      });
      setIsEditing(false);
      fetchApprovers();
    } catch (error) {
      setMessage('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (item) => {
    setFormData({
        ...item,
        password: '', // Clear password field
        department_id: item.department_id || '' // Handle null department
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณต้องการลบข้อมูลผู้อนุมัตินี้ใช่หรือไม่?')) {
      try {
        await axios.delete(`/admin/api/approvers/${id}`);
        fetchApprovers();
      } catch (error) {
        alert('ลบไม่ได้: ' + (error.response?.data?.message || 'เกิดข้อผิดพลาด'));
      }
    }
  };

  const handleCancel = () => {
    setFormData({ 
      id: '', approver_prefix: '', full_name: '', username: '', 
      password: '', email: '', department_id: '', approver_tel: '', is_active: 1 
    });
    setIsEditing(false);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-['Inter']">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">จัดการข้อมูลผู้อนุมัติ (Approvers)</h1>
            <Link to="/staff-dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium">
                &larr; กลับไปหน้า Dashboard
            </Link>
        </div>

        {/* --- Form Section --- */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-t-4 border-teal-500">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {isEditing ? 'แก้ไขข้อมูลผู้อนุมัติ' : 'เพิ่มผู้อนุมัติใหม่'}
          </h2>
          
          {message && (
            <div className={`p-3 mb-4 rounded ${message.includes('ผิดพลาด') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* คำนำหน้า */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">คำนำหน้า (Prefix)</label>
              <input type="text" name="approver_prefix" value={formData.approver_prefix} onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-teal-500 focus:border-teal-500" placeholder="ดร., ผศ." />
            </div>

            {/* ชื่อ-นามสกุล */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล (Full Name)</label>
              <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required
                className="w-full p-2 border rounded-md focus:ring-teal-500 focus:border-teal-500" />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} required
                className="w-full p-2 border rounded-md focus:ring-teal-500 focus:border-teal-500" />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isEditing ? 'รหัสผ่านใหม่ (ว่างไว้ถ้าไม่แก้)' : 'รหัสผ่าน (Password)'}
              </label>
              <input type="text" name="password" value={formData.password} onChange={handleChange} required={!isEditing}
                className="w-full p-2 border rounded-md focus:ring-teal-500 focus:border-teal-500" />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required
                className="w-full p-2 border rounded-md focus:ring-teal-500 focus:border-teal-500" />
            </div>

            {/* เบอร์โทร */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
              <input type="text" name="approver_tel" value={formData.approver_tel} onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-teal-500 focus:border-teal-500" />
            </div>

            {/* สาขาวิชา (Dropdown) */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">สังกัดสาขาวิชา (Department)</label>
              <select name="department_id" value={formData.department_id} onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-teal-500 focus:border-teal-500 bg-white">
                <option value="">-- ไม่ระบุ / ส่วนกลาง --</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.department_name}</option>
                ))}
              </select>
            </div>

            {/* สถานะ Active */}
            <div className="flex items-center mt-6">
               <input type="checkbox" name="is_active" checked={formData.is_active === 1} 
                onChange={() => setFormData({...formData, is_active: formData.is_active === 1 ? 0 : 1})}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
               <label className="ml-2 block text-sm text-gray-900">เปิดใช้งานบัญชี (Active)</label>
            </div>
            
            {/* Buttons */}
            <div className="md:col-span-2 lg:col-span-3 flex gap-3 mt-4">
              <button type="submit" className={`flex-1 py-2 px-4 rounded-md text-white font-medium transition-colors ${
                  isEditing ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-teal-600 hover:bg-teal-700'}`}>
                {isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มข้อมูล'}
              </button>
              {isEditing && (
                <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สังกัดสาขา</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {approvers.length > 0 ? (
                approvers.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.approver_prefix} {item.full_name}
                      <div className="text-xs text-gray-500">{item.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.department_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(item)} className="text-indigo-600 hover:text-indigo-900 mr-4">แก้ไข</button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">ลบ</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">ไม่พบข้อมูลผู้อนุมัติ</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ApproverManagement;