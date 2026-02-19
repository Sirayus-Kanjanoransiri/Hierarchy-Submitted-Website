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
      case 'APPROVED':
        return 'อนุมัติเรียบร้อยแล้ว';
      case 'REJECTED':
        return 'ถูกปฏิเสธ';
      case 'NEED_REVISION':
        return 'ต้องแก้ไข';
      case 'IN_PROGRESS':
      default:
        return 'กำลังพิจารณา';
    }
  };

  const safeParse = (data) => {
    try {
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch {
      return {};
    }
  };

  const fetchSubmissions = async () => {
    setLoadingList(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.id) throw new Error();

      const res = await fetch(`/student/api/student/submissions?student_id=${user.id}`);
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
      const res = await fetch(`/student/api/student/submission-steps?submission_id=${submissionId}`);
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
    switch (formId) {
      case 1:
        return '/forms/academic-request-6';
      case 2:
        return '/forms/overload-registration-form';
      default:
        return '/forms';
    }
  };

  const handleEdit = (submission) => {
    const path = getFormPath(submission.form_id);
    navigate(`${path}?submissionId=${submission.id}`);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">ติดตามสถานะคำร้องของฉัน</h1>

        <div className="bg-white rounded shadow">
          <table className="w-full">
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
                  <td colSpan="4" className="p-6 text-center">
                    กำลังโหลด...
                  </td>
                </tr>
              ) : submissions.length ? (
                submissions.map((sub) => {
                  const data = safeParse(sub.form_data);
                  return (
                    <tr key={sub.id} className="border-t">
                      <td className="p-3">
                        {new Date(sub.submitted_at).toLocaleDateString('th-TH')}
                      </td>
                      <td className="p-3">{data.subject || '-'}</td>
                      <td className="p-3">{statusLabel(sub.submission_status)}</td>
                      <td className="p-3 text-center space-x-2">
                        <button
                          className="bg-blue-600 text-white px-4 py-1 rounded"
                          onClick={() => handleView(sub)}
                        >
                          ดู
                        </button>

                        {sub.submission_status === 'NEED_REVISION' && (
                          <button
                            className="bg-yellow-500 text-white px-4 py-1 rounded"
                            onClick={() => handleEdit(sub)}
                          >
                            แก้ไข
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-500">
                    ไม่มีคำร้อง
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded max-w-xl w-full">
              <div className="flex justify-between mb-4">
                <h2 className="font-bold text-xl">รายละเอียดการอนุมัติ</h2>
                <button onClick={() => setSelected(null)}>✕</button>
              </div>

              <div className="mb-4">
                <b>เรื่อง:</b> {safeParse(selected.form_data).subject || '-'}
              </div>

              <div className="mb-2 font-bold">ลำดับการอนุมัติ</div>

              {loadingSteps ? (
                <div className="text-center p-4">กำลังโหลด...</div>
              ) : (
                <ol className="space-y-2">
                  {steps.length ? (
                    steps.map((step, idx) => (
                      <li
                        key={step.id || idx}
                        className="border rounded p-2 flex justify-between"
                      >
                        <div>
                          <b>ลำดับ {idx + 1}:</b> {step.role_name}
                          <br />
                          <span className="text-gray-700">
                            {step.approver_name || '-'}
                          </span>
                        </div>

                        <div className="text-right">
                          {step.status === 'APPROVED' && (
                            <span className="text-green-600">✔ อนุมัติ</span>
                          )}
                          {step.status === 'REJECTED' && (
                            <span className="text-red-600">✖ ปฏิเสธ</span>
                          )}
                          {step.status === 'PENDING' && (
                            <span className="text-gray-500">รอดำเนินการ</span>
                          )}
                          {step.status === 'NEED_REVISION' && (
                            <span className="text-yellow-600">ต้องแก้ไข</span>
                          )}

                          {step.status === 'REJECTED' && step.reject_reason && (
                            <div className="text-xs text-red-500 mt-1">
                              เหตุผล: {step.reject_reason}
                            </div>
                          )}
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 border rounded p-2">ยังไม่มีการอนุมัติจากผู้อนุมัติ</li>
                  )}
                </ol>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubmissionProgressPage;
