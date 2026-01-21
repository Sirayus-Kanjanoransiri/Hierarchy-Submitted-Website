import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function RoleManagement() {
  const [roles, setRoles] = useState([]);
  
  const [formData, setFormData] = useState({
    id: '',
    role_name: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  // โหลดข้อมูลเมื่อเข้าหน้าเว็บ
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get('/admin/api/roles');
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
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
        await axios.put(`/admin/api/roles/${formData.id}`, formData);
        setMessage('แก้ไขข้อมูลเรียบร้อย');
      } else {
        await axios.post('/admin/api/roles', formData);
        setMessage('เพิ่มข้อมูลเรียบร้อย');
      }
      
      // Reset Form
      setFormData({ id: '', role_name: '' });
      setIsEditing(false);
      fetchRoles();
    } catch (error) {
      setMessage('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณต้องการลบตำแหน่งนี้ใช่หรือไม่?')) {
      try {
        await axios.delete(`/admin/api/roles/${id}`);
        fetchRoles();
      } catch (error) {
        alert('ลบไม่ได้: ' + (error.response?.data?.message || 'เกิดข้อผิดพลาด'));
      }
    }
  };

  const handleCancel = () => {
    setFormData({ id: '', role_name: '' });
    setIsEditing(false);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-['Inter']">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">จัดการข้อมูลตำแหน่ง (Roles)</h1>
            <Link to="/staff-dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium">
                &larr; กลับไปหน้า Dashboard
            </Link>
        </div>

        {/* --- Form Section --- */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-t-4 border-orange-500">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {isEditing ? 'แก้ไขข้อมูลตำแหน่ง' : 'เพิ่มตำแหน่งใหม่'}
          </h2>
          
          {message && (
            <div className={`p-3 mb-4 rounded ${message.includes('ผิดพลาด') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อตำแหน่ง (Role Name)</label>
              <input 
                type="text" 
                name="role_name" 
                value={formData.role_name} 
                onChange={handleChange} 
                required
                className="w-full p-2 border rounded-md focus:ring-orange-500 focus:border-orange-500" 
                placeholder="เช่น คณบดี, หัวหน้าสาขา"
              />
            </div>
            
            <div className="flex gap-3 mt-2">
              <button type="submit" className={`flex-1 py-2 px-4 rounded-md text-white font-medium transition-colors ${
                  isEditing ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-orange-600 hover:bg-orange-700'}`}>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อตำแหน่ง</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.length > 0 ? (
                roles.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{item.role_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(item)} className="text-indigo-600 hover:text-indigo-900 mr-4">แก้ไข</button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">ลบ</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">ไม่พบข้อมูลตำแหน่ง</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RoleManagement;