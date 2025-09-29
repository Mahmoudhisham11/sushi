'use client';
import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import SideBar from "@/components/SideBar/page";

import { FaMoneyBillWave, FaChartLine, FaExclamationTriangle, FaUsers } from "react-icons/fa";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [employeesCount, setEmployeesCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalLoss, setTotalLoss] = useState(0);
  const [topProducts, setTopProducts] = useState([]);
  const [topClients, setTopClients] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reportsSnapshot = await getDocs(collection(db, "reports"));
        const reportsData = reportsSnapshot.docs.map(doc => doc.data() || {});
        setReports(reportsData);

        const thisMonth = new Date().getMonth();
        const monthReports = reportsData.filter(r => {
          if (!r.createdAt) return false;
          const date = r.createdAt.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
          return date.getMonth() === thisMonth;
        });

        const revenue = monthReports.reduce((acc, r) => acc + (r.total || 0), 0);
        setTotalRevenue(revenue);
        setTotalProfit(revenue);
        setTotalLoss(0);

        const clientCounts = {};
        monthReports.forEach(r => {
          if (r.clientName) {
            clientCounts[r.clientName] = (clientCounts[r.clientName] || 0) + 1;
          }
        });
        const clientsArray = Object.keys(clientCounts).map(name => ({
          name,
          visits: clientCounts[name],
        }));
        clientsArray.sort((a, b) => b.visits - a.visits);
        setTopClients(clientsArray);

        const productCounts = {};
        monthReports.forEach(r => r.items?.forEach(p => {
          if (p && p.name && p.quantity) {
            productCounts[p.name] = (productCounts[p.name] || 0) + p.quantity;
          }
        }));
        const productsArray = Object.keys(productCounts).map(name => ({
          name,
          sales: productCounts[name],
        }));
        productsArray.sort((a, b) => b.sales - a.sales);
        setTopProducts(productsArray.slice(0, 3));

        const days = Array.from({ length: 31 }, (_, i) => i + 1);
        const dailyRev = days.map(day => {
          const dayReports = monthReports.filter(r => {
            const date = r.createdAt.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
            return date.getDate() === day;
          });
          return {
            day,
            revenue: dayReports.reduce((acc, r) => acc + (r.total || 0), 0),
          };
        });
        setDailyRevenue(dailyRev);

        const employeesSnapshot = await getDocs(collection(db, "employees"));
        setEmployeesCount(employeesSnapshot.docs.length);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <SideBar />
        <div className={styles.loading}>جاري تحميل البيانات...</div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <SideBar />
      <div className="contentContainer">
        <div className="headerContainer">
            <div className="header">
                <h2>لوحة التحكم</h2>
            </div>
        </div>

        <div className={styles.content}>
            {/* كروت المعلومات */}
            <div className={styles.cardsGrid}>
          <div className={styles.card}>
            <div className={styles.icon}><FaMoneyBillWave /></div>
            <div>
              <h3>إجمالي المبيعات</h3>
              <p>{totalRevenue || 0} جنيه</p>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.icon}><FaChartLine /></div>
            <div>
              <h3>الأرباح</h3>
              <p>{totalProfit || 0} جنيه</p>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.icon}><FaExclamationTriangle /></div>
            <div>
              <h3>الخسائر</h3>
              <p>{totalLoss || 0} جنيه</p>
            </div>
          </div>
            <div className={styles.card}>
                <div className={styles.icon}><FaUsers /></div>
                <div>
                <h3>عدد الموظفين</h3>
                <p>{employeesCount || 0}</p>
                </div>
            </div>
            </div>
            {/* الإيرادات اليومية */}
            <div className={styles.chartBox}>
            <h2>الإيرادات اليومية للشهر</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyRevenue}>
                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={3} />
                </LineChart>
            </ResponsiveContainer>
            </div>
            {/* أعلى العملاء وأفضل المنتجات جنب بعض */}
            <div className={styles.sideBySideCharts}>
            <div className={styles.chartBox}>
                <h2>العملاء الأكثر زيارة</h2>
                <ResponsiveContainer width="100%" height={300}>
                <BarChart layout="vertical" data={topClients}>
                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Bar dataKey="visits" fill="#F97316" radius={[6, 6, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            </div>

            <div className={styles.chartBox}>
                <h2>أفضل المنتجات مبيعًا</h2>
                <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts}>
                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
}
