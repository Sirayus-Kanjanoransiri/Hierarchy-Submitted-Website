import React from 'react';
import { Link } from 'react-router-dom';

function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="mt-8 text-left">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">จักรพงษภูวนารถ</h2>
        <p className="text-lg text-gray-700">ที่อยู่ : 122/41 ถนนวิภาวดีรังสิต แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400</p>
        <p className="text-lg text-gray-700">โทรศัพท์ : 0-2692-2360-4</p>
        <p className="text-lg text-gray-700">โทรสาร : 02-2773693</p>
        <p className="text-lg text-gray-700">เว็บไซต์ : <a href="http://www.cpc.rmutto.ac.th" className="text-indigo-600 hover:underline">www.cpc.rmutto.ac.th</a></p>
        <img src="/images/map_cpc.gif" alt="logo1" className="mt-4 max-w-full h-auto" />
      </div>
    </div>
  );
}

export default ContactPage;