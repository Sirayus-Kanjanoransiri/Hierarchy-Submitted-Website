import React, { useState, useEffect } from 'react';

function StudentPaymentDashboard() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State สำหรับ Modal ชำระเงิน
  const [selectedBill, setSelectedBill] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    setLoading(true);
    try {
      const userRaw = localStorage.getItem('user');
      if (!userRaw) return;
      const user = JSON.parse(userRaw);

      const res = await fetch(`/student/api/payments/pending/${user.id}`);
      if (!res.ok) throw new Error('ดึงข้อมูลไม่สำเร็จ');

      const data = await res.json();
      setPayments(data);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const openPaymentModal = (bill) => {
    setSelectedBill(bill);
    setReceiptFile(null);
    setPreviewUrl(null);
  };

  const closePaymentModal = () => {
    if (!uploading) {
        setSelectedBill(null);
        setReceiptFile(null);
        setPreviewUrl(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้นค่ะ!');
        return;
      }
      setReceiptFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!receiptFile) {
      alert('กรุณาเลือกไฟล์สลิปโอนเงินก่อนกดยืนยันค่ะ');
      return;
    }
    if (!window.confirm('ยืนยันการส่งหลักฐานการโอนเงินใช่หรือไม่?')) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('receipt', receiptFile);
    formData.append('payment_id', selectedBill.payment_id);

    try {
      const res = await fetch('/student/api/payments/upload-slip', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        alert('อัปโหลดสลิปเรียบร้อยแล้ว! ระบบกำลังส่งให้การเงินตรวจสอบค่ะ');
        fetchPendingPayments();
        closePaymentModal();
      } else {
        alert(`เกิดข้อผิดพลาด: ${result.message}`);
      }
    } catch (err) {
      console.error('Upload Error:', err);
      alert('ไม่สามารถติดต่อเซิร์ฟเวอร์ได้');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-xl font-bold text-indigo-600">กำลังตรวจสอบยอดค้างชำระ...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-['Inter']">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-8 border-l-4 border-indigo-600 pl-4">
          <h1 className="text-3xl font-bold text-gray-800">รายการชำระเงิน</h1>
          <p className="text-gray-500 mt-1">คำร้องที่ได้รับการอนุมัติและมีค่าธรรมเนียมที่ต้องชำระ</p>
        </div>

        {/* รายการบิลค้างชำระ (แบบการ์ดเรียบๆ) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {payments.length > 0 ? (
            payments.map((bill) => {
              const formData = typeof bill.form_data === 'string' ? JSON.parse(bill.form_data) : bill.form_data;
              const hasUploaded = bill.receipt_image_path !== null; 
              
              return (
                <div key={bill.payment_id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">รหัสบิล #{bill.payment_id}</span>
                            <h3 className="text-lg font-bold text-gray-800 mt-1">{bill.form_name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-1">{formData?.subject}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${hasUploaded ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {hasUploaded ? 'รอตรวจสอบสลิป' : 'ค้างชำระ'}
                        </span>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center mb-6 border border-gray-100">
                        <div>
                            <p className="text-xs text-gray-500 font-semibold">ยอดที่ต้องชำระ</p>
                            <p className="text-xl font-black text-indigo-700">฿{parseFloat(bill.amount_due).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 font-semibold">กำหนดชำระ</p>
                            <p className="text-sm font-bold text-gray-700">
                                {bill.due_date ? new Date(bill.due_date).toLocaleDateString('th-TH') : '-'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => openPaymentModal(bill)}
                        disabled={hasUploaded}
                        className={`w-full py-2.5 rounded-lg font-bold text-sm shadow-sm transition-all ${
                            hasUploaded 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                        }`}
                    >
                        {hasUploaded ? 'แนบสลิปแล้ว (รอตรวจสอบ)' : 'คลิกเพื่อชำระเงิน'}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
              <div className="text-6xl mb-4 text-gray-300">🎉</div>
              <h3 className="text-xl font-bold text-gray-700">ไม่มีคำร้องที่ต้องชำระเงิน</h3>
              <p className="text-gray-500 mt-2 text-sm">ยอดเยี่ยมมาก คุณไม่มีรายการค้างชำระในระบบขณะนี้</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal หน้าต่างสำหรับโอนเงินและแนบสลิป */}
      {selectedBill && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            
            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
              <h2 className="font-bold text-lg">ชำระค่าธรรมเนียมคำร้อง</h2>
              <button disabled={uploading} onClick={closePaymentModal} className="text-indigo-200 hover:text-white text-2xl leading-none">&times;</button>
            </div>

            <div className="p-6">
                {/* ข้อมูลบัญชีธนาคาร (ย้ายมาไว้ใน Modal แทน) */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6 text-center">
                    <p className="text-sm text-indigo-800 font-semibold mb-1">โอนเงินเข้าบัญชีมหาวิทยาลัย</p>
                    <p className="text-xs text-gray-600">ธ.กรุงไทย | มทร.ตะวันออก</p>
                    <p className="text-2xl font-black text-indigo-700 mt-2 tracking-widest">123-4-56789-0</p>
                    <div className="mt-3 pt-3 border-t border-indigo-200">
                         <p className="text-gray-600 text-sm">ยอดที่ต้องโอน: <span className="text-xl font-bold text-red-600 ml-1">฿{parseFloat(selectedBill.amount_due).toLocaleString()}</span></p>
                    </div>
                </div>

                {/* ส่วนอัปโหลดรูปภาพ */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">แนบรูปภาพสลิปโอนเงิน <span className="text-red-500">*</span></label>
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-gray-200 rounded-md p-1"
                    />
                    
                    {previewUrl && (
                        <div className="mt-4 text-center bg-gray-50 p-2 rounded-lg border border-gray-200">
                            <img src={previewUrl} alt="Slip Preview" className="max-h-48 mx-auto rounded shadow-sm" />
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
              <button 
                onClick={closePaymentModal} 
                disabled={uploading}
                className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleUpload}
                disabled={!receiptFile || uploading}
                className={`px-6 py-2 text-sm font-bold rounded-lg text-white transition-all ${!receiptFile ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md active:scale-95'}`}
              >
                {uploading ? 'กำลังบันทึก...' : 'ยืนยันการชำระเงิน'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default StudentPaymentDashboard;