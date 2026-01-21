import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function StudentSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setSelectedStudent(null); // ปิดการแสดงรายละเอียดของเก่า

    try {
      const response = await axios.get(`/staff/api/students/search?q=${query}`);
      setResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
      alert('เกิดข้อผิดพลาดในการค้นหา');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case '1': return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">อนุมัติแล้ว</span>;
      case '2': return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">ปฏิเสธ</span>;
      default: return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">รอพิจารณา</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-['Inter']">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ค้นหาข้อมูลนักศึกษา</h1>
              <p className="text-gray-500 mt-1">กรอกรหัสนักศึกษา หรือชื่อ-นามสกุล เพื่อค้นหา</p>
            </div>
            <Link to="/staff-dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium">
                &larr; กลับไปหน้า Dashboard
            </Link>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="เช่น STU001, สมชาย..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center"
            >
              {loading ? 'กำลังค้นหา...' : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  ค้นหา
                </>
              )}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Results List */}
          <div className="lg:col-span-1 space-y-4">
            {hasSearched && results.length === 0 && !loading && (
              <div className="text-center text-gray-500 py-8 bg-white rounded-xl shadow-sm">
                ไม่พบข้อมูลนักศึกษาที่ค้นหา
              </div>
            )}

            {results.map((student) => (
              <div 
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={`bg-white p-4 rounded-xl shadow-sm cursor-pointer transition-all border-l-4 hover:shadow-md ${
                  selectedStudent?.id === student.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-transparent hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-gray-900">{student.student_id}</span>
                  {getStatusBadge(student.status)}
                </div>
                <div className="text-gray-800 font-medium">{student.full_name}</div>
                <div className="text-sm text-gray-500 mt-1 truncate">{student.department_name || '-'}</div>
              </div>
            ))}
          </div>

          {/* Student Details View */}
          <div className="lg:col-span-2">
            {selectedStudent ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden border-t-4 border-blue-500">
                <div className="p-6 bg-blue-50 border-b border-blue-100 flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedStudent.full_name}</h2>
                    <p className="text-blue-600 font-semibold text-lg">รหัส: {selectedStudent.student_id}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">สถานะภาพ</div>
                    <div className="mt-1">{getStatusBadge(selectedStudent.status)}</div>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                  {/* ข้อมูลการศึกษา */}
                  <div className="col-span-2">
                    <h3 className="text-md font-semibold text-gray-900 border-b pb-2 mb-3">ข้อมูลการศึกษา</h3>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500 uppercase font-semibold">คณะ</label>
                    <p className="text-gray-900">{selectedStudent.faculty_name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase font-semibold">สาขาวิชา</label>
                    <p className="text-gray-900">{selectedStudent.department_name || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 uppercase font-semibold">อาจารย์ที่ปรึกษา</label>
                    <p className="text-gray-900">
                      {selectedStudent.advisor_name ? `${selectedStudent.advisor_prefix || ''} ${selectedStudent.advisor_name}` : '- ไม่ระบุ -'}
                    </p>
                  </div>

                  {/* ข้อมูลติดต่อ */}
                  <div className="col-span-2 mt-2">
                    <h3 className="text-md font-semibold text-gray-900 border-b pb-2 mb-3">ข้อมูลติดต่อ</h3>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 uppercase font-semibold">อีเมล</label>
                    <p className="text-gray-900">{selectedStudent.email || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 uppercase font-semibold">ที่อยู่</label>
                    <p className="text-gray-900 text-sm leading-relaxed">
                      {selectedStudent.address_no && `เลขที่ ${selectedStudent.address_no} `}
                      {selectedStudent.address_moo && `หมู่ ${selectedStudent.address_moo} `}
                      {selectedStudent.address_soi && `ซอย ${selectedStudent.address_soi} `}
                      {selectedStudent.address_street && `ถนน ${selectedStudent.address_street} `}
                      <br/>
                      {selectedStudent.address_subdistrict && `ต.${selectedStudent.address_subdistrict} `}
                      {selectedStudent.address_district && `อ.${selectedStudent.address_district} `}
                      <br/>
                      {selectedStudent.address_province && `จ.${selectedStudent.address_province} `}
                      {selectedStudent.address_postcode && `${selectedStudent.address_postcode}`}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 h-full min-h-[300px] flex flex-col items-center justify-center text-gray-400">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z"></path></svg>
                <p>เลือกรายการนักศึกษาทางซ้ายเพื่อดูรายละเอียด</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentSearch;