import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const navItems = [
  ['dashboard', '/dashboard'],
  ['customers', '/customers'],
  ['orders', '/orders'],
  ['reports', '/reports'],
];

export default function Layout() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('goldsmith_lang', lang);
  };

  const handleLogout = () => {
    localStorage.removeItem('goldsmith_token');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-none flex-col lg:flex-row">
        <aside className="w-full border-b border-white/10 bg-[#171717] p-4 lg:w-80 lg:border-b-0 lg:border-r lg:p-5">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gold">Gold Smith</p>
              <h2 className="text-xl font-semibold">Management System</h2>
            </div>
            <span className="rounded-full border border-gold/70 bg-gold/10 px-2 py-1 text-xs text-gold">{t('role')}</span>
          </div>
          <nav className="space-y-2">
            {navItems.map(([key, to]) => (
              <NavLink
                key={key}
                to={to}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${isActive ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 bg-white/5 hover:border-gold/60 hover:bg-white/10'}`
                }
              >
                {t(key)}
                <span className="text-xs text-white/60">→</span>
              </NavLink>
            ))}
          </nav>
          <div className="mt-8 rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm text-white/80">
            <p className="text-gold">{t('welcome')}</p>
            <p className="mt-1">{user?.name || 'Manager'}</p>
          </div>
        </aside>
        <main className="flex-1 p-3 md:p-4 xl:p-5">
          <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#171717]/95 p-4 shadow-card md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gold">{t('dashboardTitle')}</p>
              <h1 className="mt-1 text-2xl font-semibold">{t('shopName')}</h1>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => changeLanguage('en')} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm">English</button>
              <button onClick={() => changeLanguage('ta')} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm">தமிழ்</button>
              <button onClick={handleLogout} className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-[#111111]">{t('logout')}</button>
            </div>
          </header>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
