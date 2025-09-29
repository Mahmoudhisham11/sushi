'use client';
import styles from "./styles.module.css";
import Link from "next/link";
import { TbReportSearch } from "react-icons/tb";
import { IoFastFoodOutline } from "react-icons/io5";
import { BiLogOutCircle } from "react-icons/bi";
import { useRouter } from "next/navigation";
import { MdOutlineTableRestaurant } from "react-icons/md";
import { GoPerson } from "react-icons/go";
import { MdOutlineDashboard } from "react-icons/md";

function CashSideBar() {
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.clear(); 
      router.push("/");  
    }
  };

  return (
    <div className={styles.sideBar}>
      <div className={styles.top}>
        <div className={styles.title}>
        <h2>Devoria</h2>
        </div>
        <div className={styles.actions}>
          <Link href={"/main"} className={styles.actionLinks}>
            <span><MdOutlineDashboard /></span>
            <span>الصفحة الرئيسية</span>
          </Link>
          <Link href={"/main"} className={styles.actionLinks}>
            <span><TbReportSearch /></span>
            <span>التقارير</span>
          </Link>
        </div>
      </div>

      <div className={styles.actions}>
        {/* ✅ خلي زرار تسجيل الخروج مجرد button عشان ينفذ الفنكشن */}
        <button className={styles.actionLinks} onClick={handleLogout}>
          <span><BiLogOutCircle /></span>
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
}

export default CashSideBar;
