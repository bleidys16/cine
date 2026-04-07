import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, DoorOpen } from 'lucide-react';
import api from '../services/api';
import styles from './AdminPeliculas.module.css';

const EMPTY = { nombre: '', filas: '', columnas: '', capacidad_total: '', estado: 'activa' };

export default function AdminSalas() {
  const [salas, setSalas] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const cargar = () => {
    setCargando(true);
    api.get('/salas').then(r => setSalas(r.data)).catch(console.error).finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const handleEdit = (s) => {
    setForm({ ...s, filas: String(s.filas), columnas: String(s.columnas), capacidad_total: String(s.capacidad_total) });
    setEditId(s.id); setShowForm(true); setError('');
  };

  const handleNew = () => { setForm(EMPTY); setEditId(null); setShowForm(true); setError(''); };
  const handleCancel = () => { setShowForm(false); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true); setError('');
    const data = { ...form, filas: parseInt(form.filas), columnas: parseInt(form.columnas), capacidad_total: parseInt(form.columnas) * parseInt(form.filas) };
    try {
      if (editId) await api.put(`/salas/${editId}`, data);
      else await api.post('/salas', data);
      setShowForm(false); cargar();
    } catch (err) { setError(err.response?.data?.mensaje || 'Error al guardar'); }
    finally { setGuardando(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Inactivar esta sala?')) return;
    try { await api.delete(`/salas/${id}`); cargar(); } catch { alert('Error al eliminar'); }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2>Gestión de Salas</h2>
        <button className="btn btn-primary" onClick={handleNew}><Plus size={16} /> Nueva sala</button>
      </div>

      {showForm && (
        <div className={`card ${styles.formCard}`}>
          <div className={styles.formHeader}>
            <h3>{editId ? 'Editar sala' : 'Nueva sala'}</h3>
            <button className={styles.closeBtn} onClick={handleCancel}><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className="form-group">
                <label className="label">Nombre *</label>
                <input className="input" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required placeholder="Ej: Sala 1 (Normal)" />
              </div>
              <div className="form-group">
                <label className="label">Filas *</label>
                <input className="input" type="number" value={form.filas} onChange={e => setForm({ ...form, filas: e.target.value })} required min="1" />
              </div>
              <div className="form-group">
                <label className="label">Columnas *</label>
                <input className="input" type="number" value={form.columnas} onChange={e => setForm({ ...form, columnas: e.target.value })} required min="1" />
              </div>
              <div className="form-group">
                <label className="label">Estado</label>
                <select className="input" value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                  <option value="activa">Activa</option>
                  <option value="inactiva">Inactiva</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="label">Capacidad calculada: {form.filas && form.columnas ? parseInt(form.filas) * parseInt(form.columnas) : 0} asientos</label>
              </div>
            </div>
            {error && <p className="error-msg">{error}</p>}
            <div className={styles.formActions}>
              <button type="button" className="btn btn-ghost" onClick={handleCancel}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={guardando}>
                {guardando ? <><div className="spinner" /> Guardando...</> : <><Check size={16} /> {editId ? 'Actualizar' : 'Crear sala'}</>}
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
              <tr><th>Sala</th><th>Filas</th><th>Columnas</th><th>Capacidad</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {salas.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.nombre}</strong></td>
                  <td>{s.filas}</td>
                  <td>{s.columnas}</td>
                  <td>{s.capacidad_total} asientos</td>
                  <td><span className={`badge ${s.estado === 'activa' ? 'badge-green' : 'badge-gray'}`}>{s.estado}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={() => handleEdit(s)}><Pencil size={14} /></button>
                      <button className="btn btn-danger" style={{ padding: '6px 10px' }} onClick={() => handleDelete(s.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
