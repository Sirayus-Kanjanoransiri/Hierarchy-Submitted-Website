import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './pages/Navbar';
import Index from './pages/STDLoginPage';
import RegisterPage from './pages/RegisterPage';
import ContactPage from './pages/ContactPage';
import AllFormPages from './pages/AllFormPages';
import AcademicRequest6 from './pages/RequestForms/AcademicRequest6';
import EditPersonalInfo from './pages/EditPersonalInfo';
import StaffDashboard from './pages/StaffDashboard';
import EnrollRequest1 from './pages/RequestForms/EnrollRequest1';
import StudentApprovalPage from './pages/StudentApprovalPage';
import StaffManagement from './pages/StaffManagement';
import ApproverManagement from './pages/ApproverManagement';
import DepartmentManagement from './pages/DepartmentManagement';
import FacultyManagement from './pages/FacultyManagement';
import RoleManagement from './pages/RoleManagement';
import StudentManagement from './pages/StudentManagement';
import StudentSearch from './pages/StudentSearch';
import Mainscreen from './pages/mainscreen';
import ApproverDashboard from './pages/ApproverDashBoard';
import OverloadRegistrationForm from './pages/RequestForms/OverloadRegistrationForm';
import SubmissionProgressPage from './pages/SubmissionProgressPage';
import LateRegistrationForm from './pages/RequestForms/LateRegistrationForm';
import StudentPaymentDashboard from './pages/StudentPaymentDashboard';
import CourseCancellationForm from './pages/RequestForms/CourseCancellationForm';
import ConfirmRegistrationForm from './pages/RequestForms/ConfirmRegistrationForm';
import UnderloadRegistrationForm from './pages/RequestForms/UnderloadRegistrationForm';

function App() {
  const [user, setUser] = useState(() => {
    // ดึงข้อมูลผู้ใช้จาก LocalStorage
    const storedData = localStorage.getItem('user');
    return storedData ? JSON.parse(storedData) : null;
  });

  const location = useLocation();

  const handleLogout = () => {
    setUser(null);
    localStorage.clear();
  };

  return (
    <>
      {/* ซ่อน Navbar บนหน้า Login */}
      {location.pathname !== '/' && <Navbar user={user} onLogout={handleLogout} />}
      <Routes>
        <Route path="/" element={<Index setUser={setUser} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/mainscreen" element={<Mainscreen />} />
        <Route path="/submission-progress" element={<SubmissionProgressPage />} />
        <Route path="/student/payment" element={<StudentPaymentDashboard />} />
        
        {/* Route สำหรับนักศึกษา */}
        <Route path="/forms" element={<AllFormPages />} />        
        <Route path="/edit-personal-info" element={<EditPersonalInfo />} />
        
        {/* Route สำหรับเจ้าหน้าที่ */}
        <Route path="/staff-dashboard" element={<StaffDashboard />} /> {/* *** เพิ่ม Route นี้ *** */}
        <Route path="/StudentApprovalPage" element={<StudentApprovalPage />} /> {/* หน้าพิจารณาคำร้อง */}
        <Route path="/manage-staff" element={<StaffManagement />} />
        <Route path="/manage-approvers" element={<ApproverManagement />} />
        <Route path="/manage-departments" element={<DepartmentManagement />} />
        <Route path="/manage-faculty" element={<FacultyManagement />} />
        <Route path="/manage-roles" element={<RoleManagement />} />
        <Route path="/manage-students" element={<StudentManagement />} />
        <Route path="/student-info" element={<StudentSearch />} />.

        {/* Route สำหรับอาจารย์ */}
        <Route path="/approver-dashboard" element={<ApproverDashboard />} />

        <Route path="/contact" element={<ContactPage />} />
        
        {/* Forms */}
        <Route path="/forms/academic-request-6" element={<AcademicRequest6 />} />
        <Route path="/forms/enroll-request-1" element={<EnrollRequest1 />} />
        <Route path="/forms/underload-registration-form" element={<UnderloadRegistrationForm />} />
        <Route path='/forms/overload-registration-form' element={<OverloadRegistrationForm />} />
        <Route path='/forms/late-registration-form' element={<LateRegistrationForm />} />
        <Route path="/forms/course-cancellation-form" element={<CourseCancellationForm />} />
        <Route path="/forms/confirm-registration-form" element={<ConfirmRegistrationForm />} />
      </Routes>
    </>
  );
}

export default App;