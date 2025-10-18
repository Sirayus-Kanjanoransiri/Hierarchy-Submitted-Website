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

  const hasUserData = () => {
    // This function assumes 'user' is stored in localStorage to determine login status.
    return !!localStorage.getItem('std_id');
  };

  const handleClick = (path, event) => {
    event.stopPropagation();

    // Check if path is provided, otherwise it's just a placeholder click
    if (!path) {
      console.log('Dropdown item clicked - path is a placeholder.');
      return;
    }

    if (hasUserData()) {
      navigate(path);
    } else {
      navigate('/');
    }
  };

  const toggleDropdown = (dropdownName) => {
    // Close all other dropdowns when opening a new one
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

  const DropdownSection = ({ title, dropdownName, children, iconClass }) => (
    // NOTE: Removed 'relative' class from the outer div.
    <div className="mb-4"> 
      {/* Dropdown Button */}
      <button
        onClick={() => toggleDropdown(dropdownName)}
        className="w-full text-left flex items-center justify-between p-4 bg-gray-100 border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out"
        aria-expanded={openDropdown[dropdownName]}
        aria-controls={`dropdown-menu-${dropdownName}`}
      >
        <span className="flex items-center">
          <i className={`text-2xl text-indigo-500 mr-3 ${iconClass}`}></i>
          <span className="text-lg font-medium text-gray-800">{title}</span>
        </span>
        <svg
          className={`w-5 h-5 text-indigo-500 transition-transform duration-300 ${
            openDropdown[dropdownName] ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>

      {/* Dropdown Content - MODIFIED FOR FLOW */}
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
          
          <div className="grid gap-0"> {/* Adjusted gap since DropdownSection now includes mb-4 */}
            {/* 1. ใบคำร้องเกี่ยวกับงานทะเบียน (Dropdown 1) */}
            <DropdownSection 
              title="ใบคำร้องเกี่ยวกับงานทะเบียน" 
              dropdownName="dropdown1"
              iconClass="fas fa-file-alt" 
            >
              <DropdownItem path="/forms/academic-request-1">ทน.01 ใบคำร้องขอพักการศึกษา</DropdownItem>
              <DropdownItem path="/forms/academic-request-2">ทน.02 ใบคำร้องขอกลับเข้าเป็นนักศึกษา</DropdownItem>
              <DropdownItem path="/forms/academic-request-3">ทน.03 ใบคำร้องขอรักษาสภาพการเป็นนักศึกษา</DropdownItem>
              <DropdownItem path="/forms/academic-request-4">ทน.04 ใบคำร้องขอผ่อนผันสภาพการเป็นนักศึกษาตามข้อบังคับฯ ข้อ 22.4</DropdownItem>
              <DropdownItem path="/forms/academic-request-5">ทน.05 ใบคำร้องขอศึกษาโดยไม่นับหน่วยกิต (AU)</DropdownItem>
              <DropdownItem path="/forms/academic-request-6">ทน.06 ใบคำร้องทั่วไป (ทดสอบตัวนี้)</DropdownItem>
              <DropdownItem path="/forms/academic-request-7">ทน.07 ใบคำขอเปลี่ยนชื่อ</DropdownItem>
              <DropdownItem path="/forms/academic-request-8">ทน.08 หนังสือรับรองจากผู้ปกครอง</DropdownItem>
              <DropdownItem path="/forms/academic-request-9">ทน.12 ใบคำร้องขอคืนสภาพการเป็นนักศึกษา</DropdownItem>
              <DropdownItem path="/forms/academic-request-10">ทน.14 ใบคำร้องขอมีบัตรประจำตัวนักศึกษา</DropdownItem>
              <DropdownItem path="/forms/academic-request-11">ใบคำขอใช้บริการบัตรกรุงไทย (บัตรประจำตัวนักศึกษา) ***สำหรับนักศึกษารหัส 62 เป็นต้นไป</DropdownItem>
              <DropdownItem path="/forms/academic-request-12">ทน.17 ใบคำร้องขอรหัสผ่าน</DropdownItem>
              <DropdownItem path="/forms/academic-request-13">ใบตรวจสุขภาพ</DropdownItem>
              <DropdownItem path="/forms/academic-request-14">ใบคำร้องขออนุญาตสอบ</DropdownItem>
              <DropdownItem path="/forms/academic-request-15">ทน.19 ใบคำร้องขอลาออก</DropdownItem>
              <DropdownItem path="/forms/academic-request-16">ทน.20 ใบคำร้องขอย้ายสาขาวิชา/คณะ</DropdownItem>
              <DropdownItem path="/forms/academic-request-17">ทน.21 ใบคำร้องขอโอนย้ายสถาบัน</DropdownItem>
              <DropdownItem path="/forms/academic-request-18">ทน.09 แบบคำร้องขอหนังสือสำคัญทางการศึกษา</DropdownItem>
            </DropdownSection>
            
            {/* 2. ใบคำร้องเกี่ยวกับการลงทะเบียน (Dropdown 2) */}
            <DropdownSection 
              title="ใบคำร้องเกี่ยวกับการลงทะเบียน" 
              dropdownName="dropdown2"
              iconClass="fas fa-edit" // Placeholder icon
            >
              <DropdownItem path="/forms/enroll-request-1">ใบคำร้องขอลงทะเบียนเรียนเกินกว่าหน่วยกิตที่กำหนด</DropdownItem>
              <DropdownItem path="/forms/enroll-request-2">ใบคำร้องขอลงทะเบียนเรียนต่ำกว่าหน่วยกิตที่กำหนด</DropdownItem>
              <DropdownItem path="/forms/enroll-request-3">ทน.13 ใบคำร้องขอลงทะเบียนเรียนช้า</DropdownItem>
              <DropdownItem path="/forms/enroll-request-4">ทน.16 ใบคำร้องขอเปลี่ยนวิชาเลือก</DropdownItem>
              <DropdownItem path="/forms/enroll-request-5">ใบคำร้องขอเปลี่ยนกลุ่มเรียน</DropdownItem>
              <DropdownItem path="/forms/enroll-request-6">ใบคำร้องขอถอนรายวิชาโดยได้รับอักษร W</DropdownItem>
              <DropdownItem path="/forms/enroll-request-7">ใบคำร้องขอเพิ่ม – ถอนรายวิชาล่าช้า</DropdownItem>
              <DropdownItem path="/forms/enroll-request-8">ใบคำร้องขอลงทะเบียนเรียนล่าช้า</DropdownItem>
              <DropdownItem path="/forms/enroll-request-9">ใบคำร้องขอขอยกเลิกการลงทะเบียนเรียน</DropdownItem>
              <DropdownItem path="/forms/enroll-request-10">ใบคำร้องขอยืนยันการลงทะเบียนเรียน</DropdownItem>
            </DropdownSection>

            {/* 3. ใบคำร้องสำหรับนักศึกษาเทียบโอน (Dropdown 3) */}
            <DropdownSection 
              title="ใบคำร้องสำหรับนักศึกษาเทียบโอน" 
              dropdownName="dropdown3"
              iconClass="fas fa-exchange-alt" // Placeholder icon
            >
              <DropdownItem path="/forms/transfer-request-1">ใบคำร้องขอลงทะเบียนเรียนรายวิชาต่อเนื่องควบคู่กับรายวิชาบังคับก่อน</DropdownItem>
              <DropdownItem path="/forms/transfer-request-2">ใบคำร้องขอเทียบโอนผลการศึกษา (ศึกษาทั่วไป ปรับปรุง พ.ศ. 2559)</DropdownItem>
              <DropdownItem path="/forms/transfer-request-3">ใบคำร้องขอเทียบโอนผลการศึกษา (ศึกษาทั่วไป ปรับปรุง พ.ศ. 2566)</DropdownItem>
              <DropdownItem path="/forms/transfer-request-4">ใบคำร้องขอเทียบโอนผลการศึกษา กรณี MOU (ศึกษาทั่วไป ปรับปรุง พ.ศ. 2559)</DropdownItem>
              <DropdownItem path="/forms/transfer-request-5">ใบคำร้องขอเทียบโอนผลการศึกษา กรณี MOU (ศึกษาทั่วไป ปรับปรุง พ.ศ. 2566)</DropdownItem>
              <DropdownItem path="/forms/transfer-request-6">ใบคำร้องขอเปลี่ยนแปลงรายวิชาที่ขอเทียบโอนผลการศึกษา</DropdownItem>
              <DropdownItem path="/forms/transfer-request-7">ใบคำร้องขอเพิ่มรายวิชาที่ขอเทียบโอนผลการศึกษา</DropdownItem>
            </DropdownSection>

            {/* 4. ใบคำร้องสำหรับผู้สำเร็จการศึกษา (Dropdown 4) */}
            <DropdownSection 
              title="ใบคำร้องสำหรับผู้สำเร็จการศึกษา" 
              dropdownName="dropdown4"
              iconClass="fas fa-graduation-cap" // Placeholder icon
            >
              <DropdownItem path="/forms/grad-request-1">ทน.02 แบบคำร้องขอสำเร็จการศึกษา</DropdownItem>
              <DropdownItem path="/forms/grad-request-2">ทน.03 แบบคำร้องขอรับรองการสำเร็จการศึกษา</DropdownItem>
              <DropdownItem path="/forms/grad-request-3">ทน.09 แบบคำร้องขอหนังสือสำคัญทางการศึกษา ⇒ ดาวน์โหลด ⇐ ⇒ แบบคำร้องออนไลน์ ⇐</DropdownItem>
              <DropdownItem path="/forms/grad-request-4">ทน.18 ข้อแก้ไระดับคะแนน ม.ส. (I)</DropdownItem>
              <DropdownItem path="/forms/grad-request-5">มทส.01 ใบคำร้องขอเลื่อนการเข้ารับพระราชทานปริญญาบัตร</DropdownItem>
              <DropdownItem path="/forms/grad-request-6">ใบคำร้องขอเข้ารับพระราชทานปริญญาบัตร</DropdownItem>
              <DropdownItem path="/forms/grad-request-7">มทส.42 ใบคำร้องขอสำเร็จการศึกษาและขึ้นทะเบียนบัณฑิต/มหาบัณฑิต</DropdownItem>
              <DropdownItem path="/forms/grad-request-8">ใบคำร้องขอรับปริญญาบัตร</DropdownItem>
              <DropdownItem path="/forms/grad-request-9">ใบคำร้องขอเปลี่ยนคำนำนามบัณฑิต</DropdownItem>
            </DropdownSection>

            {/* 5. หนังสือมอบอำนาจ (Dropdown 5) */}
            <DropdownSection 
              title="หนังสือมอบอำนาจ" 
              dropdownName="dropdown5"
              iconClass="fas fa-handshake" // Placeholder icon
            >
              <DropdownItem path="/forms/power-of-attorney">หนังสือมอบอำนาจ</DropdownItem>
            </DropdownSection>
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