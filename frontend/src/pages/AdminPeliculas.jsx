import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, Search } from 'lucide-react';
import api from '../services/api';
import styles from './AdminPeliculas.module.css';

const EMPTY = { titulo: '', descripcion: '', duracion: '', genero: '', clasificacion: '', imagen_url: '', trailer_url: '', estado: 'activa' };
const GENEROS = ['Acción', 'Drama', 'Ciencia Ficción', 'Comedia', 'Terror', 'Musical', 'Romance', 'Animación', 'Documental', 'Suspenso'];
const CLASIF = ['Para todos', '+7', '+13', '+16', '+18'];

export default function AdminPeliculas() {
  const [peliculas, setPeliculas] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [tmdbQuery, setTmdbQuery] = useState('');
  const [tmdbResults, setTmdbResults] = useState([]);
  const [buscandoTmdb, setBuscandoTmdb] = useState(false);

  const cargar = () => {
    setCargando(true);
    api.get('/peliculas/todas').then(r => setPeliculas(r.data)).catch(console.error).finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const buscarTmdb = async () => {
    if (!tmdbQuery.trim()) return;
    setBuscandoTmdb(true);
    try {
      const { data } = await api.get(`/tmdb/buscar?query=${encodeURIComponent(tmdbQuery)}`);
      setTmdbResults(data);
    } catch { setError('Error buscando en TMDB'); }
    finally { setBuscandoTmdb(false); }
  };

  const seleccionarTmdb = (movie) => {
    setForm(prev => ({
      ...prev,
      titulo: movie.titulo,
      descripcion: movie.descripcion || prev.descripcion,
      imagen_url: movie.imagen_url || prev.imagen_url,
    }));
    setTmdbResults([]);
    setTmdbQuery('');
  };

  const handleEdit = (p) => { setForm({ ...p }); setEditId(p.id); setShowForm(true); setError(''); setTmdbResults([]); };
  const handleNew = () => { setForm(EMPTY); setEditId(null); setShowForm(true); setError(''); setTmdbResults([]); };
  const handleCancel = () => { setShowForm(false); setError(''); setTmdbResults([]); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true); setError('');
    try {
      if (editId) await api.put(`/peliculas/${editId}`, form);
      else await api.post('/peliculas', form);
      setShowForm(false);
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar');
    } finally { setGuardando(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Desactivar esta película?')) return;
    try { await api.delete(`/peliculas/${id}`); cargar(); } catch { alert('Error al eliminar'); }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2>Gestión de Películas</h2>
        <button className="btn btn-primary" onClick={handleNew}><Plus size={16} /> Nueva película</button>
      </div>

      {showForm && (
        <div className={`card ${styles.formCard}`}>
          <div className={styles.formHeader}>
            <h3>{editId ? 'Editar película' : 'Nueva película'}</h3>
            <button className={styles.closeBtn} onClick={handleCancel}><X size={18} /></button>
          </div>
          <div className={styles.form}>
            {/* Buscador TMDB */}
            <div className={styles.tmdbSearch}>
              <p className={styles.tmdbLabel}>🔍 Buscar en TMDB para autocompletar</p>
              <div className={styles.tmdbRow}>
                <input
                  className="input"
                  placeholder="Ej: Saltburn, Challengers..."
                  value={tmdbQuery}
                  onChange={e => setTmdbQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), buscarTmdb())}
                />
                <button className="btn btn-ghost" onClick={buscarTmdb} disabled={buscandoTmdb} type="button">
                  {buscandoTmdb ? <div className="spinner" /> : <><Search size={15} /> Buscar</>}
                </button>
              </div>
              {tmdbResults.length > 0 && (
                <div className={styles.tmdbResults}>
                  {tmdbResults.map(m => (
                    <button key={m.id} className={styles.tmdbResult} onClick={() => seleccionarTmdb(m)} type="button">
                      {m.imagen_url && <img src={m.imagen_url} alt="" className={styles.tmdbThumb} onError={e => e.target.style.display='none'} />}
                      <div>
                        <strong>{m.titulo}</strong>
                        <span>{m.año}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <hr className="divider" />

            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="label">Título *</label>
                  <input className="input" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="label">Duración (min) *</label>
                  <input className="input" type="number" value={form.duracion} onChange={e => setForm({ ...form, duracion: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="label">Género</label>
                  <select className="input" value={form.genero} onChange={e => setForm({ ...form, genero: e.target.value })}>
                    <option value="">Seleccionar...</option>
                    {GENEROS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Clasificación</label>
                  <select className="input" value={form.clasificacion} onChange={e => setForm({ ...form, clasificacion: e.target.value })}>
                    <option value="">Seleccionar...</option>
                    {CLASIF.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="label">Descripción</label>
                  <textarea className="input" rows={3} style={{ resize: 'vertical' }} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">URL Imagen</label>
                  <input className="input" value={form.imagen_url} onChange={e => setForm({ ...form, imagen_url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="form-group">
                  <label className="label">URL Trailer</label>
                  <input className="input" value={form.trailer_url} onChange={e => setForm({ ...form, trailer_url: e.target.value })} placeholder="https://youtube.com/..." />
                </div>
                {editId && (
                  <div className="form-group">
                    <label className="label">Estado</label>
                    <select className="input" value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                      <option value="activa">Activa</option>
                      <option value="inactiva">Inactiva</option>
                    </select>
                  </div>
                )}
              </div>
              {/* Preview imagen */}
              {form.imagen_url && (
                <div className={styles.imgPreview}>
                  <img src={form.imagen_url} alt="Preview" onError={e => e.target.style.display='none'} />
                </div>
              )}
              {error && <p className="error-msg">{error}</p>}
              <div className={styles.formActions}>
                <button type="button" className="btn btn-ghost" onClick={handleCancel}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {guardando ? <><div className="spinner" /> Guardando...</> : <><Check size={16} /> {editId ? 'Actualizar' : 'Crear película'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cargando ? (
        <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: 'auto', width: 32, height: 32 }} /></div>
      ) : (
        <div className={`card ${styles.tableCard}`}>
          <table className={styles.table}>
            <thead>
              <tr><th>Película</th><th>Género</th><th>Duración</th><th>Clasificación</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {peliculas.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className={styles.pelInfo}>
                      {p.imagen_url && <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/tmdb/poster/${p.imagen_url.split('/w500/')[1] || p.imagen_url.split('/w342/')[1]}`} alt="" className={styles.thumb} onError={e => e.target.style.display='none'} />}
                      <strong>{p.titulo}</strong>
                    </div>
                  </td>
                  <td>{p.genero || '—'}</td>
                  <td>{p.duracion} min</td>
                  <td>{p.clasificacion || '—'}</td>
                  <td><span className={`badge ${p.estado === 'activa' ? 'badge-green' : 'badge-gray'}`}>{p.estado}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={() => handleEdit(p)}><Pencil size={14} /></button>
                      <button className="btn btn-danger" style={{ padding: '6px 10px' }} onClick={() => handleDelete(p.id)}><Trash2 size={14} /></button>
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
