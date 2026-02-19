import React, { useEffect, useState } from 'react';

const OverloadRegistrationForm = () => {
  const [userData, setUserData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  
  // Basic Info States
  const [studentType, setStudentType] = useState('ปกติ'); 
  const [yearOfStudy, setYearOfStudy] = useState('1'); 
  const [term, setTerm] = useState('1'); 
  const [academicYear, setAcademicYear] = useState(''); 
  const [totalCredits, setTotalCredits] = useState(''); 
  const [requestReason, setRequestReason] = useState(''); 
  
  // Consideration Data States
  const [accumulatedCredits, setAccumulatedCredits] = useState('');
  const [gpa, setGpa] = useState('');
  const [reasonCategory, setReasonCategory] = useState('last_semester'); 
  const [otherReasonText, setOtherReasonText] = useState('');
  const [pastOverload, setPastOverload] = useState('never'); 
  
  // FIXED: Set default value to '1' instead of '' to satisfy 'required' attribute immediately
  const [pastOverloadTerm, setPastOverloadTerm] = useState('1');
  const [pastOverloadYear, setPastOverloadYear] = useState('');

  const std_department = userData?.department_name || '';

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const idFromQuery = searchParams.get('submissionId');

    if (idFromQuery) {
      setIsEditMode(true);
      setSubmissionId(idFromQuery);
      fetchExistingSubmission(idFromQuery);
    }

    const fetchUserData = async () => {
      try {
        const localUserRaw = localStorage.getItem('user');
        if (!localUserRaw) return;
        const localUser = JSON.parse(localUserRaw);
        const studentCode = localUser.student_id;
        if (!studentCode) return;

        const response = await fetch(`/student/user/${studentCode}`);
        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  const fetchExistingSubmission = async (id) => {
    try {
      const res = await fetch(`/student/api/student/submission/${id}`);
      if (!res.ok) throw new Error();

      const submission = await res.json();
      const data = typeof submission.form_data === 'string'
        ? JSON.parse(submission.form_data)
        : submission.form_data;

      // Prefill from existing submission
      setStudentType(data.student_type || 'ปกติ');
      setYearOfStudy(data.year_of_study || '1');
      setTerm(data.term || '1');
      setAcademicYear(data.academic_year || '');
      setTotalCredits(data.total_credits_requested || '');
      setRequestReason(data.request_reason || '');
      setAccumulatedCredits(data.accumulated_credits || '');
      setGpa(data.gpa || '');
      setReasonCategory(data.reason_category === 'อื่นๆ' ? 'other' : 'last_semester');
      setOtherReasonText(data.other_reason_text || '');
      setPastOverload(data.past_overload_status === 'เคยลงทะเบียนเกิน' ? 'ever' : 'never');
      setPastOverloadTerm(data.past_overload_term || '1');
      setPastOverloadYear(data.past_overload_year || '');
    } catch {
      setIsEditMode(false);
      setSubmissionId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userData?.id) {
      alert('ไม่พบข้อมูลนักศึกษาในระบบ');
      return;
    }

    // Prepare data object
    const formData = {
      subject: "ขอลงทะเบียนเรียนเกินกว่าหน่วยกิตที่กำหนด",
      student_type: studentType,
      year_of_study: yearOfStudy,
      term: term,
      academic_year: academicYear,
      total_credits_requested: totalCredits,
      request_reason: requestReason,
      accumulated_credits: accumulatedCredits,
      gpa: gpa,
      reason_category: reasonCategory === 'last_semester' ? 'ภาคการศึกษาสุดท้ายที่สำเร็จการศึกษาตามหลักสูตร' : 'อื่นๆ',
      other_reason_text: reasonCategory === 'other' ? otherReasonText : '',
      past_overload_status: pastOverload === 'ever' ? 'เคยลงทะเบียนเกิน' : 'ไม่เคยลงทะเบียนเกิน',
      past_overload_term: pastOverload === 'ever' ? pastOverloadTerm : '',
      past_overload_year: pastOverload === 'ever' ? pastOverloadYear : '',
    };

    if (!window.confirm("คุณยืนยันที่จะส่งคำร้องขอลงทะเบียนเกินหน่วยกิตใช่หรือไม่?")) return;

    try {
      let response;

      if (isEditMode && submissionId) {
        // revise existing submission
        response = await fetch(`/student/api/student/revise-submission/${submissionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ form_data: formData }),
        });
      } else {
        // create new submission
        response = await fetch('/student/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: userData.id,
            form_id: 2,
            form_data: formData,
          }),
        });
      }

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        alert(
          isEditMode
            ? 'ส่งคำร้องฉบับแก้ไขสำเร็จ! ระบบได้ส่งกลับไปยังผู้อนุมัติแล้ว'
            : 'ส่งคำร้องสำเร็จ!'
        );
        window.location.reload();
      } else {
        alert(`เกิดข้อผิดพลาด: ${result.error || result.message || 'Unknown Error'}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('ไม่สามารถติดต่อเซิร์ฟเวอร์ได้');
    }
  };

  if (!userData) return <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow-xl rounded-md my-10 border-t-8 border-indigo-700">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">ใบคำร้องขอลงทะเบียนเรียนเกินกว่าหน่วยกิตที่กำหนด</h2>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Subject Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <span className="font-bold w-24">เรื่อง/Subject:</span>
            <span>ขอลงทะเบียนเรียนเกินกว่าหน่วยกิตที่กำหนด</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold w-24">เรียน/To:</span>
            <input type="text" disabled value="คณบดี" className="bg-transparent border-b border-gray-400 flex-1 px-2 focus:outline-none" />
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 shadow-inner">
          <h3 className="font-bold text-indigo-800 mb-4 border-b-2 border-indigo-200 pb-2">ข้อมูลส่วนตัว (Personal Information)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 font-semibold">ข้าพเจ้า (นาย/นาง/นางสาว)</label>
              <input disabled value={userData.full_name || ''} className="mt-1 block w-full bg-gray-200 border border-gray-300 rounded p-2 text-gray-700" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-semibold">รหัสนักศึกษา</label>
              <input disabled value={userData.student_id || ''} className="mt-1 block w-full bg-gray-200 border border-gray-300 rounded p-2 text-gray-700" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500 font-semibold">นักศึกษาภาค</label>
              <div className="flex gap-4 p-2">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="radio" name="studentType" value="ปกติ" checked={studentType === 'ปกติ'} onChange={(e) => setStudentType(e.target.value)} /> ปกติ
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="radio" name="studentType" value="สมทบ" checked={studentType === 'สมทบ'} onChange={(e) => setStudentType(e.target.value)} /> สมทบ
                </label>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-semibold">ชั้นปีที่</label>
              <select value={yearOfStudy} onChange={(e) => setYearOfStudy(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded p-2">
                <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 font-semibold">สาขาวิชา</label>
              <input disabled value={std_department} className="mt-1 block w-full bg-gray-200 border border-gray-300 rounded p-2 text-gray-700" />
            </div>
          </div>
        </div>

        {/* Request Section */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span>มีความประสงค์ขอลงทะเบียนเรียนเกินกว่าหน่วยกิตที่กำหนด ในภาคการศึกษาที่</span>
            <select value={term} onChange={(e) => setTerm(e.target.value)} className="border-b-2 border-indigo-400 focus:outline-none px-2 w-24 text-center bg-transparent">
              <option value="1">1</option><option value="2">2</option><option value="ฤดูร้อน">ฤดูร้อน</option>
            </select>
            <span>ปีการศึกษา</span>
            <input type="text" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="border-b-2 border-indigo-400 focus:outline-none px-2 w-24 text-center bg-transparent" placeholder="25XX" required />
          </div>

          <div className="flex justify-start items-center gap-4">
            <label className="font-bold text-gray-700">รวมจำนวนหน่วยกิตทั้งหมดที่ขอลงทะเบียน:</label>
            <input type="number" value={totalCredits} onChange={(e) => setTotalCredits(e.target.value)} className="border-b-2 border-indigo-400 focus:outline-none w-24 text-center text-lg font-bold text-indigo-700 bg-transparent" placeholder="0" required />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">เนื่องจาก (ระบุเหตุผล):</label>
            <input type="text" value={requestReason} onChange={(e) => setRequestReason(e.target.value)} className="w-full border-b-2 border-gray-400 focus:border-indigo-600 focus:outline-none p-2 bg-transparent transition-colors" placeholder="อธิบายเหตุผลความจำเป็นที่นี่..." required />
          </div>
        </div>

        {/* Evaluation Data Section */}
        <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm space-y-4">
          <h3 className="font-bold text-indigo-800 border-b-2 border-indigo-200 pb-2 mb-4">ข้อมูลประกอบการพิจารณา</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <label className="font-semibold text-gray-700">มีหน่วยกิตสะสม:</label>
              <input type="number" value={accumulatedCredits} onChange={(e) => setAccumulatedCredits(e.target.value)} className="border border-gray-300 rounded px-3 py-1 w-24 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0" required />
              <span>หน่วยกิต</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="font-semibold text-gray-700">เกรดเฉลี่ยสะสม (GPA):</label>
              <input type="number" step="0.01" value={gpa} onChange={(e) => setGpa(e.target.value)} className="border border-gray-300 rounded px-3 py-1 w-24 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0.00" required />
            </div>
          </div>

          {/* Condition Category */}
          <div className="mt-4">
            <label className="font-semibold text-gray-700 block mb-2">เงื่อนไขการขอลงทะเบียน:</label>
            <div className="flex flex-col gap-3 pl-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="reasonCategory" value="last_semester" checked={reasonCategory === 'last_semester'} onChange={(e) => setReasonCategory(e.target.value)} className="text-indigo-600" />
                <span>เป็นภาคการศึกษาสุดท้ายที่จะสำเร็จการศึกษาตามหลักสูตร</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="reasonCategory" value="other" checked={reasonCategory === 'other'} onChange={(e) => setReasonCategory(e.target.value)} className="text-indigo-600" />
                <span>อื่นๆ (โปรดระบุ)</span>
              </label>
              
              {reasonCategory === 'other' && (
                <div className="pl-6 mt-1">
                  <input 
                    type="text" 
                    value={otherReasonText} 
                    onChange={(e) => setOtherReasonText(e.target.value)} 
                    className="w-full md:w-2/3 border-b border-gray-400 focus:border-indigo-600 outline-none bg-transparent px-2" 
                    placeholder="ระบุเหตุผลเพิ่มเติม..." 
                    required={reasonCategory === 'other'} 
                  />
                </div>
              )}
            </div>
          </div>

          {/* Past History */}
          <div className="mt-4 border-t border-indigo-200 pt-4">
            <label className="font-semibold text-gray-700 block mb-2">ประวัติการขอลงทะเบียนเรียนเกิน:</label>
            <div className="flex flex-col gap-3 pl-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="pastOverload" value="never" checked={pastOverload === 'never'} onChange={(e) => setPastOverload(e.target.value)} className="text-indigo-600" />
                <span>ไม่เคยลงทะเบียนเรียนเกินหน่วยกิตที่กำหนด</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="pastOverload" value="ever" checked={pastOverload === 'ever'} onChange={(e) => setPastOverload(e.target.value)} className="text-indigo-600" />
                <span>เคยลงทะเบียนเรียนเกินหน่วยกิตที่กำหนดมาแล้ว</span>
              </label>

              {pastOverload === 'ever' && (
                <div className="pl-6 flex items-center gap-2 mt-1">
                  <span>ในภาคการศึกษาที่</span>
                  <select 
                    value={pastOverloadTerm} 
                    onChange={(e) => setPastOverloadTerm(e.target.value)} 
                    className="border-b border-gray-400 bg-transparent outline-none px-1 text-center"
                    required={pastOverload === 'ever'}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="ฤดูร้อน">ฤดูร้อน</option>
                  </select>
                  <span>ปีการศึกษา</span>
                  <input 
                    type="text" 
                    value={pastOverloadYear} 
                    onChange={(e) => setPastOverloadYear(e.target.value)} 
                    className="border-b border-gray-400 bg-transparent outline-none px-1 w-20 text-center" 
                    placeholder="25XX" 
                    required={pastOverload === 'ever'} 
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center pt-8 pb-4">
          <button
            type="submit"
            className="px-12 py-3 bg-indigo-600 text-white text-lg font-bold rounded-full shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all active:scale-95"
          >
            ยื่นคำร้องเข้าสู่ระบบ
          </button>
        </div>
      </form>
    </div>
  );
};

export default OverloadRegistrationForm;