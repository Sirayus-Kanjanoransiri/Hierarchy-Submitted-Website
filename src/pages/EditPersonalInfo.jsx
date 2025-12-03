import React, { useState, useEffect } from 'react';

function EditPersonalInfo() {
  const [formData, setFormData] = useState({
    std_id: '',
    std_password: '',
    std_address_no: '',
    std_address_moo: '',
    std_address_soi: '',
    std_address_street: '',
    std_address_tumbol: '',
    std_address_amphoe: '',
    std_province: '',
    std_postcode: '',
    std_tel: '',
    std_facebook: '',
  });

  useEffect(() => {
    // Fetch user data from the backend
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:5000/user/123456'); 
        if (response.ok) {
          const data = await response.json();
          setFormData(data);
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('ข้อมูลส่วนตัวได้รับการอัปเดตเรียบร้อยแล้ว');
      } else {
        alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ API');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-6 text-center">แก้ไขข้อมูลส่วนตัว</h2>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700">รหัสนักศึกษา/Student ID</label>
          <input
            type="text"
            name="std_id"
            value={formData.std_id}
            disabled
            className="mt-1 block w-full border-gray-300 rounded-md shadow-md bg-gray-100 text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">รหัสผ่าน/Password</label>
          <input
            type="password"
            name="std_password"
            value={formData.std_password}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-md focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">ที่อยู่เลขที่/Address No</label>
          <input
            type="text"
            name="std_address_no"
            value={formData.std_address_no}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-md focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">หมู่ที่/Moo</label>
          <input
            type="text"
            name="std_address_moo"
            value={formData.std_address_moo}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-md focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">ซอย/Soi</label>
          <input
            type="text"
            name="std_address_soi"
            value={formData.std_address_soi}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-md focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">ถนน/Street</label>
          <input
            type="text"
            name="std_address_street"
            value={formData.std_address_street}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-md focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">ตำบล/Tumbol</label>
          <input
            type="text"
            name="std_address_tumbol"
            value={formData.std_address_tumbol}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-md focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">อำเภอ/Amphoe</label>
          <input
            type="text"
            name="std_address_amphoe"
            value={formData.std_address_amphoe}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-md focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">จังหวัด/Province</label>
          <input
            type="text"
            name="std_province"
            value={formData.std_province}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-md focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">รหัสไปรษณีย์/Postcode</label>
          <input
            type="text"
            name="std_postcode"
            value={formData.std_postcode}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-md focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์/Phone</label>
          <input
            type="text"
            name="std_tel"
            value={formData.std_tel}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-md focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Facebook</label>
          <input
            type="text"
            name="std_facebook"
            value={formData.std_facebook}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-md focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600"
          >
            บันทึกการเปลี่ยนแปลง
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditPersonalInfo;