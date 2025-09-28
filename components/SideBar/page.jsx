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

function SideBar() {
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
          <Link href={"/dashboard"} className={styles.actionLinks}>
            <span><MdOutlineDashboard /></span>
            <span>الصفحة الرئيسية</span>
          </Link>
          <Link href={"/employess"} className={styles.actionLinks}>
            <span><GoPerson /></span>
            <span>الموظفين</span>
          </Link>
          <Link href={"/products"} className={styles.actionLinks}>
            <span><IoFastFoodOutline /></span>
            <span>الاكلات</span>
          </Link>
          <Link href={"/tables"} className={styles.actionLinks}>
            <span><MdOutlineTableRestaurant /></span>
            <span>الترابيزات</span>
          </Link>
          <Link href={"/reports"} className={styles.actionLinks}>
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

export default SideBar;
