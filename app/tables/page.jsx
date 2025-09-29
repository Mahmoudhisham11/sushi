'use client';
import SideBar from "@/components/SideBar/page";
import styles from "./styles.module.css";
import { useState, useEffect } from "react";
import { db } from "@/app/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function Tables() {
  const [openPopup, setOpenPopup] = useState(false);
  const [newTable, setNewTable] = useState({ number: "" });
  const [tables, setTables] = useState([]);
  const [editId, setEditId] = useState(null);

  // جلب البيانات
  useEffect(() => {
    const q = collection(db, "tables");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTables(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // حفظ البيانات
  const handleSave = async () => {
    if (!newTable.number.trim()) return;

    if (editId) {
      // لو حبيت تضيف تعديل مستقبلا
    } else {
      await addDoc(collection(db, "tables"), {
        number: newTable.number,
      });
    }

    setOpenPopup(false);
    setEditId(null);
    setNewTable({ number: "" });
  };

  // حذف الترابيزة
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "tables", id));
  };

  return (
    <div className={styles.products}>
      <SideBar />
      <div className="contentContainer">
        <div className="headerContainer">
          <div className="header">
            <h2>المنتجات</h2>
          </div>
        </div>

        <div className="content">
          <div className="tableContainer">
          <div className="tableHead">
            <h3>جدول الترابيزات</h3>
            <button onClick={() => setOpenPopup(true)}>اضف ترابيزة جديدة</button>
          </div>
          <div className="tableContent">
            <table>
              <thead>
                <tr>
                  <th>رقم الترابيزة</th>
                  <th>خيارات</th>
                </tr>
              </thead>
              <tbody>
                {tables.length > 0 ? (
                  tables.map((table) => (
                    <tr key={table.id}>
                      <td>{table.number}</td>
                      <td className={styles.tableActions}>
                        <button onClick={() => handleDelete(table.id)}>حذف</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2">لا يوجد ترابيزات بعد</td>
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
            setNewTable({ number: "" });
          }}
        >
          <div
            className={styles.popupContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{editId ? "تعديل ترابيزة" : "اضافة ترابيزة جديدة"}</h3>
            <input
              type="text"
              placeholder="رقم الترابيزة"
              value={newTable.number}
              onChange={(e) =>
                setNewTable({ ...newTable, number: e.target.value })
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
                  setNewTable({ number: "" });
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
