import React from "react";

const ApprovalStudent = () => {

    return (

        <>

            <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white shadow-xl rounded-lg mt-10">
                <div>
                    <h2 className="text-2xl font-extrabold mb-4 text-center text-gray-800 border-b pb-3">ยืนยันคำขอลงทะเบียนนักศึกษา</h2>
                </div>

                <div className="mt-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสนักศึกษา</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">แบบฟอร์ม</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่ส่ง</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">ดูรายละเอียด</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {/* Body intentionally left empty for now */}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </>
    );
};

export default ApprovalStudent;