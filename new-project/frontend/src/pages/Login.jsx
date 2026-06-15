import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('goldsmith_token', data.token);
      setUser(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#171717]/95 p-6 shadow-card">
        <p className="text-xs uppercase tracking-[0.35em] text-gold">Gold Smith</p>
        <h1 className="mt-3 text-3xl font-semibold">{t('login')}</h1>
        <p className="mt-2 text-white/70">Responsive jewelry shop management dashboard</p>
        {error && <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none ring-0 placeholder:text-white/40" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder={t('username')} />
          <input type="password" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/40" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={t('password')} />
          <button className="w-full rounded-2xl bg-gold px-4 py-3 font-semibold text-[#111111]">{t('login')}</button>
        </form>
        <p className="mt-4 text-sm text-white/70">Need an account? <Link className="text-gold" to="/register">{t('register')}</Link></p>
      </div>
    </div>
  );
}
