import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { LayoutDashboard, Film, Calendar, ScanLine, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './AdminLayout.module.css';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={17} />, end: true },
  { to: '/admin/peliculas', label: 'Películas', icon: <Film size={17} /> },
  { to: '/admin/funciones', label: 'Funciones', icon: <Calendar size={17} /> },
  { to: '/admin/validar', label: 'Validar Tiquetes', icon: <ScanLine size={17} /> },
];

export default function AdminLayout() {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" />;
  if (usuario.rol !== 'admin') return <Navigate to="/" />;

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>Panel Admin</span>
        </div>
        <nav className={styles.nav}>
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
              <ChevronRight size={14} className={styles.chevron} />
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
