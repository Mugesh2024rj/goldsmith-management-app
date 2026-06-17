import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'staff' });
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', form);
      setMessage('Registration successful. Please login.');
      setTimeout(() => navigate('/login'), 800);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#171717]/95 p-6 shadow-card">
        <p className="text-xs uppercase tracking-[0.35em] text-gold">Gold Smith</p>
        <h1 className="mt-3 text-3xl font-semibold">{t('register')}</h1>
        <p className="mt-2 text-white/70">Create a shop staff or admin account.</p>
        {message && <p className="mt-4 rounded-xl border border-gold/30 bg-gold/10 p-3 text-sm text-gold">{message}</p>}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/40" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t('name')} />
          <input className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/40" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder={t('username')} />
          <input type="password" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/40" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={t('password')} />
          <select className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
          <button className="w-full rounded-2xl bg-gold px-4 py-3 font-semibold text-[#111111]">{t('register')}</button>
        </form>
        <p className="mt-4 text-sm text-white/70">Already have an account? <Link className="text-gold" to="/login">{t('login')}</Link></p>
      </div>
    </div>
  );
}
