import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);
  
  const [formData, setFormData] = useState({
    id: '',
    department_name: '',
    faculty_id: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  // โหลดข้อมูลเมื่อเข้าหน้าเว็บ
  useEffect(() => {
    fetchDepartments();
    fetchFaculties();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchFaculties = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/faculties');
      setFaculties(response.data);
    } catch (error) {
      console.error('Error fetching faculties:', error);
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
        await axios.put(`http://localhost:5000/api/departments/${formData.id}`, formData);
        setMessage('แก้ไขข้อมูลเรียบร้อย');
      } else {
        await axios.post('http://localhost:5000/api/departments', formData);
        setMessage('เพิ่มข้อมูลเรียบร้อย');
      }
      
      // Reset Form
      setFormData({ id: '', department_name: '', faculty_id: '' });
      setIsEditing(false);
      fetchDepartments();
    } catch (error) {
      setMessage('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (dept) => {
    setFormData(dept);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณต้องการลบสาขาวิชานี้ใช่หรือไม่?')) {
      try {
        await axios.delete(`http://localhost:5000/api/departments/${id}`);
        fetchDepartments();
      } catch (error) {
        alert('ลบไม่ได้: ' + (error.response?.data?.message || 'เกิดข้อผิดพลาด'));
      }
    }
  };

  const handleCancel = () => {
    setFormData({ id: '', department_name: '', faculty_id: '' });
    setIsEditing(false);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-['Inter']">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">จัดการข้อมูลสาขาวิชา (Departments)</h1>
            <Link to="/staff-dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium">
                &larr; กลับไปหน้า Dashboard
            </Link>
        </div>

        {/* --- Form Section --- */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-t-4 border-pink-500">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {isEditing ? 'แก้ไขสาขาวิชา' : 'เพิ่มสาขาวิชาใหม่'}
          </h2>
          
          {message && (
            <div className={`p-3 mb-4 rounded ${message.includes('ผิดพลาด') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสาขาวิชา (Department Name)</label>
              <input 
                type="text" 
                name="department_name" 
                value={formData.department_name} 
                onChange={handleChange} 
                required
                className="w-full p-2 border rounded-md focus:ring-pink-500 focus:border-pink-500" 
                placeholder="เช่น เทคโนโลยีสารสนเทศ"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">สังกัดคณะ (Faculty)</label>
              <select 
                name="faculty_id" 
                value={formData.faculty_id} 
                onChange={handleChange} 
                required
                className="w-full p-2 border rounded-md focus:ring-pink-500 focus:border-pink-500 bg-white"
              >
                <option value="">-- กรุณาเลือกคณะ --</option>
                {faculties.map(faculty => (
                  <option key={faculty.id} value={faculty.id}>{faculty.faculty_name}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2 flex gap-3 mt-2">
              <button type="submit" className={`flex-1 py-2 px-4 rounded-md text-white font-medium transition-colors ${
                  isEditing ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-pink-600 hover:bg-pink-700'}`}>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อสาขาวิชา</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สังกัดคณะ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departments.length > 0 ? (
                departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{dept.department_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.faculty_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(dept)} className="text-indigo-600 hover:text-indigo-900 mr-4">แก้ไข</button>
                      <button onClick={() => handleDelete(dept.id)} className="text-red-600 hover:text-red-900">ลบ</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">ไม่พบข้อมูลสาขาวิชา</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DepartmentManagement;