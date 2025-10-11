import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    if (!user) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    }
  }, [user]);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <img src="/images/RMUTTO_LOGO.png" alt="logo1" className="h-12 w-auto mr-2" />
            <img src='/images/RMUTTO_LOGO2.png' alt='logo2' className="h-12 w-auto" />
          </div>

          <ul className="flex space-x-4">
            <li><Link to="/" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">หน้าหลัก</Link></li>
            <li><Link to="/requestforms" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">ส่งแบบคำร้อง</Link></li>
            <li><Link to="/contact" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">ติดต่อ</Link></li>
          </ul>

          <div>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-medium text-lg">ยินดีต้อนรับ {user.std_name}</span>
                <button 
                  onClick={onLogout} 
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                ลงชื่อเข้าใช้
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
