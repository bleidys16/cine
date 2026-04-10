import { useState, useEffect } from 'react';
import { formatFecha } from '../utils/fecha.js';
import { Check, X, Ticket, Clock, User, Hash, Trash2 } from 'lucide-react';
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
    if (!window.confirm(`¿Estás seguro de ${accion.toUpperCase()} este tiquete?`)) return;
    setProcesando(id);
    try {
      if (accion === 'eliminar') {
        await api.delete(`/tiquetes/${id}`);
        setPendientes(prev => prev.filter(t => t.id !== id));
      } else {
        const { data } = await api.put(`/tiquetes/${id}/${accion}`);
        setPendientes(prev => prev.map(t => 
          t.id === id ? { ...t, estado: accion === 'confirmar' ? 'activo' : 'cancelado', codigo: data.tiquete?.codigo || t.codigo } : t
        ));
      }
    } catch (error) {
      console.error(error);
      alert('Hubo un error procesando el tiquete');
    } finally {
      if (procesando === id) setProcesando(null);
    }
  };

  const limpiarLista = async () => {
    if (!window.confirm('¿ATENCIÓN! ¿Estás seguro de que deseas VACIAR completamente la lista de tiquetes y estadísticas del sistema?')) return;
    setCargando(true);
    try {
      await api.delete('/tiquetes/reset-stats');
      setPendientes([]);
      alert('Historial vaciado exitosamente.');
    } catch (error) {
      console.error(error);
      alert('Error al intentar vaciar la lista.');
    } finally {
      setCargando(false);
    }
  };

  if (cargando) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  return (
    <div className={styles.wrap}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 className={styles.secTitle} style={{ margin: 0 }}>Tiquetes y Solicitudes</h2>
        {pendientes.length > 0 && (
          <button 
            className="btn" 
            style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, cursor: 'pointer' }}
            onClick={limpiarLista}
          >
            <Trash2 size={16} /> Vaciar Lista Completa
          </button>
        )}
      </div>

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
                  <th>Estado</th>
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
                      {!t.codigo?.startsWith('PEND-') ? (
                        <span style={{ fontSize: '0.85rem', color: '#2e7d32', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Check size={14} /> Aprobada
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: '#d4a843', fontWeight: 600 }}>
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>
                        <Hash size={10} style={{ marginRight: 4 }} />{t.codigo}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                        {!t.codigo?.startsWith('PEND-') ? null : (
                          <>
                            <button 
                              className="btn" 
                              style={{ padding: '6px 12px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: procesando === t.id ? 'not-allowed' : 'pointer', opacity: procesando === t.id ? 0.5 : 1 }}
                              onClick={() => procesarTiquete(t.id, 'confirmar')}
                              disabled={procesando === t.id}
                              title="Aprobar"
                            >
                              <Check size={14} />
                            </button>
                            <button 
                              className="btn" 
                              style={{ padding: '6px 12px', background: 'rgba(220, 53, 69, 0.1)', color: '#ff6b6b', border: '1px solid rgba(220, 53, 69, 0.2)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: procesando === t.id ? 'not-allowed' : 'pointer', opacity: procesando === t.id ? 0.5 : 1 }}
                              onClick={() => procesarTiquete(t.id, 'rechazar')}
                              disabled={procesando === t.id}
                              title="Rechazar"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                        <button 
                          className="btn" 
                          style={{ padding: '6px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: procesando === t.id ? 'not-allowed' : 'pointer', opacity: procesando === t.id ? 0.5 : 1 }}
                          onClick={() => procesarTiquete(t.id, 'eliminar')}
                          disabled={procesando === t.id}
                          title="Eliminar de la base de datos"
                        >
                          <Trash2 size={14} />
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
