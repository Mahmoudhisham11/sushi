"use client";
import styles from "./styles.module.css";
import { IoMdSearch } from "react-icons/io";
import { FaBars } from "react-icons/fa6";
import { MdOutlineTableRestaurant } from "react-icons/md";
import { MdOutlineRestaurantMenu } from "react-icons/md"; // أيقونة للترابيزات المشغولة
import { useEffect, useState } from "react";
import { db } from "@/app/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Link from "next/link";
import CashSideBar from "@/components/CashSideBar/page";

function Main() {
  const [openSideBar, setOpenSideBar] = useState(false);
  const [tables, setTables] = useState([]);
  const [search, setSearch] = useState("");
  const [userName, setUserName] = useState("");

  const [busyTablesIds, setBusyTablesIds] = useState([]);

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

    const fetchBusyTables = async () => {
      try {
        const ordersSnapshot = await getDocs(collection(db, "orders"));
        const busyIds = ordersSnapshot.docs.map((doc) => doc.id);
        setBusyTablesIds(busyIds);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    if (typeof window !== "undefined") {
      const name = localStorage.getItem("userName") || "ضيف";
      setUserName(name);
    }

    fetchTables();
    fetchBusyTables();
  }, []);

  const filteredTables = tables.filter((table) =>
    table.number?.toString().toLowerCase().includes(search.toLowerCase())
  );

  // حساب عدد الترابيزات المشغولة والفاضية بناءً على orders
  const totalTables = tables.length;
  const busyTables = busyTablesIds.length;
  const freeTables = totalTables - busyTables;

  return (
    <div className={styles.mainContainer}>
      <CashSideBar/>

      <div className={styles.middleSection}>
        {/* Header */}
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

        {/* Info Cards */}
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

        {/* Tables */}
        <div className={styles.tableContainer}>
          {filteredTables.length > 0 ? (
            filteredTables.map((table) => {
              const isBusy = busyTablesIds.includes(table.id);
              return (
                <Link
                  key={table.id}
                  href={`/sales/${table.id}`}
                  className={styles.tableCard}
                >
                  <span className={styles.tableIcon}>
                    {isBusy ? <MdOutlineRestaurantMenu /> : <MdOutlineTableRestaurant />}
                  </span>
                  <h4>ترابيزة {table.number}</h4>
                </Link>
              );
            })
          ) : (
            <p className={styles.noData}>لا توجد ترابيزات</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Main;
