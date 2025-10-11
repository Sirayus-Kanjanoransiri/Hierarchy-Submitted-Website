import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function AllFormPages() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();

  const hasUserData = () => {
    return !!localStorage.getItem('user'); 
  };

  const handleClick = (path) => {
    if (hasUserData()) {
      navigate(path);       
    } else {
      navigate('/login');    
    }
  };

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              All Student Request Forms
            </h1>
            <h2 className="text-3xl font-semibold text-blue-600 mb-6">
              แบบคำร้องทั้งหมด
            </h2>
          </div>

          <ul className="space-y-6">
            <div className="dropdown">
              <button onClick={() => toggleDropdown('dropdown1')} className="dropdown-button bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600">
                ใบคำร้องเกี่ยวกับงานทะเบียน {openDropdown === 'dropdown1' ? '▲' : '▼'}
              </button>
              <ul className={`dropdown-list${openDropdown === 'dropdown1' ? ' open' : ''} mt-2 space-y-2`}>  
                <li onClick={() => handleClick('/requestforms/general')} className="text-gray-700 hover:text-blue-500 cursor-pointer">ใบคำร้องทั่วไป</li>
                <li className="text-gray-700 hover:text-blue-500 cursor-pointer">Option 1-2</li>
                <li className="text-gray-700 hover:text-blue-500 cursor-pointer">Option 1-3</li>
              </ul>
            </div>

            <div className="dropdown">
              <button onClick={() => toggleDropdown('dropdown2')} className="dropdown-button bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600">
                ใบคำร้องเกี่ยวกับการลงทะเบียน {openDropdown === 'dropdown2' ? '▲' : '▼'}
              </button>
              <ul className={`dropdown-list${openDropdown === 'dropdown2' ? ' open' : ''} mt-2 space-y-2`}>  
                <li onClick={() => handleClick('/requestforms/general')} className="text-gray-700 hover:text-green-500 cursor-pointer">ใบคำร้องทั่วไป</li>
                <li><Link to="/requestforms/under-credit" className="text-gray-700 hover:text-green-500">ใบคำร้องลงทะเบียนต่ำกว่าหน่วยกิต</Link></li>
                <li className="text-gray-700 hover:text-green-500 cursor-pointer">Option 2-3</li>
              </ul>
            </div>

            <div className="dropdown">
              <button onClick={() => toggleDropdown('dropdown3')} className="dropdown-button bg-orange-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-orange-600">
                ใบคำร้องเกี่ยวกับนักศึกษาเทียบโอน {openDropdown === 'dropdown3' ? '▲' : '▼'}
              </button>
              <ul className={`dropdown-list${openDropdown === 'dropdown3' ? ' open' : ''} mt-2 space-y-2`}>  
                <li className="text-gray-700 hover:text-orange-500 cursor-pointer">Option 3-1</li>
                <li className="text-gray-700 hover:text-orange-500 cursor-pointer">Option 3-2</li>
                <li className="text-gray-700 hover:text-orange-500 cursor-pointer">Option 3-3</li>
              </ul>
            </div>

            <div className="dropdown">
              <button onClick={() => toggleDropdown('dropdown4')} className="dropdown-button bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-600">
                ใบคำร้องสำหรับผู้สำเร็จการศึกษา {openDropdown === 'dropdown4' ? '▲' : '▼'}
              </button>
              <ul className={`dropdown-list${openDropdown === 'dropdown4' ? ' open' : ''} mt-2 space-y-2`}>  
                <li className="text-gray-700 hover:text-red-500 cursor-pointer">Option 4-1</li>
                <li className="text-gray-700 hover:text-red-500 cursor-pointer">Option 4-2</li>
                <li className="text-gray-700 hover:text-red-500 cursor-pointer">Option 4-3</li>
              </ul>
            </div>

            <div className="dropdown">
              <button onClick={() => toggleDropdown('dropdown5')} className="dropdown-button bg-purple-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-purple-600">
                หนังสือมอบอำนาจ {openDropdown === 'dropdown5' ? '▲' : '▼'}
              </button>
              <ul className={`dropdown-list${openDropdown === 'dropdown5' ? ' open' : ''} mt-2 space-y-2`}>  
                <li className="text-gray-700 hover:text-purple-500 cursor-pointer">Option 5-1</li>
                <li className="text-gray-700 hover:text-purple-500 cursor-pointer">Option 5-2</li>
                <li className="text-gray-700 hover:text-purple-500 cursor-pointer">Option 5-3</li>
              </ul>
            </div>
          </ul>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm">
            © {new Date().getFullYear()} มหาวิทยาลัยเทคโนโลยีราชมงคลตะวันออก
          </p>
        </div>
      </footer>
    </div>
  );
}

export default AllFormPages;
