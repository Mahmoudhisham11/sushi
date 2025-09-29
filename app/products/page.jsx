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

export default function Products() {
  const [products, setProducts] = useState([]);
  const [openPopup, setOpenPopup] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    type: "مشروبات",
  });
  const [editId, setEditId] = useState(null);

  // جلب المنتجات
  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // إضافة أو تعديل منتج
  const handleSave = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.type) {
      alert("من فضلك املى كل البيانات");
      return;
    }

    if (editId) {
      const productRef = doc(db, "products", editId);
      await updateDoc(productRef, {
        name: newProduct.name,
        price: Number(newProduct.price),
        type: newProduct.type,
      });
    } else {
      await addDoc(collection(db, "products"), {
        name: newProduct.name,
        price: Number(newProduct.price),
        type: newProduct.type,
      });
    }

    setNewProduct({ name: "", price: "", type: "مشروبات" });
    setEditId(null);
    setOpenPopup(false);
    fetchProducts();
  };

  const handleEdit = (prod) => {
    setNewProduct({ name: prod.name, price: prod.price, type: prod.type || "مشروبات" });
    setEditId(prod.id);
    setOpenPopup(true);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "products", id));
    fetchProducts();
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
              <h3>جدول المنتجات</h3>
              <button onClick={() => setOpenPopup(true)}>اضف منتج جديد</button>
            </div>
            <div className="tableContent">
              <table>
                <thead>
                  <tr>
                    <th>اسم المنتج</th>
                    <th>السعر</th>
                    <th>النوع</th>
                    <th>خيارات</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => (
                    <tr key={prod.id}>
                      <td>{prod.name}</td>
                      <td>{prod.price} جنيه</td>
                      <td>{prod.type}</td>
                      <td className={styles.tableActions}>
                        <button onClick={() => handleEdit(prod)}>تعديل</button>
                        <button onClick={() => handleDelete(prod.id)}>حذف</button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan="4">لا يوجد منتجات بعد</td>
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
            setNewProduct({ name: "", price: "", type: "مشروبات" });
          }}
        >
          <div
            className={styles.popupContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{editId ? "تعديل منتج" : "اضافة منتج جديد"}</h3>
            <input
              type="text"
              placeholder="اسم المنتج"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="السعر"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
            />
            <select
              value={newProduct.type}
              onChange={(e) =>
                setNewProduct({ ...newProduct, type: e.target.value })
              }
            >
              <option value="مشروبات">مشروبات</option>
              <option value="اكل">اكل</option>
            </select>
            <div className={styles.actions}>
              <button onClick={handleSave}>
                {editId ? "حفظ التعديلات" : "اضافة"}
              </button>
              <button
                onClick={() => {
                  setOpenPopup(false);
                  setEditId(null);
                  setNewProduct({ name: "", price: "", type: "مشروبات" });
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
