import { formatFecha } from '../utils/fecha.js';
import { useEffect, useState } from 'react';
import { TrendingUp, Users, Film, Ticket, BarChart2, Percent } from 'lucide-react';
import api from '../services/api';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get('/tiquetes/dashboard')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  const totalVentas = data?.ventas_recientes?.reduce((s, v) => s + Number(v.total), 0) || 0;
  const totalTiquetes = data?.ventas_recientes?.reduce((s, v) => s + Number(v.cantidad), 0) || 0;

  return (
    <div className={styles.wrap}>
      <h2 className={styles.secTitle}>Resumen general</h2>

      <div className={styles.statsGrid}>
        <StatCard icon={<TrendingUp size={20} />} label="Ingresos (7 días)" value={`$${totalVentas.toLocaleString('es-CO')}`} color="gold" />
        <StatCard icon={<Ticket size={20} />} label="Tiquetes vendidos" value={totalTiquetes} color="blue" />
        <StatCard icon={<Film size={20} />} label="Películas activas" value={data?.peliculas_populares?.length || 0} color="purple" />
        <StatCard icon={<Users size={20} />} label="Funciones próximas" value={data?.ocupacion_funciones?.length || 0} color="green" />
      </div>

      <div className={styles.grid2}>
        {/* Ventas recientes */}
        <div className={`card ${styles.tableCard}`}>
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
                  <span className={styles.funcFecha}>{formatFecha(f.fecha, { month: 'short' })} — {f.hora?.slice(0,5)}</span>
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

      {/* Películas más vistas */}
      {data?.peliculas_populares?.length > 0 && (
        <div className={`card ${styles.tableCard}`} style={{ marginTop: 24 }}>
          <div className={styles.cardHeader}>
            <Film size={16} />
            <h3>Películas más populares</h3>
          </div>
          <table className={styles.table}>
            <thead>
              <tr><th>#</th><th>Película</th><th>Ventas</th><th>Ingresos</th></tr>
            </thead>
            <tbody>
              {data.peliculas_populares.map((p, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td><strong>{p.titulo}</strong></td>
                  <td><span className="badge badge-gray">{p.ventas}</span></td>
                  <td className={styles.money}>${Number(p.ingresos).toLocaleString('es-CO')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`card ${styles.statCard} ${styles[`stat_${color}`]}`}>
      <div className={styles.statIcon}>{icon}</div>
      <div>
        <p className={styles.statLabel}>{label}</p>
        <p className={styles.statVal}>{value}</p>
      </div>
    </div>
  );
}
