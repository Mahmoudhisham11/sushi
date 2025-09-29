"use client";
import SideBar from "@/components/SideBar/page";
import styles from "./styles.module.css";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [openPopup, setOpenPopup] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    job: "",
    salary: "",
    password: "",
  });
  const [editId, setEditId] = useState(null);

  // جلب البيانات
  const fetchEmployees = async () => {
    const querySnapshot = await getDocs(collection(db, "employess"));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setEmployees(data);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // حفظ أو تعديل
  const handleSave = async () => {
    if (!newEmployee.name || !newEmployee.job || !newEmployee.salary || !newEmployee.password) {
      alert("من فضلك املى كل البيانات");
      return;
    }

    if (editId) {
      const employeeRef = doc(db, "employess", editId);
      await updateDoc(employeeRef, newEmployee);
    } else {
      await addDoc(collection(db, "employess"), newEmployee);
    }

    setNewEmployee({ name: "", job: "", salary: "", password: "" });
    setEditId(null);
    setOpenPopup(false);
    fetchEmployees();
  };

  const handleEdit = (emp) => {
    setNewEmployee({
      name: emp.name,
      job: emp.job,
      salary: emp.salary,
      password: emp.password,
    });
    setEditId(emp.id);
    setOpenPopup(true);
  };

  const handleDelete = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا الموظف؟")) {
      await deleteDoc(doc(db, "employess", id));
      fetchEmployees();
    }
  };

  return (
    <div className={styles.products}> {/* نفس اسم الـ class ليتوافق مع تصميم المنتجات */}
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
                        <button onClick={() => handleEdit(emp)}>تعديل</button>
                        <button onClick={() => handleDelete(emp.id)}>حذف</button>
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

      {/* Popup */}
      {openPopup && (
        <div
          className={styles.popupOverlay}
          onClick={() => {
            setOpenPopup(false);
            setEditId(null);
            setNewEmployee({ name: "", job: "", salary: "", password: "" });
          }}
        >
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
              <button
                onClick={() => {
                  setOpenPopup(false);
                  setEditId(null);
                  setNewEmployee({ name: "", job: "", salary: "", password: "" });
                }}
              >
                الغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
