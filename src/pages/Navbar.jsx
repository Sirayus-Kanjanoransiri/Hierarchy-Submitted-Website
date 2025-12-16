import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

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

  // ฟังก์ชันช่วยเลือก Link หน้าแรกตาม Role
  const isStaff = () => {
    return currentUser?.role === 'staff' || !!currentUser?.staffs_id;
  };

  const getHomeLink = () => {
    if (isStaff()) return '/staff-dashboard';
    return '/main';
  };

  return (
    <nav className="bg-white shadow-lg drop-shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center cursor-pointer" onClick={() => navigate(getHomeLink())}>
            <img src="/images/RMUTTO_LOGO.png" alt="logo1" className="h-12 w-auto mr-2" 
                 onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/48x48/4A5568/FFFFFF?text=LOGO" }} />
            <img src='/images/RMUTTO_LOGO2.png' alt='logo2' className="h-12 w-auto hidden sm:block" 
                 onError={(e) => { e.target.onerror = null; e.target.style.display = 'none' }} />
          </div>

          <ul className="flex space-x-4">
            <li>
              <Link to={getHomeLink()} className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                หน้าหลัก
              </Link>
            </li>
            
            {/* --- เงื่อนไขการแสดงเมนูตาม Role --- */}
            {isStaff() ? (
              // เมนูสำหรับเจ้าหน้าที่: เปลี่ยน Link ไปที่ StudentApprovalPage
              <li>
                <Link to="/StudentApprovalPage" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  อนุมัตินักศึกษา
                </Link>
              </li>
            ) : (
              // เมนูสำหรับนักศึกษา: ส่งแบบคำร้อง
              <li>
                <Link to="/forms" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  ส่งแบบคำร้อง
                </Link>
              </li>
            )}
            
            <li>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                ติดต่อ
              </Link>
            </li>
          </ul>

          <div>
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <div className="text-right hidden md:block">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    {isStaff() ? 'ผู้ดูแลระบบ' : 'นักศึกษา'}
                  </div>
                  <div className="text-gray-700 font-medium text-sm truncate max-w-[150px]">
                    {currentUser.std_name || currentUser.staff_name || currentUser.name} 
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  title="ออกจากระบบ"
                >
                  <img src="/images/logout1.png" alt="Logout" className="h-8 w-auto" />
                </button>
                
                  <button
                    onClick={() => navigate('/edit-personal-info')}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    title="แก้ไขข้อมูลส่วนตัว"
                  >
                    <img src="/images/setting.png" alt="Settings" className="h-6 w-auto" />
                  </button>
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