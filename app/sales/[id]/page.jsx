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
