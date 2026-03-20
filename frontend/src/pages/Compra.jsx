import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Ticket, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import SeatGrid from '../components/SeatGrid';
import styles from './Compra.module.css';

export default function Compra() {
  const { funcionId } = useParams();
  const navigate = useNavigate();
  const [funcion, setFuncion] = useState(null);
  const [asientos, setAsientos] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [comprando, setComprando] = useState(false);
  const [tiquete, setTiquete] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/funciones/pelicula/all`).catch(() => ({ data: [] })),
      api.get(`/funciones/${funcionId}/asientos`)
    ]).then(([_, a]) => {
      setAsientos(a.data);
    }).catch(console.error)
      .finally(() => setCargando(false));

    // Buscar info de la función en el listado general
    api.get('/funciones').then(r => {
      const f = r.data.find(fn => fn.id === parseInt(funcionId));
      if (f) setFuncion(f);
    });
  }, [funcionId]);

  const toggleAsiento = (id) => {
    setSeleccionados(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleComprar = async () => {
    if (seleccionados.length === 0) return;
    setComprando(true);
    setError('');
    try {
      const { data } = await api.post('/tiquetes/comprar', {
        funcion_id: parseInt(funcionId),
        asientos_ids: seleccionados
      });
      setTiquete(data.tiquete);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al procesar la compra');
    } finally {
      setComprando(false);
    }
  };

  const total = funcion ? seleccionados.length * parseFloat(funcion.precio) : 0;

  if (tiquete) return <TiqueteConfirmado tiquete={tiquete} navigate={navigate} />;

  if (cargando) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  return (
    <main className={styles.main}>
      <div className="container">
        <button className={`btn btn-ghost ${styles.back}`} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Volver
        </button>

        <div className={styles.layout}>
          {/* Selector de asientos */}
          <div className={styles.seatSection}>
            <div className={styles.sectionHeader}>
              <h2>Selecciona tus asientos</h2>
              <span className="badge badge-gold">{seleccionados.length} seleccionados</span>
            </div>
            <SeatGrid
              asientos={asientos}
              seleccionados={seleccionados}
              onToggle={toggleAsiento}
            />
          </div>

          {/* Resumen */}
          <div className={styles.resumen}>
            {funcion && (
              <div className={`card ${styles.resumenCard}`}>
                <h3 className={styles.resumenTitle}>{funcion.titulo}</h3>
                <div className={styles.resumenMeta}>
                  <div className={styles.resumenItem}>
                    <Calendar size={14} />
                    <span>{new Date(funcion.fecha + 'T00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}</span>
                  </div>
                  <div className={styles.resumenItem}>
                    <Clock size={14} />
                    <span>{funcion.hora?.slice(0, 5)}</span>
                  </div>
                  <div className={styles.resumenItem}>
                    <MapPin size={14} />
                    <span>{funcion.sala}</span>
                  </div>
                </div>

                <hr className="divider" />

                <div className={styles.asientosSelec}>
                  <p className="label">Asientos seleccionados</p>
                  {seleccionados.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Ninguno aún</p>
                  ) : (
                    <div className={styles.asientosPills}>
                      {seleccionados.map(id => {
                        const a = asientos.find(s => s.id === id);
                        return a ? (
                          <span key={id} className={styles.asientoPill}>{a.fila}{a.columna}</span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                <hr className="divider" />

                <div className={styles.totalRow}>
                  <span>Total</span>
                  <span className={styles.totalVal}>${total.toLocaleString('es-CO')}</span>
                </div>

                {error && <p className="error-msg" style={{ marginTop: 12 }}>{error}</p>}

                <button
                  className={`btn btn-primary ${styles.btnComprar}`}
                  disabled={seleccionados.length === 0 || comprando}
                  onClick={handleComprar}
                >
                  {comprando ? <><div className="spinner" /> Procesando...</> : <><Ticket size={16} /> Confirmar compra</>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function TiqueteConfirmado({ tiquete, navigate }) {
  return (
    <main style={{ paddingTop: 64, minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: 520 }}>
        <div className={`card ${styles.tiqueteCard}`}>
          <div className={styles.tiqueteHeader}>
            <CheckCircle size={48} color="var(--green)" strokeWidth={1.5} />
            <h2>¡Compra exitosa!</h2>
            <p>Tu tiquete ha sido generado</p>
          </div>

          <div className={styles.codigoWrap}>
            <span className={styles.codigoLabel}>CÓDIGO DE ACCESO</span>
            <div className={styles.codigo}>{tiquete.codigo}</div>
          </div>

          <div className={styles.tiqueteInfo}>
            <div className={styles.tiqueteRow}><span>Película</span><strong>{tiquete.funcion?.titulo}</strong></div>
            <div className={styles.tiqueteRow}><span>Fecha</span><strong>{tiquete.funcion?.fecha}</strong></div>
            <div className={styles.tiqueteRow}><span>Hora</span><strong>{tiquete.funcion?.hora?.slice(0,5)}</strong></div>
            <div className={styles.tiqueteRow}><span>Sala</span><strong>{tiquete.funcion?.sala}</strong></div>
            <div className={styles.tiqueteRow}><span>Asientos</span>
              <strong>{tiquete.asientos?.map(a => `${a.fila}${a.columna}`).join(', ')}</strong>
            </div>
            <div className={styles.tiqueteRow}><span>Total</span><strong style={{ color: 'var(--accent)' }}>${Number(tiquete.total).toLocaleString('es-CO')}</strong></div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate('/mis-tiquetes')}>
              <Ticket size={15} /> Mis tiquetes
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/')}>
              Ver cartelera
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
