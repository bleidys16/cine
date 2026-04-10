import { useEffect, useState, useMemo } from 'react';
import { Plus, Pencil, X, Check, Calendar, Clock, Filter, ChevronDown, Search } from 'lucide-react';
import api from '../services/api';
import { formatFecha } from '../utils/fecha.js';
import styles from './AdminPeliculas.module.css';
import filterStyles from './AdminFiltros.module.css';

const EMPTY = { pelicula_id: '', fecha: '', hora: '', sala_id: '', precio: '', estado: 'disponible' };

const ESTADOS = ['Todos', 'disponible', 'preventa', 'cancelada'];

export default function AdminFunciones() {
  const [funciones, setFunciones] = useState([]);
  const [peliculas, setPeliculas] = useState([]);
  const [salas, setSalas] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  // ── Filtros ──────────────────────────────────────────────────────────────
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroSala, setFiltroSala] = useState('');
  const [filtroPelicula, setFiltroPelicula] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroHora, setFiltroHora] = useState('');

  const cargar = () => {
    setCargando(true);
    Promise.all([api.get('/funciones/todas'), api.get('/peliculas/todas'), api.get('/salas')])
      .then(([f, p, s]) => { setFunciones(f.data); setPeliculas(p.data); setSalas(s.data); })
      .catch(() =>
        // fallback: /funciones puede ser la ruta pública
        Promise.all([api.get('/funciones'), api.get('/peliculas/todas'), api.get('/salas')])
          .then(([f, p, s]) => { setFunciones(f.data); setPeliculas(p.data); setSalas(s.data); })
          .catch(console.error)
      )
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  // Horas únicas disponibles para el filtro
  const horasUnicas = useMemo(() =>
    [...new Set(funciones.map(f => f.hora?.slice(0, 5)).filter(Boolean))].sort(),
    [funciones]
  );

  // Aplicar todos los filtros
  const funcionesFiltradas = useMemo(() => {
    return funciones.filter(f => {
      if (filtroEstado !== 'Todos' && f.estado !== filtroEstado) return false;
      if (filtroSala && String(f.sala_id) !== filtroSala) return false;
      if (filtroPelicula && !f.titulo?.toLowerCase().includes(filtroPelicula.toLowerCase())) return false;
      if (filtroFecha && f.fecha?.slice(0, 10) !== filtroFecha) return false;
      if (filtroHora && f.hora?.slice(0, 5) !== filtroHora) return false;
      return true;
    });
  }, [funciones, filtroEstado, filtroSala, filtroPelicula, filtroFecha, filtroHora]);

  const limpiarFiltros = () => {
    setFiltroEstado('Todos');
    setFiltroSala('');
    setFiltroPelicula('');
    setFiltroFecha('');
    setFiltroHora('');
  };

  const hayFiltrosActivos = filtroEstado !== 'Todos' || filtroSala || filtroPelicula || filtroFecha || filtroHora;

  const handleEdit = (f) => {
    setForm({
      pelicula_id: f.pelicula_id,
      fecha: f.fecha?.slice(0, 10),
      hora: f.hora?.slice(0, 5),
      sala_id: f.sala_id,
      precio: f.precio,
      estado: f.estado
    });
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

      {/* ── Panel de filtros ─────────────────────────────────────────────── */}
      <div className={`card ${filterStyles.filtrosPanel}`}>
        <div className={filterStyles.filtrosHeader}>
          <span className={filterStyles.filtrosTitle}><Filter size={15} /> Filtros</span>
          {hayFiltrosActivos && (
            <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '4px 10px' }} onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          )}
        </div>
        <div className={filterStyles.filtrosGrid}>
          {/* Estado */}
          <div className={filterStyles.filtroItem}>
            <label className={filterStyles.filtroLabel}>Estado</label>
            <div className={filterStyles.selectWrap}>
              <select className="input" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                {ESTADOS.map(e => <option key={e} value={e}>{e === 'Todos' ? 'Todos los estados' : e}</option>)}
              </select>
              <ChevronDown size={13} className={filterStyles.selectIcon} />
            </div>
          </div>

          {/* Sala */}
          <div className={filterStyles.filtroItem}>
            <label className={filterStyles.filtroLabel}>Sala</label>
            <div className={filterStyles.selectWrap}>
              <select className="input" value={filtroSala} onChange={e => setFiltroSala(e.target.value)}>
                <option value="">Todas las salas</option>
                {salas.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
              <ChevronDown size={13} className={filterStyles.selectIcon} />
            </div>
          </div>

          {/* Película (Buscador) */}
          <div className={filterStyles.filtroItem}>
            <label className={filterStyles.filtroLabel}>Película</label>
            <div className={filterStyles.selectWrap}>
              <input 
                className="input" 
                placeholder="Buscar película..." 
                value={filtroPelicula} 
                onChange={e => setFiltroPelicula(e.target.value)} 
                style={{ paddingRight: '32px' }}
              />
              <Search size={14} className={filterStyles.selectIcon} />
            </div>
          </div>

          {/* Fecha */}
          <div className={filterStyles.filtroItem}>
            <label className={filterStyles.filtroLabel}>Fecha</label>
            <input className="input" type="date" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} />
          </div>

          {/* Hora */}
          <div className={filterStyles.filtroItem}>
            <label className={filterStyles.filtroLabel}>Hora</label>
            <div className={filterStyles.selectWrap}>
              <select className="input" value={filtroHora} onChange={e => setFiltroHora(e.target.value)}>
                <option value="">Todas las horas</option>
                {horasUnicas.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <ChevronDown size={13} className={filterStyles.selectIcon} />
            </div>
          </div>
        </div>

        {/* Resumen de resultados */}
        <div className={filterStyles.filtrosFooter}>
          <span className={filterStyles.resultCount}>
            {funcionesFiltradas.length} función{funcionesFiltradas.length !== 1 ? 'es' : ''} encontrada{funcionesFiltradas.length !== 1 ? 's' : ''}
            {hayFiltrosActivos && ` de ${funciones.length} total`}
          </span>
        </div>
      </div>

      {/* ── Formulario ───────────────────────────────────────────────────── */}
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
                  {peliculas.filter(p => p.estado === 'activa' || p.estado === 'preventa').map(p =>
                    <option key={p.id} value={p.id}>{p.titulo} ({p.estado})</option>
                  )}
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
                <select className="input" value={form.sala_id} onChange={e => setForm({ ...form, sala_id: e.target.value })}>
                  <option value="">Seleccionar sala...</option>
                  {salas.map(s => <option key={s.id} value={s.id}>{s.nombre} ({s.capacidad_total} asientos)</option>)}
                </select>
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

      {/* ── Tabla ────────────────────────────────────────────────────────── */}
      {cargando ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" style={{ margin: 'auto', width: 32, height: 32 }} />
        </div>
      ) : (
        <div className={`card ${styles.tableCard}`}>
          <table className={styles.table}>
            <thead>
              <tr><th>Película</th><th>Fecha</th><th>Hora</th><th>Sala</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {funcionesFiltradas.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    {hayFiltrosActivos ? 'No hay funciones con los filtros seleccionados' : 'No hay funciones programadas'}
                  </td>
                </tr>
              )}
              {funcionesFiltradas.map(f => (
                <tr key={f.id}>
                  <td><strong>{f.titulo}</strong></td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                      {formatFecha(f.fecha, { month: 'short' })}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={13} style={{ color: 'var(--text-muted)' }} />
                      {f.hora?.slice(0, 5)}
                    </span>
                  </td>
                  <td>{f.sala || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>${Number(f.precio).toLocaleString('es-CO')}</td>
                  <td><span className={`badge ${estadoBadge(f.estado)}`}>{f.estado}</span></td>
                  <td>
                    <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={() => handleEdit(f)}>
                      <Pencil size={14} />
                    </button>
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
