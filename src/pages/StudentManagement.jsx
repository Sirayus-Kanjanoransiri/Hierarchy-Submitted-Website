import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";

function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [approvers, setApprovers] = useState([]);
  const location = useLocation();

  const initialFormState = {
    id: "",
    student_id: "",
    full_name: "",
    password: "",
    email: "",
    department_id: "",
    advisor_id: "",
    address_no: "",
    address_moo: "",
    address_soi: "",
    address_street: "",
    address_subdistrict: "",
    address_district: "",
    address_province: "",
    address_postcode: "",
    status: "0",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");

  // รวมการโหลดข้อมูลและการเช็ค State ไว้ใน useEffect เดียวกันเพื่อแก้ปัญหา Timing
  useEffect(() => {
    const initPage = async () => {
      try {
        // 1. โหลดข้อมูลพื้นฐานให้เสร็จก่อน (Students, Departments, Approvers)
        const [stuRes, deptRes, appRes] = await Promise.all([
          axios.get("/staff/api/students-list"),
          axios.get("/admin/api/departments"),
          axios.get("/admin/api/approvers"),
        ]);

        setStudents(stuRes.data);
        setDepartments(deptRes.data);
        setApprovers(appRes.data);

        // 2. หลังจากข้อมูลพร้อมแล้ว ค่อยตรวจสอบว่ามีข้อมูลส่งมาจากหน้า Approval หรือไม่
        if (location.state && location.state.editStudent) {
          const studentData = location.state.editStudent;
          console.log("Data received from Approval:", studentData); // เช็ค log ดูว่าข้อมูลมาครบไหม

          // *** แก้ปัญหา Dropdown ไม่ขึ้น ***
          // หา department_id โดยเทียบจากชื่อ (ถ้าไม่มี ID ติดมา)
          let targetDeptId = studentData.department_id;
          
          if (!targetDeptId && studentData.department_name) {
            const foundDept = deptRes.data.find(d => d.department_name === studentData.department_name);
            if (foundDept) {
              targetDeptId = foundDept.id;
            }
          }

          setFormData({
            ...studentData,
            department_id: targetDeptId || "", // ถ้าหาไม่ได้จริงๆ ให้เป็นค่าว่าง (เพื่อไม่ให้เป็น undefined)
            password: "", 
            advisor_id: studentData.advisor_id || "",
          });
          setIsEditing(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }

      } catch (error) {
        console.error("Error initializing page:", error);
        setMessage("ไม่สามารถโหลดข้อมูลได้");
      }
    };

    initPage();
  }, [location.state]); // รันเมื่อเข้ามาหน้านี้

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      if (isEditing) {
        await axios.put(
          `/staff/api/students/${formData.id}`,
          formData
        );
        setMessage("แก้ไขข้อมูลเรียบร้อย");
      } else {
        await axios.post("/staff/api/students", formData);
        setMessage("เพิ่มข้อมูลเรียบร้อย");
      }

      // รีเซ็ตฟอร์มและโหลดข้อมูลใหม่
      setFormData(initialFormState);
      setIsEditing(false);
      
      // โหลดข้อมูลรายชื่อนักศึกษาใหม่ (แบบย่อ ไม่ต้องโหลดทั้งหมดใหม่)
      const res = await axios.get("/staff/api/students-list");
      setStudents(res.data);
      
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setMessage(
        "เกิดข้อผิดพลาด: " + (error.response?.data?.message || error.message)
      );
    }
  };

  const handleEdit = (item) => {
    setFormData({
      ...item,
      password: "", 
      advisor_id: item.advisor_id || "",
      department_id: item.department_id || "", // ป้องกัน undefined
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("คุณต้องการลบข้อมูลนักศึกษานี้ใช่หรือไม่?")) {
      try {
        await axios.delete(`/staff/api/students/${id}`);
        const res = await axios.get("/staff/api/students-list");
        setStudents(res.data);
      } catch (error) {
        alert(
          "ลบไม่ได้: " + (error.response?.data?.message || "เกิดข้อผิดพลาด")
        );
      }
    }
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-['Inter']">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            จัดการข้อมูลนักศึกษา (Students)
          </h1>
          <Link
            to="/staff-dashboard"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            &larr; กลับไปหน้า Dashboard
          </Link>
        </div>

        {/* --- Form Section --- */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-t-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {isEditing ? "แก้ไขข้อมูลนักศึกษา" : "เพิ่มนักศึกษาใหม่"}
          </h2>

          {message && (
            <div
              className={`p-3 mb-4 rounded ${
                message.includes("ผิดพลาด")
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รหัสนักศึกษา *
                </label>
                <input
                  type="text"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อ-นามสกุล *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isEditing ? "รหัสผ่านใหม่ (ว่างไว้ถ้าไม่แก้)" : "รหัสผ่าน *"}
                </label>
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!isEditing}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  สถานะ
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="0">รอพิจารณา</option>
                  <option value="1">อนุมัติ</option>
                  <option value="2">ปฏิเสธ/ระงับ</option>
                </select>
              </div>
            </div>

            <hr className="border-gray-200" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  สาขาวิชา (Department) *
                </label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">-- เลือกสาขาวิชา --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.department_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  อาจารย์ที่ปรึกษา (Advisor)
                </label>
                <select
                  name="advisor_id"
                  value={formData.advisor_id}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">-- เลือกอาจารย์ที่ปรึกษา --</option>
                  {approvers.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.approver_prefix}
                      {a.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <hr className="border-gray-200" />

            <h3 className="text-md font-medium text-gray-900">ข้อมูลที่อยู่</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <input type="text" name="address_no" placeholder="เลขที่" value={formData.address_no || ""} onChange={handleChange} className="p-2 border rounded" />
              <input type="text" name="address_moo" placeholder="หมู่" value={formData.address_moo || ""} onChange={handleChange} className="p-2 border rounded" />
              <input type="text" name="address_soi" placeholder="ซอย" value={formData.address_soi || ""} onChange={handleChange} className="p-2 border rounded" />
              <input type="text" name="address_street" placeholder="ถนน" value={formData.address_street || ""} onChange={handleChange} className="p-2 border rounded" />
              <input type="text" name="address_subdistrict" placeholder="แขวง/ตำบล" value={formData.address_subdistrict || ""} onChange={handleChange} className="p-2 border rounded" />
              <input type="text" name="address_district" placeholder="เขต/อำเภอ" value={formData.address_district || ""} onChange={handleChange} className="p-2 border rounded" />
              <input type="text" name="address_province" placeholder="จังหวัด" value={formData.address_province || ""} onChange={handleChange} className="p-2 border rounded" />
              <input type="text" name="address_postcode" placeholder="รหัสไปรษณีย์" value={formData.address_postcode || ""} onChange={handleChange} className="p-2 border rounded" />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                className={`flex-1 py-2 px-4 rounded-md text-white font-medium transition-colors ${
                  isEditing ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isEditing ? "บันทึกการแก้ไข" : "เพิ่มข้อมูล"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  ยกเลิก
                </button>
              )}
            </div>
          </form>
        </div>

        {/* --- Table Section --- */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสนักศึกษา</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สาขาวิชา</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.length > 0 ? (
                students.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{item.student_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.full_name}
                      <div className="text-xs text-gray-500">{item.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.department_name}
                      {item.advisor_name && <div className="text-xs text-indigo-500">ที่ปรึกษา: {item.advisor_name}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === "1" ? "bg-green-100 text-green-800" : item.status === "2" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {item.status === "1" ? "อนุมัติ" : item.status === "2" ? "ปฏิเสธ" : "รอพิจารณา"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(item)} className="text-indigo-600 hover:text-indigo-900 mr-4">แก้ไข</button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">ลบ</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">ไม่พบข้อมูลนักศึกษา</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentManagement;