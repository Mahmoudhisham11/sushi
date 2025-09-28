'use client';
import SideBar from "@/components/SideBar/page";
import styles from "./styles.module.css";

export default function Dashboard() {

    return(
        <div className={styles.dashboard}>
            <SideBar/>
            <div className={styles.contentContainer}>
                <h2>Devoria Test</h2>
            </div>
        </div>
    )
}