import { formatFecha } from '../utils/fecha.js';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Ticket, CheckCircle, ArrowLeft, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
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
    ]).then(([_, a]) => setAsientos(a.data))
      .catch(console.error)
      .finally(() => setCargando(false));

    api.get('/funciones').then(r => {
      const f = r.data.find(fn => fn.id === parseInt(funcionId));
      if (f) setFuncion(f);
    });
  }, [funcionId]);

  const toggleAsiento = (id) =>
    setSeleccionados(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const handleComprar = async () => {
    if (!seleccionados.length) return;
    setComprando(true); setError('');
    try {
      const { data } = await api.post('/tiquetes/comprar', {
        funcion_id: parseInt(funcionId),
        asientos_ids: seleccionados
      });
      setTiquete(data.tiquete);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al procesar la compra');
    } finally { setComprando(false); }
  };

  const total = funcion ? seleccionados.length * parseFloat(funcion.precio) : 0;

  if (tiquete) return <TiqueteConfirmado tiquete={tiquete} navigate={navigate} />;

  if (cargando) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  return (
    <main className={styles.main}>
      <div className="container">
        <button className={`btn btn-ghost ${styles.back}`} onClick={() => navigate(-1)}>
          <ArrowLeft size={15} /> Volver
        </button>

        <div className={styles.layout}>
          {/* Asientos */}
          <div className={styles.seatSection}>
            <div className={styles.sectionHeader}>
              <h2>Selecciona tus asientos</h2>
              {seleccionados.length > 0 && (
                <span className={styles.countBadge}>{seleccionados.length} seleccionado{seleccionados.length > 1 ? 's' : ''}</span>
              )}
            </div>
            <SeatGrid asientos={asientos} seleccionados={seleccionados} onToggle={toggleAsiento} />
          </div>

          {/* Resumen */}
          {funcion && (
            <div className={styles.resumen}>
              <div className={`card ${styles.resumenCard}`}>
                {/* Info función */}
                <div className={styles.resumenHeader}>
                  <h3 className={styles.resumenTitle}>{funcion.titulo}</h3>
                  <div className={styles.resumenMeta}>
                    <span><Calendar size={13} /> {formatFecha(funcion.fecha)}</span>
                    <span><Clock size={13} /> {funcion.hora?.slice(0, 5)}</span>
                    <span><MapPin size={13} /> {funcion.sala}</span>
                  </div>
                </div>

                <hr className="divider" />

                {/* Asientos seleccionados */}
                <div className={styles.asientosSelec}>
                  <p className={styles.asientosLabel}>Asientos</p>
                  {seleccionados.length === 0 ? (
                    <p className={styles.asientosEmpty}>Ninguno seleccionado</p>
                  ) : (
                    <div className={styles.asientosPills}>
                      {seleccionados.map(id => {
                        const a = asientos.find(s => s.id === id);
                        return a ? <span key={id} className={styles.asientoPill}>{a.fila}{a.columna}</span> : null;
                      })}
                    </div>
                  )}
                </div>

                <hr className="divider" />

                {/* Total */}
                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>Total</span>
                  <span className={styles.totalVal}>${total.toLocaleString('es-CO')}</span>
                </div>

                {error && <p className="error-msg" style={{ marginTop: 12 }}>{error}</p>}

                <button
                  className={`btn btn-primary ${styles.btnComprar}`}
                  disabled={!seleccionados.length || comprando}
                  onClick={handleComprar}
                >
                  {comprando
                    ? <><div className="spinner" /> Procesando...</>
                    : <><Ticket size={15} /> Confirmar compra</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function TiqueteConfirmado({ tiquete, navigate }) {
  const handleDescargar = () => {
    const svg = document.getElementById('qr-tiquete');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 300; canvas.height = 300;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 300, 300);
      ctx.drawImage(img, 0, 0, 300, 300);
      const a = document.createElement('a');
      a.download = `tiquete-${tiquete.codigo}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <main className={styles.confirmMain}>
      <div className="container" style={{ maxWidth: 480 }}>
        <div className={`card ${styles.tiqueteCard}`}>

          {/* Header */}
          <div className={styles.tiqueteHeader}>
            <CheckCircle size={40} color="var(--green)" strokeWidth={1.5} />
            <div>
              <h2 className={styles.tiqueteTitle}>¡Compra exitosa!</h2>
              <p className={styles.tiqueteSub}>Presenta el QR o el código en la entrada</p>
            </div>
          </div>

          <hr className="divider" />

          {/* QR */}
          <div className={styles.qrSection}>
            <div className={styles.qrBox}>
              <QRCodeSVG
                id="qr-tiquete"
                value={tiquete.codigo}
                size={160}
                bgColor="#ffffff"
                fgColor="#0a0a0a"
                level="H"
                includeMargin={true}
              />
            </div>
            <div className={styles.codigoWrap}>
              <span className={styles.codigoLabel}>Código de acceso</span>
              <span className={styles.codigo}>{tiquete.codigo}</span>
              <button className={`btn btn-ghost ${styles.btnDescargar}`} onClick={handleDescargar}>
                <Download size={13} /> Descargar QR
              </button>
            </div>
          </div>

          <hr className="divider" />

          {/* Detalles */}
          <div className={styles.tiqueteInfo}>
            {[
              ['Película', tiquete.funcion?.titulo],
              ['Fecha', formatFecha(tiquete.funcion?.fecha)],
              ['Hora', tiquete.funcion?.hora?.slice(0, 5)],
              ['Sala', tiquete.funcion?.sala],
              ['Asientos', tiquete.asientos?.map(a => `${a.fila}${a.columna}`).join(', ')],
              ['Total', `$${Number(tiquete.total).toLocaleString('es-CO')}`],
            ].map(([label, value]) => (
              <div key={label} className={styles.tiqueteRow}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <hr className="divider" />

          {/* Acciones */}
          <div className={styles.tiqueteActions}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate('/mis-tiquetes')}>
              Mis tiquetes
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
