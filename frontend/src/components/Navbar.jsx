import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, Ticket, LogIn, LogOut, LayoutDashboard, Menu, X, Star } from 'lucide-react';
import { useState } from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.brand}>
          <div className={styles.brandIcon}><Film size={18} /></div>
          <span>CINE<strong>APP</strong></span>
        </Link>

        <div className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          <Link to="/" className={`${styles.link} ${isActive('/') ? styles.active : ''}`} onClick={() => setMenuOpen(false)}>
            Cartelera
          </Link>
          <Link to="/preventa" className={`${styles.link} ${styles.linkPreventa} ${isActive('/preventa') ? styles.activePreventa : ''}`} onClick={() => setMenuOpen(false)}>
            <Star size={13} /> Preventa
          </Link>
          {usuario && usuario.rol !== 'admin' && (
            <Link to="/mis-tiquetes" className={`${styles.link} ${isActive('/mis-tiquetes') ? styles.active : ''}`} onClick={() => setMenuOpen(false)}>
              <Ticket size={14} /> Mis Tiquetes
            </Link>
          )}
          {usuario?.rol === 'admin' && (
            <Link to="/admin" className={`${styles.link} ${isActive('/admin') ? styles.active : ''}`} onClick={() => setMenuOpen(false)}>
              <LayoutDashboard size={14} /> Admin
            </Link>
          )}
          <div className={styles.authArea}>
            {usuario ? (
              <div className={styles.userMenu}>
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>{usuario.nombre[0].toUpperCase()}</div>
                  <span className={styles.userName}>{usuario.nombre.split(' ')[0]}</span>
                </div>
                <button className="btn btn-ghost" onClick={handleLogout} style={{ padding: '7px 12px', fontSize: '0.82rem' }}>
                  <LogOut size={14} /> Salir
                </button>
              </div>
            ) : (
              <div className={styles.authButtons}>
                <Link to="/login" className="btn btn-ghost" style={{ padding: '7px 14px', fontSize: '0.84rem' }} onClick={() => setMenuOpen(false)}>
                  <LogIn size={14} /> Ingresar
                </Link>
                <Link to="/registro" className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '0.84rem' }} onClick={() => setMenuOpen(false)}>
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>

        <button className={styles.burger} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </nav>
  );
}
