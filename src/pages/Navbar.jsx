import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    if (!user) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } else {
      setCurrentUser(user);
    }
  }, [user]);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  // --- Helper Functions ---

  // ตรวจสอบ Role เพื่อกำหนด Link หน้าแรก
  const getHomeLink = () => {
    if (currentUser?.role === 'staff') return '/staff-dashboard';
    if (currentUser?.role === 'approver') return '/approver-dashboard';
    return '/mainscreen'; // หรือ /mainscreen ตาม flow ของนักศึกษา
  };

  // ฟังก์ชันแสดงชื่อตำแหน่งภาษาไทย
  const getRoleDisplayName = () => {
    switch (currentUser?.role) {
      case 'staff':
        return 'ผู้ดูแลระบบ';
      case 'approver':
        return 'อาจารย์'; // หรือ 'ผู้อนุมัติ' ตามต้องการ
      case 'student':
        return 'นักศึกษา';
      default:
        return 'ผู้ใช้งานทั่วไป';
    }
  };

  return (
    <nav className="bg-white shadow-lg drop-shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate(getHomeLink())}>
            <img 
              src="/images/RMUTTO_LOGO.png" 
              alt="logo1" 
              className="h-12 w-auto mr-2" 
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/48x48/4A5568/FFFFFF?text=LOGO" }} 
            />
            <img 
              src='/images/RMUTTO_LOGO2.png' 
              alt='logo2' 
              className="h-12 w-auto hidden sm:block" 
              onError={(e) => { e.target.onerror = null; e.target.style.display = 'none' }} 
            />
          </div>

          {/* Main Menu Links */}
          <ul className="flex space-x-4">
            <li>
              <Link to={getHomeLink()} className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                หน้าหลัก
              </Link>
            </li>
            
            {/* แสดงเมนูตาม Role */}
            {currentUser?.role === 'staff' && (
              <li>
                <Link to="/StudentApprovalPage" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  อนุมัตินักศึกษา
                </Link>
              </li>
            )}

            {currentUser?.role === 'student' && (
              <li>
                <Link to="/forms" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  ส่งแบบคำร้อง
                </Link>
              </li>
            )}
            
            {/* อาจารย์ (Approver) อาจจะมีเมนูเฉพาะ เช่น ประวัติการอนุมัติ */}
             {currentUser?.role === 'approver' && (
              <li>
                <Link to="/approver-dashboard" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  รายการรออนุมัติ
                </Link>
              </li>
            )}

            <li>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                ติดต่อ
              </Link>
            </li>
          </ul>

          {/* User Profile Section */}
          <div>
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <div className="text-right hidden md:block">
                  {/* 1. แสดงตำแหน่ง (Role) */}
                  <div className="text-xs text-blue-600 font-bold uppercase tracking-wide">
                    {getRoleDisplayName()}
                  </div>
                  {/* 2. แสดงชื่อ (Full Name) */}
                  <div className="text-gray-700 font-medium text-sm truncate max-w-[150px]">
                    {/* ใช้ full_name เป็นหลัก ตาม Database ที่ให้มา */}
                    {currentUser.full_name || currentUser.username || "Unknown User"} 
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors group"
                  title="ออกจากระบบ"
                >
                  <img src="/images/logout1.png" alt="Logout" className="h-8 w-auto group-hover:opacity-75" />
                </button>

                {/* ปุ่ม Setting (ซ่อนสำหรับ Staff และ Approver หรือจะเปิดให้ทุกคนก็ได้) */}
                {

                  <button
                    onClick={() => navigate('/edit-personal-info')}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    title="แก้ไขข้อมูลส่วนตัว"
                  >
                    <img src="/images/setting.png" alt="Settings" className="h-6 w-auto" />
                  </button>
              }
              </div>
            ) : (
              <Link 
                to="/"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
              >
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;