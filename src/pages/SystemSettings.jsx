import React, { useState, useEffect } from 'react';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    late_reg_deadline: '',
    credit_cost: '300',
    late_fee_per_day: '50'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/approver/api/settings'); 
      if (res.ok) {
        const data = await res.json();
        setSettings({
          late_reg_deadline: data.late_reg_deadline || '',
          credit_cost: data.credit_cost || '300',
          late_fee_per_day: data.late_fee_per_day || '50'
        });
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!window.confirm('ยืนยันการบันทึกการตั้งค่าระบบ?')) return;
    
    try {
      const res = await fetch('/approver/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) alert('บันทึกการตั้งค่าสำเร็จ!');
      else alert('เกิดข้อผิดพลาดในการบันทึก');
    } catch (err) {
      alert('ไม่สามารถติดต่อเซิร์ฟเวอร์ได้');
    }
  };

  if (loading) return <div className="p-8 text-center text-indigo-600 font-bold">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-xl rounded-md my-10 border-t-8 border-indigo-700 font-['Inter']">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">⚙️ ตั้งค่าระบบงานทะเบียน</h2>
      
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <label className="block font-bold text-indigo-900 mb-2">วันสุดท้ายของการลงทะเบียนปกติ (Deadline)</label>
          <input 
            type="date" 
            value={settings.late_reg_deadline} 
            onChange={e => setSettings({...settings, late_reg_deadline: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
            required
          />
          <p className="text-xs text-gray-500 mt-2">* ระบบจะเริ่มคิดค่าปรับล่าช้าอัตโนมัติ หลังจากวันที่ระบุนี้เป็นต้นไป</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <label className="block font-bold text-indigo-900 mb-2">ราคาต่อหน่วยกิต (บาท)</label>
            <input 
              type="number" 
              value={settings.credit_cost} 
              onChange={e => setSettings({...settings, credit_cost: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <label className="block font-bold text-indigo-900 mb-2">ค่าปรับล่าช้าต่อวัน (บาท)</label>
            <input 
              type="number" 
              value={settings.late_fee_per_day} 
              onChange={e => setSettings({...settings, late_fee_per_day: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
              required
            />
            <p className="text-xs text-gray-500 mt-2">* ระบบจะไม่นำวันเสาร์และอาทิตย์มาคำนวณ</p>
          </div>
        </div>

        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-indigo-700 transition">
          💾 บันทึกการตั้งค่า
        </button>
      </form>
    </div>
  );
};

export default SystemSettings;