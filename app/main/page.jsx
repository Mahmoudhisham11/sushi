"use client";
import styles from "./styles.module.css";
import { IoMdSearch } from "react-icons/io";
import { FaBars } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { db } from "@/app/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import SideBar from "@/components/SideBar/page";
import { MdOutlineTableRestaurant } from "react-icons/md";
import Link from "next/link"; // ✅ استيراد لينك

function Main() {
  const [openSideBar, setOpenSideBar] = useState(false);
  const [tables, setTables] = useState([]);
  const [search, setSearch] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const q = query(collection(db, "tables"), orderBy("number", "asc"));
        const querySnapshot = await getDocs(q);
        const fetchedTables = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTables(fetchedTables);
      } catch (error) {
        console.error("Error fetching tables:", error);
      }
    };

    if (typeof window !== "undefined") {
      const name = localStorage.getItem("userName") || "ضيف";
      setUserName(name);
    }

    fetchTables();
  }, []);

  const filteredTables = tables.filter((table) =>
    table.number?.toString().toLowerCase().includes(search.toLowerCase())
  );

  // ✅ حساب عدد الترابيزات المشغولة والفاضية
  const totalTables = tables.length;
  const busyTables = tables.filter((t) => t.status === "busy").length;
  const freeTables = totalTables - busyTables;

  return (
    <div className={styles.mainContainer}>
      <SideBar />

      <div className={styles.middleSection}>
        {/* ✅ Header */}
        <div className={styles.header}>
          <div className={styles.left}>
            <button onClick={() => setOpenSideBar(true)}>
              <FaBars />
            </button>
            <h2>الترابيزات</h2>
          </div>

          <div className={styles.searchBox}>
            <IoMdSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="ابحث عن الترابيزة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.userBox}>
            <span>👋 مرحباً {userName}</span>
          </div>
        </div>

        <hr />

        {/* ✅ Info Cards */}
        <div className={styles.infoCards}>
          <div className={styles.infoCard}>
            <h3>{totalTables}</h3>
            <p>إجمالي الترابيزات</p>
          </div>
          <div className={styles.infoCard}>
            <h3>{busyTables}</h3>
            <p>مشغولة</p>
          </div>
          <div className={styles.infoCard}>
            <h3>{freeTables}</h3>
            <p>فاضية</p>
          </div>
        </div>

        {/* ✅ ملاحظة/تنبيه */}
        <div className={styles.noticeBox}>
          <p>💡 تذكير: الكاشير يمكنه فقط عرض الترابيزات والبيع وعرض تقفيلة اليوم.</p>
        </div>

        {/* ✅ Tables */}
        <div className={styles.tableContainer}>
          {filteredTables.length > 0 ? (
            filteredTables.map((table) => (
              <Link
                key={table.id}
                href={`/sales/${table.id}`} // ✅ يفتح صفحة الترابيزة
                className={styles.tableCard}
              >
                <span className={styles.tableIcon}>
                  <MdOutlineTableRestaurant />
                </span>
                <h4>ترابيزة {table.number}</h4>
              </Link>
            ))
          ) : (
            <p className={styles.noData}>لا توجد ترابيزات</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Main;
