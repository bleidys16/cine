import { useState, useEffect } from 'react';
import { formatFecha } from '../utils/fecha.js';
import { Check, X, Ticket, Clock, User, Hash } from 'lucide-react';
import api from '../services/api';
import styles from './AdminDashboard.module.css'; // Reutilizamos estilos tabla

export default function AdminPendientes() {
  const [pendientes, setPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(null);

  const cargarPendientes = () => {
    setCargando(true);
    api.get('/tiquetes/pendientes')
      .then(r => setPendientes(r.data))
      .catch(console.error)
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarPendientes();
  }, []);

  const procesarTiquete = async (id, accion) => {
    if (!window.confirm(`¿Estás seguro de ${accion === 'confirmar' ? 'APROBAR' : 'RECHAZAR'} este tiquete?`)) return;
    setProcesando(id);
    try {
      await api.put(`/tiquetes/${id}/${accion}`);
      setPendientes(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error(error);
      alert('Hubo un error procesando el tiquete');
    } finally {
      if (procesando === id) setProcesando(null);
    }
  };

  if (cargando) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  return (
    <div className={styles.wrap}>
      <h2 className={styles.secTitle}>Tiquetes Pendientes de Aprobación</h2>

      <div className={`card ${styles.tableCard}`}>
        <div className={styles.cardHeader}>
          <Clock size={16} />
          <h3>Solicitudes de compra</h3>
        </div>
        
        {pendientes.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Ticket size={40} style={{ margin: '0 auto 15px', color: '#333' }} />
            <p>No hay solicitudes pendientes en este momento.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Película / Función</th>
                  <th>Asientos</th>
                  <th>Total</th>
                  <th>Código</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pendientes.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <User size={14} color="var(--text-muted)" />
                        <div>
                          <div style={{ fontWeight: 500 }}>{t.usuario_nombre}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.usuario_email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{t.titulo}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {formatFecha(t.fecha, { month: 'short' })} — {t.hora?.slice(0, 5)} (Sala {t.sala})
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-gray">{t.asientos?.length || 0}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 6 }}>
                        {t.asientos?.map(a => `${a.fila}${a.columna}`).join(', ')}
                      </span>
                    </td>
                    <td className={styles.money}>${Number(t.total).toLocaleString('es-CO')}</td>
                    <td>
                      <span style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>
                        <Hash size={10} style={{ marginRight: 4 }} />{t.codigo}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button 
                          className="btn" 
                          style={{ padding: '6px 12px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: procesando === t.id ? 'not-allowed' : 'pointer', opacity: procesando === t.id ? 0.5 : 1 }}
                          onClick={() => procesarTiquete(t.id, 'confirmar')}
                          disabled={procesando === t.id}
                        >
                          <Check size={14} /> Aprobar
                        </button>
                        <button 
                          className="btn" 
                          style={{ padding: '6px 12px', background: 'rgba(220, 53, 69, 0.1)', color: '#ff6b6b', border: '1px solid rgba(220, 53, 69, 0.2)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: procesando === t.id ? 'not-allowed' : 'pointer', opacity: procesando === t.id ? 0.5 : 1 }}
                          onClick={() => procesarTiquete(t.id, 'rechazar')}
                          disabled={procesando === t.id}
                        >
                          <X size={14} /> Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
