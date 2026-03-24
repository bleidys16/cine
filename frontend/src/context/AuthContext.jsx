import { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(() => {
    const stored = localStorage.getItem('usuario');
    return stored ? JSON.parse(stored) : null;
  });
  const [cargando, setCargando] = useState(false);

  const login = async (email, contrasena) => {
    setCargando(true);
    try {
      const { data } = await api.post('/auth/login', { email, password: contrasena });
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      setUsuario(data.usuario);
      return { ok: true };
    } catch (err) {
      return { ok: false, mensaje: err.response?.data?.mensaje || 'Error al iniciar sesión' };
    } finally {
      setCargando(false);
    }
  };

  const registrar = async (nombre, email, contrasena) => {
    setCargando(true);
    try {
      const { data } = await api.post('/auth/registrar', { nombre, email, password: contrasena });
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      setUsuario(data.usuario);
      return { ok: true };
    } catch (err) {
      return { ok: false, mensaje: err.response?.data?.mensaje || 'Error al registrarse' };
    } finally {
      setCargando(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);