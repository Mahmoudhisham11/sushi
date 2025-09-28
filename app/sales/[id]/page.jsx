"use client";
import styles from "./styles.module.css";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { IoMdSearch } from "react-icons/io";
import { FaUtensils, FaGlassCheers } from "react-icons/fa";
import SideBar from "@/components/SideBar/page";
import { db } from "@/app/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export default function Sales() {
  const { id } = useParams(); // id بتاع الترابيزة من URL
  const [search, setSearch] = useState("");
  const [userName, setUserName] = useState("");
  const [filter, setFilter] = useState("all");
  const [cart, setCart] = useState([]);
  const [payment, setPayment] = useState("cash");
  const [products, setProducts] = useState([]); // ✅ المنتجات من Firestore
  const [tableNumber, setTableNumber] = useState(null); // ✅ رقم الترابيزة من Firestore

  // ✅ تحميل اسم المستخدم من localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("userName") || "ضيف";
      setUserName(name);
    }
  }, []);

  // ✅ جلب المنتجات من Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const fetchedProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          icon:
            doc.data().type === "food" ? <FaUtensils /> : <FaGlassCheers />, // أيقونة حسب النوع
        }));
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // ✅ جلب رقم الترابيزة من Firestore
  useEffect(() => {
    const fetchTable = async () => {
      try {
        const docRef = doc(db, "tables", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setTableNumber(docSnap.data().number); // نخزن رقم الترابيزة
        } else {
          console.warn("⚠️ لا توجد ترابيزة بهذا الـ ID");
        }
      } catch (error) {
        console.error("Error fetching table:", error);
      }
    };

    if (id) fetchTable();
  }, [id]);

  // ✅ فلترة المنتجات
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || p.type === filter;
    return matchesSearch && matchesFilter;
  });

  // ✅ إضافة منتج للسلة
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // ✅ إنقاص الكمية
  const decreaseQuantity = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
          : item
      )
    );
  };

  // ✅ زيادة الكمية
  const increaseQuantity = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // ✅ حذف منتج من السلة
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // ✅ حساب الإجمالي
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className={styles.salesPage}>
      <SideBar />

      <div className={styles.mainContent}>
        {/* ✅ Header */}
        <div className={styles.header}>
          <h2>
            {tableNumber ? `ترابيزة ${tableNumber}` : "جارٍ التحميل..."}
          </h2>
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

        {/* ✅ الفلترة */}
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

        {/* ✅ المنتجات */}
        <div className={styles.products}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((p) => (
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

      {/* ✅ الفاتورة */}
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
          <div className={styles.total}>
            <strong>الإجمالي: {total} جنيه</strong>
          </div>

          {/* ✅ اختيار طريقة الدفع */}
          <div className={styles.paymentBox}>
            {["cash", "visa", "wallet"].map((method) => (
              <label
                key={method}
                className={`${styles.paymentOption} ${
                  payment === method ? styles.selected : ""
                }`}
              >
                <input
                  type="radio"
                  value={method}
                  checked={payment === method}
                  onChange={(e) => setPayment(e.target.value)}
                />
                {method === "cash" && "💵 كاش"}
                {method === "visa" && "💳 فيزا"}
                {method === "wallet" && "📱 محفظة"}
              </label>
            ))}
          </div>

          <button className={styles.saveBtn}>💾 حفظ الفاتورة</button>
        </div>
      </div>
    </div>
  );
}
