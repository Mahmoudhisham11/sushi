'use client';
import styles from "./styles.module.css";
import { useState } from "react";
import { db } from "@/app/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { CiLock } from "react-icons/ci";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { useRouter } from "next/navigation";

function Home() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

    const handleLogin = async () => {
        const q = query(collection(db, 'employess'), where("name", "==", name))
        const querySnapshot = await getDocs(q)
        if(querySnapshot.empty) {
            alert('اسم المستخدم غير صحيح')
            return
        }
        const userData = querySnapshot.docs[0].data()
        if(userData.password !== password) {
            alert("كلمة المرور غير صحيحة")
            return
        }
        if(userData.job === 'owner') {
            router.push('/dashboard')
        }else  {
            router.push('/main')
        }
        if(typeof window !== "undefined") {
            localStorage.setItem('userName', userData.name)
        }
    }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.logoContainer}>
        <h2>DEVORIA</h2>
      </div>
      <div className={styles.loginContent}>
        <div className={styles.title}>
          <h3>مرحبا بك، برجاء تسجيل الدخول</h3>
        </div>
        <div className={styles.inputs}>
          <div className="inputContainer">
            <label><MdDriveFileRenameOutline /></label>
            <input
              type="text"
              value={name}
              placeholder="اسم المستخدم"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="inputContainer">
            <label><CiLock /></label>
            <input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className={styles.loginBtn} onClick={handleLogin}>
            تسجيل الدخول
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
