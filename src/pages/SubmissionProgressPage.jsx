import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SubmissionProgressPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [selected, setSelected] = useState(null);
  const [steps, setSteps] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const statusLabel = (status) => {
    switch (status) {
      case 'APPROVED': return 'อนุมัติเรียบร้อยแล้ว';
      case 'REJECTED': return 'ถูกปฏิเสธ';
      case 'NEED_REVISION': return 'ต้องแก้ไข';
      case 'IN_PROGRESS':
      default: return 'กำลังพิจารณา';
    }
  };

  const safeParse = (data) => {
    try {
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch {
      return {};
    }
  };

  // --- ส่วนที่เพิ่มใหม่: ฟังก์ชันสำหรับแสดงรายละเอียดข้อมูลจาก JSON ---
  const renderFormData = (data) => {
    if (!data || Object.keys(data).length === 0) return <p className="text-gray-500">ไม่มีข้อมูลเพิ่มเติม</p>;

    return (
      <div className="text-sm space-y-2 bg-gray-50 p-3 rounded border">
        {Object.entries(data).map(([key, value]) => {
          // ข้าม field ที่เป็นหัวข้อเรื่อง (เพราะแสดงที่หัวข้อหลักแล้ว)
          if (key === 'subject') return null;

          // กรณีเป็นรายการวิชา (Array) เช่น courses_list, addCourses, dropCourses
          if (Array.isArray(value)) {
            return (
              <div key={key} className="mt-2">
                <span className="font-semibold text-blue-700 underline">{key}:</span>
                <ul className="list-disc ml-5 mt-1">
                  {value.map((item, idx) => (
                    <li key={idx}>
                      {item.courseCode || item.code} - {item.courseName || item.name} ({item.credits} นก.)
                    </li>
                  ))}
                </ul>
              </div>
            );
          }

          // กรณีข้อมูลทั่วไป (String/Number)
          return (
            <div key={key} className="flex border-b border-gray-200 pb-1">
              <span className="font-medium w-1/3 text-gray-600">{key}:</span>
              <span className="w-2/3">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const fetchSubmissions = async () => {
    setLoadingList(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.id) throw new Error();
      const res = await fetch(`/student/api/submissions-progress?student_id=${user.id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSubmissions(data);
    } catch {
      alert('โหลดรายการไม่สำเร็จ');
    } finally {
      setLoadingList(false);
    }
  };

  const fetchSteps = async (submissionId) => {
    setLoadingSteps(true);
    try {
      const res = await fetch(`/student/api/submission-steps?submission_id=${submissionId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSteps(data);
    } catch {
      alert('โหลดสถานะไม่สำเร็จ');
    } finally {
      setLoadingSteps(false);
    }
  };

  const handleView = (submission) => {
    setSelected(submission);
    fetchSteps(submission.id);
  };

  const getFormPath = (formId) => {
    const paths = {
      1: '/forms/general-request-form',
      2: '/forms/overload-registration-form',
      3: '/forms/late-registration-form',
      4: '/forms/course-cancellation-form',
      5: '/forms/confirm-registration-form',
      6: '/forms/underload-registration-form',
      7: '/forms/course-section-change-form',
      8: '/forms/repeat-course-form',
      9: '/forms/elective-change-request-form',
      10: '/forms/course-withdrawal-with-w-form',
      11: '/forms/enroll-adjustment-form',
    };
    return paths[formId] || '/forms';
  };

  const handleEdit = (submission) => {
    const path = getFormPath(submission.form_id);
    navigate(`${path}?submissionId=${submission.id}`);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">ติดตามสถานะคำร้องของฉัน</h1>

        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3">วันที่ส่ง</th>
                <th className="p-3">เรื่อง</th>
                <th className="p-3">สถานะ</th>
                <th className="p-3 text-center">จัดการ</th>
              </tr>
            </thead>

            <tbody>
              {loadingList ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center">กำลังโหลด...</td>
                </tr>
              ) : submissions.length ? (
                submissions.map((sub) => {
                  const data = safeParse(sub.form_data);
                  return (
                    <tr key={sub.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 text-sm">
                        {new Date(sub.submitted_at).toLocaleDateString('th-TH')}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-blue-600">
                          {sub.form_name} <span className="text-gray-400 font-normal ml-1">ID:{sub.id}</span>
                        </div>
                        {data.reason && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                            รายละเอียด: {data.reason}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          sub.submission_status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                          sub.submission_status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          sub.submission_status === 'NEED_REVISION' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {statusLabel(sub.submission_status)}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleView(sub)}
                          className="text-blue-500 hover:underline text-sm mr-3"
                        >
                          ดูสถานะ
                        </button>
                        {sub.submission_status === 'NEED_REVISION' && (
                          <button
                            onClick={() => handleEdit(sub)}
                            className="text-yellow-600 hover:underline text-sm font-medium"
                          >
                            แก้ไข/ส่งใหม่
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-500">ไม่พบรายการคำร้อง</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            {/* เพิ่ม max-h และ flex-col เพื่อควบคุมความสูง */}
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl">
              
              {/* Header: ล็อกอยู่กับที่ */}
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="font-bold text-xl text-blue-800">รายละเอียดคำร้อง</h2>
                <button className="text-2xl hover:text-gray-500" onClick={() => setSelected(null)}>✕</button>
              </div>

              {/* Body: ส่วนที่ scroll ได้ */}
              <div className="p-6 overflow-y-auto flex-1 text-gray-700">
                
                {/* ส่วนรายละเอียดจาก JSON */}
                <div className="mb-6">
                  <div className="mb-2 font-bold flex items-center">
                    <span className="bg-blue-600 w-1 h-4 mr-2 block"></span>
                    ข้อมูลคำร้อง: {safeParse(selected.form_data).subject || 'ไม่มีระบุหัวข้อ'}
                  </div>
                  {renderFormData(safeParse(selected.form_data))}
                </div>

                <div className="mb-2 font-bold flex items-center">
                  <span className="bg-green-600 w-1 h-4 mr-2 block"></span>
                  ลำดับการพิจารณา
                </div>

                {loadingSteps ? (
                  <div className="text-center p-4">กำลังโหลดขั้นตอน...</div>
                ) : (
                  <ol className="space-y-3">
                    {steps.length ? (
                      steps.map((step, idx) => (
                        <li key={step.id || idx} className="border rounded-lg p-3 flex justify-between items-start bg-white shadow-sm">
                          <div>
                            <b className="text-gray-600">ลำดับ {idx + 1}:</b> <span className="text-blue-700 font-semibold">{step.role_name}</span>
                            <br />
                            <span className="text-sm text-gray-500 italic">{step.approver_name || 'รอดำเนินการเลือกผู้อนุมัติ'}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-sm">
                              {step.status === 'APPROVED' && <span className="text-green-600">✔ อนุมัติแล้ว</span>}
                              {step.status === 'REJECTED' && <span className="text-red-600">✖ ปฏิเสธ</span>}
                              {step.status === 'PENDING' && <span className="text-gray-400">รอพิจารณา</span>}
                              {step.status === 'NEED_REVISION' && <span className="text-yellow-600">⚠️ ต้องแก้ไข</span>}
                            </div>
                            {step.reject_reason && (
                              <div className="text-xs bg-red-50 text-red-600 p-2 mt-1 rounded border border-red-100 max-w-[200px] break-words">
                                <b>เหตุผล:</b> {step.reject_reason}
                              </div>
                            )}
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 text-center border p-4 rounded">ยังไม่มีข้อมูลขั้นตอนการอนุมัติ</li>
                    )}
                  </ol>
                )}
              </div>
              
              {/* Footer: ล็อกอยู่กับที่ */}
              <div className="p-4 border-t text-center bg-gray-50 rounded-b-lg">
                <button 
                  className="bg-gray-200 hover:bg-gray-300 px-6 py-2 rounded-lg font-medium transition-colors" 
                  onClick={() => setSelected(null)}
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubmissionProgressPage;