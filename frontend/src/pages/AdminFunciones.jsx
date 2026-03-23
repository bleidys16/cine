import { useEffect, useState } from 'react';
import { Plus, Pencil, X, Check, Calendar, Clock } from 'lucide-react';
import api from '../services/api';
import { formatFecha } from '../utils/fecha.js';
import styles from './AdminPeliculas.module.css';

const EMPTY = { pelicula_id: '', fecha: '', hora: '', sala: 'Sala 1', precio: '', estado: 'disponible' };

export default function AdminFunciones() {
  const [funciones, setFunciones] = useState([]);
  const [peliculas, setPeliculas] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const cargar = () => {
    setCargando(true);
    Promise.all([api.get('/funciones'), api.get('/peliculas/todas')])
      .then(([f, p]) => { setFunciones(f.data); setPeliculas(p.data); })
      .catch(console.error)
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const handleEdit = (f) => {
    setForm({ pelicula_id: f.pelicula_id, fecha: f.fecha?.slice(0, 10), hora: f.hora?.slice(0, 5), sala: f.sala, precio: f.precio, estado: f.estado });
    setEditId(f.id); setShowForm(true); setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true); setError('');
    try {
      if (editId) await api.put(`/funciones/${editId}`, form);
      else await api.post('/funciones', form);
      setShowForm(false); cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar');
    } finally { setGuardando(false); }
  };

  const estadoBadge = (estado) => ({
    disponible: 'badge-green',
    preventa: 'badge-gold',
    cancelada: 'badge-red'
  }[estado] || 'badge-gray');

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2>Gestión de Funciones</h2>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(true); setError(''); }}>
          <Plus size={16} /> Nueva función
        </button>
      </div>

      {showForm && (
        <div className={`card ${styles.formCard}`}>
          <div className={styles.formHeader}>
            <h3>{editId ? 'Editar función' : 'Nueva función'}</h3>
            <button className={styles.closeBtn} onClick={() => setShowForm(false)}><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="label">Película *</label>
                <select className="input" value={form.pelicula_id} onChange={e => setForm({ ...form, pelicula_id: e.target.value })} required>
                  <option value="">Seleccionar película...</option>
                  {peliculas.filter(p => p.estado === 'activa').map(p => <option key={p.id} value={p.id}>{p.titulo}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Fecha *</label>
                <input className="input" type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} required min={new Date().toISOString().slice(0, 10)} />
              </div>
              <div className="form-group">
                <label className="label">Hora *</label>
                <input className="input" type="time" value={form.hora} onChange={e => setForm({ ...form, hora: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="label">Sala</label>
                <input className="input" value={form.sala} onChange={e => setForm({ ...form, sala: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">Precio (COP) *</label>
                <input className="input" type="number" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} required min="0" placeholder="Ej: 18000" />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="label">Estado</label>
                <select className="input" value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                  <option value="disponible">Disponible</option>
                  <option value="preventa">Preventa 🎟️</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
            </div>
            {error && <p className="error-msg">{error}</p>}
            <div className={styles.formActions}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={guardando}>
                {guardando ? <><div className="spinner" /> Guardando...</> : <><Check size={16} /> {editId ? 'Actualizar' : 'Crear función'}</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {cargando ? (
        <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: 'auto', width: 32, height: 32 }} /></div>
      ) : (
        <div className={`card ${styles.tableCard}`}>
          <table className={styles.table}>
            <thead>
              <tr><th>Película</th><th>Fecha</th><th>Hora</th><th>Sala</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {funciones.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No hay funciones programadas</td></tr>
              )}
              {funciones.map(f => (
                <tr key={f.id}>
                  <td><strong>{f.titulo}</strong></td>
                  <td><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={13} style={{ color: 'var(--text-muted)' }} />{formatFecha(f.fecha, { month: 'short' })}</span></td>
                  <td><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={13} style={{ color: 'var(--text-muted)' }} />{f.hora?.slice(0, 5)}</span></td>
                  <td>{f.sala}</td>
                  <td style={{ color: 'var(--gold)', fontWeight: 600 }}>${Number(f.precio).toLocaleString('es-CO')}</td>
                  <td><span className={`badge ${estadoBadge(f.estado)}`}>{f.estado}</span></td>
                  <td><button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={() => handleEdit(f)}><Pencil size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
