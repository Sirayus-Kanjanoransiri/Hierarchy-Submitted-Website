import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AllFormPages() {
  const [openDropdown, setOpenDropdown] = useState({
    dropdown1: false, // ใบคำร้องเกี่ยวกับงานทะเบียน
    dropdown2: false, // ใบคำร้องเกี่ยวกับการลงทะเบียน
    dropdown3: false, // ใบคำร้องสำหรับนักศึกษาเทียบโอน
    dropdown4: false, // ใบคำร้องสำหรับผู้สำเร็จการศึกษา
    dropdown5: false, // หนังสือมอบอำนาจ
  });
  const navigate = useNavigate();

  const handleClick = (path, event) => {
    event.stopPropagation();
    if (!path) return;
    navigate(path);
  };

  const toggleDropdown = (dropdownName, isDisabled) => {
    if (isDisabled) return; // ถ้า disabled จะไม่สามารถกดเปิดได้

    setOpenDropdown({
      dropdown1: false,
      dropdown2: false,
      dropdown3: false,
      dropdown4: false,
      dropdown5: false,
      [dropdownName]: !openDropdown[dropdownName],
    });
  };

  const DropdownItem = ({ children, path }) => (
    <button
      className="block w-full text-left px-4 py-3 text-base text-gray-800 hover:bg-gray-200 hover:text-gray-900 transition duration-150 ease-in-out border-b last:border-b-0"
      onClick={(e) => handleClick(path, e)}
    >
      {children}
    </button>
  );

  const DropdownSection = ({ title, dropdownName, children, iconClass, isDisabled }) => (
    <div className={`mb-4 ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}> 
      <button
        onClick={() => toggleDropdown(dropdownName, isDisabled)}
        className={`w-full text-left flex items-center justify-between p-4 border rounded-lg transition duration-300 ease-in-out shadow-md 
          ${isDisabled 
            ? 'bg-gray-200 border-gray-300' 
            : 'bg-gray-100 border-gray-300 hover:shadow-lg'}`}
        disabled={isDisabled}
      >
        <span className="flex items-center">
          <i className={`text-2xl mr-3 ${iconClass} ${isDisabled ? 'text-gray-400' : 'text-indigo-500'}`}></i>
          <span className={`text-lg font-medium ${isDisabled ? 'text-gray-500' : 'text-gray-800'}`}>
            {title} {isDisabled && <span className="ml-2 text-sm italic text-red-500 font-normal">(Coming Soon...)</span>}
          </span>
        </span>
        {!isDisabled && (
          <svg
            className={`w-5 h-5 text-indigo-500 transition-transform duration-300 ${
              openDropdown[dropdownName] ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        )}
      </button>

      {!isDisabled && (
        <div
          id={`dropdown-menu-${dropdownName}`}
          className={`w-full bg-white rounded-lg shadow-xl overflow-hidden transition-[max-height] duration-500 ease-in-out ${
            openDropdown[dropdownName] ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-1 overflow-y-auto">
            {children}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-['Inter']">
      <main className="flex-grow">
        <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-2">
              All Student Request Forms
            </h1>
            <h2 className="text-2xl font-medium text-indigo-600">
              แบบคำร้องทั้งหมด สำหรับนักศึกษา
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              กรุณาเลือกประเภทคำร้องที่ต้องการยื่น
            </p>
          </div>
          
          <div className="grid gap-0">
            {/* 1. เปิดใช้งานปกติ */}
            <DropdownSection 
              title="ใบคำร้องเกี่ยวกับงานทะเบียน" 
              dropdownName="dropdown1"
              iconClass="fas fa-file-alt" 
            >
              <DropdownItem path="/forms/general-request-form">ทน.06 ใบคำร้องทั่วไป</DropdownItem>
            </DropdownSection>
            
            {/* 2. เปิดใช้งานปกติ */}
            <DropdownSection 
              title="ใบคำร้องเกี่ยวกับการลงทะเบียน" 
              dropdownName="dropdown2"
              iconClass="fas fa-edit"
            >
              <DropdownItem path="/forms/overload-registration-form">ใบคำร้องขอลงทะเบียนเรียนเกินกว่าหน่วยกิตที่กำหนด</DropdownItem>
              <DropdownItem path="/forms/underload-registration-form">ใบคำร้องขอลงทะเบียนเรียนต่ำกว่าหน่วยกิตที่กำหนด</DropdownItem>
              <DropdownItem path="/forms/repeat-course-form">ทบ.13 ใบคำร้องขอลงทะเบียนเรียนซ้ำ</DropdownItem>
              <DropdownItem path="/forms/elective-change-request-form">ทบ.16 ใบคำร้องขอเปลี่ยนวิชาเลือก</DropdownItem>
              <DropdownItem path="/forms/course-section-change-form">ใบคำร้องขอเปลี่ยนกลุ่มเรียน</DropdownItem>
              <DropdownItem path="/forms/course-withdrawal-with-w-form">ใบคำร้องขอถอนรายวิชาโดยได้รับอักษร W</DropdownItem>
              <DropdownItem path="/forms/enroll-adjustment-form">ใบคำร้องขอเพิ่ม – ถอนรายวิชาล่าช้า</DropdownItem>
              <DropdownItem path="/forms/late-registration-form">ใบคำร้องขอลงทะเบียนเรียนล่าช้า</DropdownItem>
              <DropdownItem path="/forms/course-cancellation-form">ใบคำร้องขอยกเลิกการลงทะเบียนเรียน</DropdownItem>
              <DropdownItem path="/forms/confirm-registration-form">ใบคำร้องขอยืนยันการลงทะเบียนเรียน</DropdownItem>
            </DropdownSection>

            {/* 3. Disable: ใบคำร้องสำหรับนักศึกษาเทียบโอน */}
            <DropdownSection 
              title="ใบคำร้องสำหรับนักศึกษาเทียบโอน" 
              dropdownName="dropdown3"
              iconClass="fas fa-exchange-alt"
              isDisabled={true}
            />

            {/* 4. Disable: ใบคำร้องสำหรับผู้สำเร็จการศึกษา */}
            <DropdownSection 
              title="ใบคำร้องสำหรับผู้สำเร็จการศึกษา" 
              dropdownName="dropdown4"
              iconClass="fas fa-graduation-cap"
              isDisabled={true}
            />

            {/* 5. Disable: หนังสือมอบอำนาจ */}
            <DropdownSection 
              title="หนังสือมอบอำนาจ" 
              dropdownName="dropdown5"
              iconClass="fas fa-handshake"
              isDisabled={true}
            />
          </div>
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