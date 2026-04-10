import { formatFecha } from '../utils/fecha.js';
import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, Users, Film, Ticket, BarChart2, Percent, DoorOpen, Trophy } from 'lucide-react';
import api from '../services/api';
import styles from './AdminDashboard.module.css';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  const fetchDashboard = () => {
    setCargando(true);
    api.get('/tiquetes/dashboard')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleReset = () => {
    if (!window.confirm('¿Estás seguro de reiniciar todas las estadísticas? Esto eliminará todos los tiquetes y reservas permanentes.')) return;
    api.delete('/tiquetes/reset-stats')
      .then(() => {
        alert('Datos reiniciados correctamente');
        fetchDashboard();
      })
      .catch(err => alert('Error al reiniciar: ' + (err.response?.data?.mensaje || err.message)));
  };

  const peliculasActivas = useMemo(() => {
    const setTitulos = new Set((data?.ocupacion_funciones || []).map((f) => f.titulo));
    return Array.from(setTitulos);
  }, [data]);

  if (cargando) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  const totalVentas = data?.ventas_recientes?.reduce((s, v) => s + Number(v.total), 0) || 0;
  const totalTiquetes = data?.ventas_recientes?.reduce((s, v) => s + Number(v.cantidad), 0) || 0;

  // Ingreso máximo de sala (para la barra proporcional)
  const maxIngresoSala = Math.max(...(data?.ingresos_salas?.map(s => Number(s.ingresos)) || [1]), 1);

  return (
    <div className={styles.wrap}>
      <div className={styles.dashboardHeader}>
        <h2 className={styles.secTitle}>Resumen general</h2>
        <button className="btn btn-outline" onClick={handleReset} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
          Reiniciar Estadísticas
        </button>
      </div>

      <div className={styles.statsGrid}>
        <StatCard icon={<TrendingUp size={20} />} label="Ingresos (7 días)" value={`$${totalVentas.toLocaleString('es-CO')}`} color="gold" onClick={() => document.getElementById('ventas-dia')?.scrollIntoView({ behavior: 'smooth' })} />
        <StatCard icon={<Ticket size={20} />} label="Tiquetes vendidos" value={totalTiquetes} color="blue" onClick={() => navigate('/admin/pendientes')} />
        <StatCard icon={<Film size={20} />} label="Películas activas" value={peliculasActivas.length} color="purple" onClick={() => navigate('/admin/peliculas')} />
        <StatCard icon={<Users size={20} />} label="Funciones próximas" value={data?.ocupacion_funciones?.length || 0} color="green" onClick={() => navigate('/admin/funciones')} />
      </div>

      {/* ── Ventas + Ocupación ───────────────────────────────────────────── */}
      <div className={styles.grid2}>
        {/* Ventas por día */}
        <div id="ventas-dia" className={`card ${styles.tableCard}`}>
          <div className={styles.cardHeader}>
            <BarChart2 size={16} />
            <h3>Ventas por día</h3>
          </div>
          <table className={styles.table}>
            <thead>
              <tr><th>Fecha</th><th>Tiquetes</th><th>Total</th></tr>
            </thead>
            <tbody>
              {data?.ventas_recientes?.map((v, i) => (
                <tr key={i}>
                  <td>{formatFecha(v.dia, { month: 'short' })}</td>
                  <td><span className="badge badge-gray">{v.cantidad}</span></td>
                  <td className={styles.money}>${Number(v.total).toLocaleString('es-CO')}</td>
                </tr>
              ))}
              {!data?.ventas_recientes?.length && (
                <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Sin ventas aún</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Ocupación de funciones */}
        <div className={`card ${styles.tableCard}`}>
          <div className={styles.cardHeader}>
            <Percent size={16} />
            <h3>Ocupación de funciones</h3>
          </div>
          <div className={styles.funcList}>
            {data?.ocupacion_funciones?.map((f, i) => (
              <div key={i} className={styles.funcItem}>
                <div className={styles.funcInfo}>
                  <span className={styles.funcTitulo}>{f.titulo}</span>
                  <span className={styles.funcFecha}>
                    {formatFecha(f.fecha, { month: 'short' })} — {f.hora?.slice(0, 5)}
                    {f.sala && <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>· {f.sala}</span>}
                  </span>
                </div>
                <div className={styles.funcBar}>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${f.porcentaje}%` }} />
                  </div>
                  <span className={styles.barLabel}>{f.porcentaje}%</span>
                </div>
              </div>
            ))}
            {!data?.ocupacion_funciones?.length && (
              <p style={{ color: 'var(--text-muted)', padding: '20px', textAlign: 'center', fontSize: '0.85rem' }}>No hay funciones próximas</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Películas más populares ──────────────────────────────────────── */}
      {data?.peliculas_populares?.length > 0 && (
        <div className={`card ${styles.tableCard}`} style={{ marginTop: 24 }}>
          <div className={styles.cardHeader}>
            <Trophy size={16} />
            <h3>Películas que más ingresos generan</h3>
          </div>
          <table className={styles.table}>
            <thead>
              <tr><th>#</th><th>Película</th><th>Tiquetes vendidos</th><th>Ingresos totales</th></tr>
            </thead>
            <tbody>
              {data.peliculas_populares.map((p, i) => (
                <tr key={i}>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 24, height: 24, borderRadius: '50%',
                      background: i === 0 ? 'rgba(212,168,67,0.2)' : i === 1 ? 'rgba(255,255,255,0.06)' : 'transparent',
                      color: i === 0 ? 'var(--accent)' : 'var(--text-muted)',
                      fontWeight: i === 0 ? 700 : 400,
                      fontSize: '0.85rem'
                    }}>
                      {i + 1}
                    </span>
                  </td>
                  <td><strong>{p.titulo}</strong></td>
                  <td><span className="badge badge-gray">{p.ventas}</span></td>
                  <td className={styles.money}>${Number(p.ingresos).toLocaleString('es-CO')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Ingresos por sala ────────────────────────────────────────────── */}
      {data?.ingresos_salas?.length > 0 && (
        <div className={`card ${styles.tableCard}`} style={{ marginTop: 24 }}>
          <div className={styles.cardHeader}>
            <DoorOpen size={16} />
            <h3>Ingresos por sala</h3>
          </div>
          <div style={{ padding: '8px 0' }}>
            {data.ingresos_salas.map((s, i) => {
              const pct = Math.round((Number(s.ingresos) / maxIngresoSala) * 100);
              return (
                <div key={i} style={{ padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.sala}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginLeft: 10 }}>
                        {s.funciones_realizadas} func. · {s.tiquetes} tiquetes
                      </span>
                    </div>
                    <span className={styles.money} style={{ fontSize: '0.9rem' }}>
                      ${Number(s.ingresos).toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`,
                      background: 'linear-gradient(90deg, var(--accent), rgba(201,168,76,0.5))',
                      borderRadius: 4, transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color, onClick }) {
  return (
    <div className={`card ${styles.statCard} ${styles[`stat_${color}`]}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className={styles.statIcon}>{icon}</div>
      <div>
        <p className={styles.statLabel}>{label}</p>
        <p className={styles.statVal}>{value}</p>
      </div>
    </div>
  );
}
