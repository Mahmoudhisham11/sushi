"use client";
import styles from "./styles.module.css";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { IoMdSearch } from "react-icons/io";
import { FaUtensils, FaGlassCheers } from "react-icons/fa";
import { db } from "@/app/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import CashSideBar from "@/components/CashSideBar/page";

export default function Sales() {
  const { id } = useParams(); // ID الترابيزة
  const [search, setSearch] = useState("");
  const [userName, setUserName] = useState("");
  const [filter, setFilter] = useState("all");
  const [cart, setCart] = useState([]);
  const [payment, setPayment] = useState("cash");
  const [products, setProducts] = useState([]);
  const [tableNumber, setTableNumber] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  // ✅ تحميل اسم المستخدم
  useEffect(() => {
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("userName") || "ضيف";
      setUserName(name);
    }
  }, []);

  // ✅ جلب المنتجات
  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const fetchedProducts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        icon: doc.data().type === "food" ? <FaUtensils /> : <FaGlassCheers />,
      }));
      setProducts(fetchedProducts);
    };
    fetchProducts();
  }, []);

  // ✅ جلب رقم الترابيزة
  useEffect(() => {
    const fetchTable = async () => {
      const docRef = doc(db, "tables", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setTableNumber(docSnap.data().number);
    };
    if (id) fetchTable();
  }, [id]);

  // ✅ متابعة فاتورة الترابيزة
  useEffect(() => {
    if (!id) return;
    const docRef = doc(db, "orders", id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) setCart(docSnap.data().items || []);
      else setCart([]);
    });
    return () => unsubscribe();
  }, [id]);

  // إضافة منتج
  const addToCart = async (product) => {
    const docRef = doc(db, "orders", id);
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      const updatedCart = cart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      await setDoc(docRef, { tableId: id, items: updatedCart }, { merge: true });
    } else {
      const updatedCart = [
        ...cart,
        { id: product.id, name: product.name, price: product.price, quantity: 1 },
      ];
      await setDoc(docRef, { tableId: id, items: updatedCart }, { merge: true });
    }
  };

  // تعديل الكمية وحذف المنتج
  const decreaseQuantity = async (pid) => {
    const docRef = doc(db, "orders", id);
    const updatedCart = cart
      .map((item) =>
        item.id === pid ? { ...item, quantity: Math.max(item.quantity - 1, 1) } : item
      )
      .filter((item) => item.quantity > 0);

    if (updatedCart.length === 0) {
      // الفاتورة فاضية، نحذف الـ document
      await deleteDoc(docRef);
    } else {
      await updateDoc(docRef, { items: updatedCart });
    }
    setCart(updatedCart);
  };

  const increaseQuantity = async (pid) => {
    const docRef = doc(db, "orders", id);
    const updatedCart = cart.map((item) =>
      item.id === pid ? { ...item, quantity: item.quantity + 1 } : item
    );
    await updateDoc(docRef, { items: updatedCart });
    setCart(updatedCart);
  };

  const removeFromCart = async (pid) => {
    const docRef = doc(db, "orders", id);
    const updatedCart = cart.filter((item) => item.id !== pid);

    if (updatedCart.length === 0) {
      // الفاتورة فاضية، نحذف الـ document
      await deleteDoc(docRef);
    } else {
      await updateDoc(docRef, { items: updatedCart });
    }

    setCart(updatedCart);
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // ===== عند الضغط على حفظ الفاتورة =====
  const handleSaveInvoice = () => {
    if (cart.length === 0) {
      alert("لا يوجد منتجات في الفاتورة!");
      return;
    }
    setShowPopup(true);
  };

  // ===== حفظ البيانات في reports وحذف الـ document بالكامل من orders =====
  const handleConfirmClient = async () => {
    if (!clientName || !clientPhone) {
      alert("يرجى إدخال اسم العميل ورقم الهاتف!");
      return;
    }

    try {
      const orderRef = doc(db, "orders", id);
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        const orderData = orderSnap.data();

        // نقل البيانات إلى reports
        await addDoc(collection(db, "reports"), {
          tableId: id,
          tableNumber,
          clientName,
          clientPhone,
          items: orderData.items || [],
          paymentMethod: payment,
          total,
          createdAt: serverTimestamp(),
        });

        // حذف الـ document بالكامل من orders
        await deleteDoc(orderRef);

        // تفريغ الـ state
        setCart([]);
        setClientName("");
        setClientPhone("");
        setPayment("cash");
        setShowPopup(false);

        alert("تم حفظ الفاتورة وحذفها من الترابيزة بنجاح!");
      }
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء حفظ الفاتورة!");
    }
  };

  return (
    <div className={styles.salesPage}>
      <CashSideBar/>

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h2>{tableNumber ? `ترابيزة ${tableNumber}` : "جارٍ التحميل..."}</h2>
          <div className={styles.searchBox}>
            <IoMdSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="ابحث عن منتج..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.userBox}>
            <span>👋 مرحباً {userName}</span>
          </div>
        </div>
        <hr />

        <div className={styles.filters}>
          <button
            className={filter === "all" ? styles.active : ""}
            onClick={() => setFilter("all")}
          >
            الكل
          </button>
          <button
            className={filter === "food" ? styles.active : ""}
            onClick={() => setFilter("food")}
          >
            أكل
          </button>
          <button
            className={filter === "drink" ? styles.active : ""}
            onClick={() => setFilter("drink")}
          >
            مشروبات
          </button>
        </div>

        <div className={styles.products}>
          {products.length > 0 ? (
            products
              .filter((p) => {
                const matchesSearch = p.name
                  .toLowerCase()
                  .includes(search.toLowerCase());
                const matchesFilter = filter === "all" || p.type === filter;
                return matchesSearch && matchesFilter;
              })
              .map((p) => (
                <div
                  key={p.id}
                  className={styles.productCard}
                  onClick={() => addToCart(p)}
                >
                  <span className={styles.icon}>{p.icon}</span>
                  <h4>{p.name}</h4>
                  <p>{p.price} جنيه</p>
                </div>
              ))
          ) : (
            <p className={styles.noData}>لا توجد منتجات</p>
          )}
        </div>
      </div>

      <div className={styles.invoice}>
        <div className={styles.invoiceHeader}>
          <h3>🧾 الفاتورة</h3>
        </div>

        <div className={styles.invoiceBody}>
          {cart.length > 0 ? (
            <ul>
              {cart.map((item) => (
                <li key={item.id} className={styles.cartItem}>
                  <span>
                    {item.name} - {item.price} جنيه
                  </span>
                  <div className={styles.controls}>
                    <button onClick={() => decreaseQuantity(item.id)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increaseQuantity(item.id)}>+</button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => removeFromCart(item.id)}
                    >
                      حذف
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noData}>لا توجد منتجات مضافة</p>
          )}
        </div>

        <div className={styles.invoiceFooter}>
          <div className={styles.paymentBox}>
            <div
              className={`${styles.paymentOption} ${
                payment === "cash" ? styles.selected : ""
              }`}
              onClick={() => setPayment("cash")}
            >
              💵 كاش
            </div>
            <div
              className={`${styles.paymentOption} ${
                payment === "card" ? styles.selected : ""
              }`}
              onClick={() => setPayment("card")}
            >
              💳 فيزا
            </div>
            <div
              className={`${styles.paymentOption} ${
                payment === "wallet" ? styles.selected : ""
              }`}
              onClick={() => setPayment("wallet")}
            >
              🏦 محفظة
            </div>
          </div>

          <div className={styles.total}>
            <strong>الإجمالي: {total} جنيه</strong>
          </div>

          <button className={styles.saveBtn} onClick={handleSaveInvoice}>
            💾 حفظ الفاتورة
          </button>
        </div>
      </div>

      {/* ===== Popup لإدخال اسم العميل ورقم الموبايل ===== */}
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <h3>بيانات العميل</h3>
            <input
              type="text"
              placeholder="اسم العميل"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
            <input
              type="text"
              placeholder="رقم الموبايل"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
            />
            <div className={styles.popupButtons}>
              <button onClick={() => setShowPopup(false)}>إلغاء</button>
              <button onClick={handleConfirmClient}>حفظ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
