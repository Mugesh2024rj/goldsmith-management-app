import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const StatCard = ({ label, value, accent = 'gold' }) => (
  <article className="rounded-3xl border border-white/10 bg-[#171717] p-5 shadow-card">
    <p className="text-sm text-white/70">{label}</p>
    <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    <div className={`mt-4 h-1 rounded-full bg-${accent} / 70`} />
  </article>
);

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    gold_rate: 0,
    silver_rate: 0,
    weekly_revenue: 0,
    monthly_revenue: 0,
    yearly_revenue: 0,
    pending_orders: 0,
    completed_orders: 0,
    repair_orders: 0,
  });

  useEffect(() => {
    api.get('/dashboard').then(({ data }) => setSummary(data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t('todayGoldRate')} value={`₹${summary.gold_rate || 0}/g`} />
        <StatCard label={t('todaySilverRate')} value={`₹${summary.silver_rate || 0}/g`} />
        <StatCard label={t('weeklyRevenue')} value={`₹${summary.weekly_revenue || 0}`} />
        <StatCard label={t('monthlyRevenue')} value={`₹${summary.monthly_revenue || 0}`} />
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t('yearlyRevenue')} value={`₹${summary.yearly_revenue || 0}`} />
        <StatCard label={t('pendingOrders')} value={summary.pending_orders} />
        <StatCard label={t('completedOrders')} value={summary.completed_orders} />
        <StatCard label={t('repairOrders')} value={summary.repair_orders} />
      </section>
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-white/10 bg-[#171717] p-5 shadow-card">
          <h2 className="text-xl font-semibold">Quick actions</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={() => navigate('/orders?metal_type=gold')} className="rounded-full bg-gold px-4 py-3 text-sm font-semibold text-[#111111] hover:bg-[#e3c35b]">{t('gold')}</button>
            <button onClick={() => navigate('/orders?metal_type=silver')} className="rounded-full bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20">{t('silver')}</button>
            <button onClick={() => navigate('/customers')} className="rounded-full border border-gold/60 bg-gold/10 px-4 py-3 text-sm font-semibold text-gold hover:bg-gold/20">{t('addCustomer')}</button>
          </div>
          <p className="mt-4 text-sm text-white/70">This dashboard is ready for customer, order, and report management workflows.</p>
        </article>
        <article className="rounded-3xl border border-white/10 bg-[#171717] p-5 shadow-card">
          <h2 className="text-xl font-semibold">Today at a glance</h2>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            <li>• Orders are tracked with status flow.</li>
            <li>• Gold and silver rates update from the admin panel.</li>
            <li>• Reports include daily, weekly, monthly, and yearly summaries.</li>
          </ul>
        </article>
      </section>
    </div>
  );
}
