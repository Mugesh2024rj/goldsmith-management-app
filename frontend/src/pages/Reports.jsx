import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const StatCard = ({ label, value, highlight }) => (
  <article className={`rounded-3xl border p-5 shadow-card ${highlight ? 'border-amber-400/30 bg-[#1a1a1a]' : 'border-white/10 bg-[#171717]'}`}>
    <p className="text-sm text-white/70">{label}</p>
    <p className={`mt-3 text-2xl font-semibold ${highlight ? 'text-amber-100' : 'text-white'}`}>{value}</p>
  </article>
);

export default function Reports() {
  const { t } = useTranslation();

  const [stats, setStats] = useState({
    total_revenue: 0,
    total_gold_weight: 0,
    total_silver_weight: 0,
    pending_amount: 0,
    completed_orders: 0,
    total_orders: 0,
  });

  const [weeklyLabels, setWeeklyLabels] = useState([]);
  const [weeklyGold, setWeeklyGold] = useState([]);
  const [weeklySilver, setWeeklySilver] = useState([]);
  const [metalData, setMetalData] = useState([]);
  const [activeTab, setActiveTab] = useState('weekly');

  useEffect(() => {
    loadReports('weekly');
  }, []);

  const loadReports = async (type) => {
    setActiveTab(type);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        api.get(`/reports/${type}`),
        api.get('/orders'),
      ]);

      const s = statsRes.data;
      setStats({
        total_revenue: Number(s.total_revenue || 0),
        total_gold_weight: Number(s.total_gold_weight || 0),
        total_silver_weight: Number(s.total_silver_weight || 0),
        pending_amount: Number(s.pending_amount || 0),
        completed_orders: Number(s.completed_orders || 0),
        total_orders: Number(s.total_orders || 0),
      });

      // Build weekly chart from orders
      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      buildCharts(orders, type);

    } catch (err) {
      console.error('Reports error:', err.message);
    }
  };

  const buildCharts = (orders, type) => {
    const now = new Date();
    const labels = [];
    const gold = [];
    const silver = [];
    const metalMap = {};

    // Generate date labels
    const days = type === 'daily' ? 1 : type === 'weekly' ? 7 : type === 'monthly' ? 30 : 365;
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = type === 'yearly'
        ? d.toLocaleString('default', { month: 'short' })
        : d.toISOString().split('T')[0];
      if (!labels.includes(key)) {
        labels.push(key);
        gold.push(0);
        silver.push(0);
      }
    }

    orders.forEach((item) => {
      if (!item.order_date) return;
      const d = new Date(item.order_date);
      const key = type === 'yearly'
        ? d.toLocaleString('default', { month: 'short' })
        : item.order_date.split('T')[0];
      const idx = labels.indexOf(key);
      const amount = Number(item.total_amount || 0);
      const metal = String(item.metal_type || '').toLowerCase();

      if (idx !== -1) {
        if (metal === 'gold') gold[idx] += amount;
        else if (metal === 'silver') silver[idx] += amount;
      }

      metalMap[metal] = (metalMap[metal] || 0) + 1;
    });

    setWeeklyLabels(labels);
    setWeeklyGold(gold);
    setWeeklySilver(silver);
    setMetalData(Object.entries(metalMap).map(([k, v]) => ({ metal_type: k, count: v })));
  };

  const barData = {
    labels: weeklyLabels,
    datasets: [
      {
        label: 'Gold ₹',
        data: weeklyGold,
        backgroundColor: '#D4AF37',
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Silver ₹',
        data: weeklySilver,
        backgroundColor: '#e0e0e0',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#ccc', boxWidth: 12 } },
      tooltip: {
        backgroundColor: '#111',
        titleColor: '#fff',
        bodyColor: '#D4AF37',
        callbacks: { label: (ctx) => ` ₹${Number(ctx.raw || 0).toLocaleString()}` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#aaa', font: { size: 10 }, maxRotation: 45 } },
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#aaa', callback: (v) => `₹${v}` } },
    },
  };

  const pieData = {
    labels: metalData.length ? metalData.map((m) => m.metal_type) : ['No Data'],
    datasets: [{
      data: metalData.length ? metalData.map((m) => m.count) : [1],
      backgroundColor: metalData.length ? ['#D4AF37', '#e0e0e0', '#B8860B'] : ['#333'],
      borderColor: '#171717',
      borderWidth: 2,
    }],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#ccc', boxWidth: 12 } },
      tooltip: { backgroundColor: '#111', titleColor: '#fff', bodyColor: '#D4AF37' },
    },
  };

  const tabs = ['daily', 'weekly', 'monthly', 'yearly'];

  return (
    <div className="space-y-6">

      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => loadReports(tab)}
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
              activeTab === tab
                ? 'bg-gold text-[#111]'
                : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            {t(`${tab}Report`)}
          </button>
        ))}
      </div>

      {/* Stat Cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Revenue" value={`₹${stats.total_revenue.toLocaleString()}`} />
        <StatCard label="Gold Weight" value={`${stats.total_gold_weight.toFixed(3)} g`} />
        <StatCard label="Silver Weight" value={`${stats.total_silver_weight.toFixed(3)} g`} />
        <StatCard label="Pending Amount" value={stats.pending_amount > 0 ? `₹${stats.pending_amount.toLocaleString()}` : '₹0'} highlight />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <StatCard label="Completed Orders" value={stats.completed_orders} />
        <StatCard label="Total Orders" value={stats.total_orders} />
      </section>

      {/* Charts */}
      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <article className="rounded-3xl border border-white/10 bg-[#171717] p-6 shadow-card">
          <p className="text-xs uppercase tracking-widest text-gold mb-1">Revenue Chart</p>
          <h2 className="text-lg font-semibold mb-4 capitalize">{activeTab} Performance</h2>
          <div className="h-72 rounded-2xl border border-white/5 bg-[#111] p-3">
            <Bar data={barData} options={barOptions} />
          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-[#171717] p-6 shadow-card">
          <p className="text-xs uppercase tracking-widest text-gold mb-1">Metal Mix</p>
          <h2 className="text-lg font-semibold mb-4">Order Distribution</h2>
          <div className="h-72 rounded-2xl border border-white/5 bg-[#111] p-3">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </article>
      </section>

    </div>
  );
}
