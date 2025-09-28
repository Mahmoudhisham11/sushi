"use client";
import SideBar from "@/components/SideBar/page";
import styles from "./styles.module.css";
import { useState, useEffect } from "react";
import { db } from "../firebase"; // ✅ تأكد ان ملف firebase مضبوط عندك
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function Employess() {
  const [employees, setEmployees] = useState([]);
  const [openPopup, setOpenPopup] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    job: "",
    salary: "",
    password: "",
  });
  const [editId, setEditId] = useState(null);

  // ✅ جلب الموظفين
  const fetchEmployees = async () => {
    const querySnapshot = await getDocs(collection(db, "employess")); // خلي بالك من اسم الكولكشن
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setEmployees(data);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ✅ اضافة/تعديل موظف
  const handleSave = async () => {
    if (!newEmployee.name || !newEmployee.job || !newEmployee.salary || !newEmployee.password) {
      alert("من فضلك املى كل البيانات");
      return;
    }

    if (editId) {
      // تعديل
      const employeeRef = doc(db, "employess", editId);
      await updateDoc(employeeRef, newEmployee);
    } else {
      // اضافة
      await addDoc(collection(db, "employess"), newEmployee);
    }

    setNewEmployee({ name: "", job: "", salary: "", password: "" });
    setEditId(null);
    setOpenPopup(false);
    fetchEmployees();
  };

  // ✅ حذف موظف
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "employess", id));
    fetchEmployees();
  };

  // ✅ فتح المودال للتعديل
  const handleEdit = (employee) => {
    setNewEmployee({
      userName: employee.name,
      job: employee.job,
      salary: employee.salary,
      password: employee.password,
    });
    setEditId(employee.id);
    setOpenPopup(true);
  };

  return (
    <div className={styles.employess}>
      <SideBar />
      <div className="contentContainer">
        <div className="headerContainer">
          <div className="header">
            <h2>الموظفين</h2>
          </div>
        </div>
        <div className="content">
          <div className="tableContainer">
            <div className="tableHead">
              <h3>جدول الموظفين</h3>
              <button onClick={() => setOpenPopup(true)}>اضف موظف جديد</button>
            </div>
            <div className="tableContent">
              <table>
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>الوظيفة</th>
                    <th>المرتب</th>
                    <th>الرقم السري</th>
                    <th>خيارات</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.name}</td>
                      <td>{emp.job}</td>
                      <td>{emp.salary}</td>
                      <td>{emp.password}</td>
                      <td className={styles.tableActions}>
                        <button onClick={() => handleDelete(emp.id)}>حذف</button>
                        <button onClick={() => handleEdit(emp)}>تعديل</button>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan="5">لا يوجد موظفين بعد</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Popup */}
      {openPopup && (
        <div className={styles.popupOverlay} onClick={() => setOpenPopup(false)}>
          <div
            className={styles.popupContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{editId ? "تعديل موظف" : "اضافة موظف جديد"}</h3>
            <input
              type="text"
              placeholder="الاسم"
              value={newEmployee.name}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="الوظيفة"
              value={newEmployee.job}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, job: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="المرتب"
              value={newEmployee.salary}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, salary: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="الرقم السري"
              value={newEmployee.password}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, password: e.target.value })
              }
            />
            <div className={styles.actions}>
              <button onClick={handleSave}>
                {editId ? "حفظ التعديلات" : "اضافة"}
              </button>
              <button onClick={() => setOpenPopup(false)}>الغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
