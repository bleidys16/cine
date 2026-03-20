import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

export function Login() {
  const { login, cargando } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', contrasena: '' });
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(form.email, form.contrasena);
    if (res.ok) navigate('/');
    else setError(res.mensaje);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}><Film size={24} /></div>
          <span>CINE<strong>APP</strong></span>
        </div>
        <h1 className={styles.title}>Bienvenido de vuelta</h1>
        <p className={styles.sub}>Ingresa a tu cuenta para continuar</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="label">Correo electrónico</label>
            <div className={styles.inputWrap}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                type="email"
                className={`input ${styles.inputPadded}`}
                placeholder="tu@correo.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Contraseña</label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                type={showPass ? 'text' : 'password'}
                className={`input ${styles.inputPadded} ${styles.inputPaddedRight}`}
                placeholder="••••••••"
                value={form.contrasena}
                onChange={e => setForm({ ...form, contrasena: e.target.value })}
                required
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: 8 }} disabled={cargando}>
            {cargando ? <><div className="spinner" /> Ingresando...</> : 'Ingresar'}
          </button>
        </form>

        <p className={styles.switchText}>
          ¿No tienes cuenta? <Link to="/registro" className={styles.switchLink}>Regístrate gratis</Link>
        </p>
      </div>
    </div>
  );
}

export function Registro() {
  const { registrar, cargando } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', email: '', contrasena: '' });
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.contrasena.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');
    const res = await registrar(form.nombre, form.email, form.contrasena);
    if (res.ok) navigate('/');
    else setError(res.mensaje);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}><Film size={24} /></div>
          <span>CINE<strong>APP</strong></span>
        </div>
        <h1 className={styles.title}>Crear cuenta</h1>
        <p className={styles.sub}>Únete y empieza a disfrutar del cine</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="label">Nombre completo</label>
            <input className="input" placeholder="Tu nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="label">Correo electrónico</label>
            <div className={styles.inputWrap}>
              <Mail size={16} className={styles.inputIcon} />
              <input type="email" className={`input ${styles.inputPadded}`} placeholder="tu@correo.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Contraseña</label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input type={showPass ? 'text' : 'password'} className={`input ${styles.inputPadded} ${styles.inputPaddedRight}`} placeholder="Mínimo 6 caracteres" value={form.contrasena} onChange={e => setForm({ ...form, contrasena: e.target.value })} required />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: 8 }} disabled={cargando}>
            {cargando ? <><div className="spinner" /> Creando cuenta...</> : 'Crear cuenta'}
          </button>
        </form>

        <p className={styles.switchText}>
          ¿Ya tienes cuenta? <Link to="/login" className={styles.switchLink}>Ingresar</Link>
        </p>
      </div>
    </div>
  );
}
