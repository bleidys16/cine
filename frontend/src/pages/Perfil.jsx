import { useEffect, useState } from 'react';
import { Mail, UserRound, Ticket, Calendar, Clock, MapPin, Trash2 } from 'lucide-react';
import { formatFecha } from '../utils/fecha.js';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import styles from './Perfil.module.css';

const estadoBadge = (estado) => ({
  activo: 'badge-green',
  pendiente: 'badge-amber',
  expirado: 'badge-gray'
}[estado] || 'badge-gray');

export default function Perfil() {
  const { usuario: usuarioAuth } = useAuth();
  const [usuario, setUsuario] = useState(null);
  const [tiquetes, setTiquetes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [limpiando, setLimpiando] = useState(false);

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const { data } = await api.get('/tiquetes/usuario');
        setUsuario(data.usuario);
        setTiquetes(data.tiquetes || []);
      } catch (error) {
        if (error.response?.status === 404) {
          const { data } = await api.get('/tiquetes/mis-tiquetes');
          setUsuario(usuarioAuth || null);
          setTiquetes(data || []);
        } else {
          console.error(error);
        }
      } finally {
        setCargando(false);
      }
    };

    cargarPerfil();
  }, []);

  const limpiarHistorial = async () => {
    const confirmacion = window.confirm('Se eliminara todo tu historial de tiquetes. Esta accion no se puede deshacer.');
    if (!confirmacion) return;

    setLimpiando(true);
    try {
      await api.delete('/tiquetes/usuario');
      setTiquetes([]);
    } catch (error) {
      console.error(error);
      alert('No se pudo limpiar el historial en este momento.');
    } finally {
      setLimpiando(false);
    }
  };

  if (cargando) {
    return (
      <main className={styles.main}>
        <div className="container">
          <div className={styles.loaderWrap}>
            <div className="spinner" style={{ width: 36, height: 36 }} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={`container ${styles.layout}`}>
        <section className={`card ${styles.profileCard}`}>
          <div className={styles.profileHeader}>
            <h1>Perfil del Cliente</h1>
            <p>Consulta tus datos personales y el historial de tus tiquetes.</p>
          </div>

          <div className={styles.profileFields}>
            <article className={styles.fieldCard}>
              <span className={styles.fieldLabel}><UserRound size={15} /> Nombre</span>
              <strong>{usuario?.nombre || 'No disponible'}</strong>
            </article>
            <article className={styles.fieldCard}>
              <span className={styles.fieldLabel}><Mail size={15} /> Correo</span>
              <strong>{usuario?.email || 'No disponible'}</strong>
            </article>
          </div>
        </section>

        <section className={`card ${styles.ticketsCard}`}>
          <div className={styles.ticketsHeader}>
            <h2><Ticket size={18} /> Historial de tiquetes</h2>
            <div className={styles.ticketsActions}>
              <span className="tag">{tiquetes.length} total</span>
              <button
                className={`btn btn-danger ${styles.clearBtn}`}
                onClick={limpiarHistorial}
                disabled={limpiando || tiquetes.length === 0}
              >
                {limpiando ? <span className="spinner" /> : <Trash2 size={14} />}
                Limpiar historial
              </button>
            </div>
          </div>

          {tiquetes.length === 0 ? (
            <div className={styles.emptyState}>
              <Ticket size={48} strokeWidth={1.5} />
              <h3>Aun no tienes tiquetes</h3>
              <p>Cuando completes una compra, tus entradas apareceran en esta seccion.</p>
            </div>
          ) : (
            <div className={styles.ticketList}>
              {tiquetes.map((tiquete) => (
                <article key={tiquete.id} className={styles.ticketItem}>
                  <div className={styles.ticketTop}>
                    <h3>{tiquete.titulo}</h3>
                    <span className={`badge ${estadoBadge(tiquete.estado)}`}>{tiquete.estado}</span>
                  </div>

                  <div className={styles.ticketMeta}>
                    <span><Calendar size={13} /> {formatFecha(tiquete.fecha)}</span>
                    <span><Clock size={13} /> {tiquete.hora?.slice(0, 5) || '--:--'}</span>
                    <span><MapPin size={13} /> {tiquete.sala || 'Sala por definir'}</span>
                  </div>

                  <div className={styles.seatsWrap}>
                    {(tiquete.asientos || []).map((asiento, index) => (
                      <span key={`${tiquete.id}-${index}`} className={styles.seatTag}>
                        {asiento.fila}{asiento.columna}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
