import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './pages/Navbar';
import IndexPage from './pages/IndexPage'; 
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage'; 
import ContactPage from './pages/ContactPage';
import AllFormPages from './pages/AllFormPages';
import GeneralRequestForm from './pages/RequestForms/GeneralRequestForm';
import OverCreditForm from './pages/RequestForms/OverCreditForm';
import UnderCreditForm from './pages/RequestForms/UnderCreditForm';

function App() {
  const [user, setUser] = useState(() => {
    return localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  });

  
  
  const handleLogout = () => {
    setUser(null);
    localStorage.clear();
  };

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/requestforms" element={<AllFormPages />} />
        <Route path="/requestforms/general" element={<GeneralRequestForm />} />
        <Route path="/requestforms/over-credit" element={<OverCreditForm />} />
        <Route path="/requestforms/under-credit" element={<UnderCreditForm />} />
      </Routes>
    </>
  );
}

export default App;