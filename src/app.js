import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './pages/Navbar';
import Index from './pages/STDLoginPage';
import RegisterPage from './pages/RegisterPage';
import ContactPage from './pages/ContactPage';
import AllFormPages from './pages/AllFormPages';
import AcademicRequest6 from './pages/RequestForms/AcademicRequest6';
import Mainpage from './pages/Mainpage';
import EditPersonalInfo from './pages/EditPersonalInfo';
import Home from './pages/home';
import EnrollRequest1 from './pages/RequestForms/EnrollRequest1';
import EnrollRequest2 from './pages/RequestForms/EnrollRequest2';
function App() {
  const [user, setUser] = useState(() => {
    return localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  });

  const location = useLocation();

  const handleLogout = () => {
    setUser(null);
    localStorage.clear();
  };

  return (
    <>
      {location.pathname !== '/' && <Navbar user={user} onLogout={handleLogout} />}
      <Routes>
        <Route path="/" element={<Index setUser={setUser} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/main" element={<Mainpage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/forms" element={<AllFormPages />} />        
        <Route path="/edit-personal-info" element={<EditPersonalInfo />} />
        <Route path="/home" element={<Home />} />
        <Route path="/forms/academic-request-6" element={<AcademicRequest6 />} />
        <Route path="/forms/enroll-request-1" element={<EnrollRequest1 />} />
        <Route path="/forms/enroll-request-2" element={<EnrollRequest2 />} />
      </Routes>
    </>
  );
}

export default App;