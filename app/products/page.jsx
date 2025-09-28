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
  });
  const [editId, setEditId] = useState(null); // ✅ لتحديد المنتج المراد تعديله

  // ✅ جلب المنتجات
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

  // ✅ اضافة أو تعديل منتج
  const handleSave = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert("من فضلك املى كل البيانات");
      return;
    }

    if (editId) {
      // ✅ تعديل منتج
      const productRef = doc(db, "products", editId);
      await updateDoc(productRef, {
        name: newProduct.name,
        price: Number(newProduct.price),
      });
    } else {
      // ✅ إضافة منتج جديد
      await addDoc(collection(db, "products"), {
        name: newProduct.name,
        price: Number(newProduct.price),
      });
    }

    setNewProduct({ name: "", price: "" });
    setEditId(null);
    setOpenPopup(false);
    fetchProducts();
  };

  // ✅ فتح البوب أب مع بيانات المنتج للتعديل
  const handleEdit = (prod) => {
    setNewProduct({ name: prod.name, price: prod.price });
    setEditId(prod.id);
    setOpenPopup(true);
  };

  // ✅ حذف منتج
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
                    <th>خيارات</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => (
                    <tr key={prod.id}>
                      <td>{prod.name}</td>
                      <td>{prod.price} جنيه</td>
                      <td className={styles.tableActions}>
                        <button onClick={() => handleDelete(prod.id)}>حذف</button>
                        <button onClick={() => handleEdit(prod)}>تعديل</button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan="3">لا يوجد منتجات بعد</td>
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
        <div
          className={styles.popupOverlay}
          onClick={() => {
            setOpenPopup(false);
            setEditId(null);
            setNewProduct({ name: "", price: "" });
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
            <div className={styles.actions}>
              <button onClick={handleSave}>
                {editId ? "حفظ التعديلات" : "اضافة"}
              </button>
              <button
                onClick={() => {
                  setOpenPopup(false);
                  setEditId(null);
                  setNewProduct({ name: "", price: "" });
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
