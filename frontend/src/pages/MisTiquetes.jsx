import { useEffect, useState } from 'react';
import { Ticket, Calendar, Clock, MapPin, Hash, ChevronDown, ChevronUp } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import styles from './MisTiquetes.module.css';

export default function MisTiquetes() {
  const [tiquetes, setTiquetes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [expandido, setExpandido] = useState(null);

  useEffect(() => {
    api.get('/tiquetes/mis-tiquetes')
      .then(r => setTiquetes(r.data))
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  const estadoBadge = (estado) => ({
    activo: 'badge-green', usado: 'badge-gray', cancelado: 'badge-red'
  }[estado] || 'badge-gray');

  if (cargando) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.header}>
          <h1>Mis Tiquetes</h1>
          <p>Historial de tus compras y reservas</p>
        </div>

        {tiquetes.length === 0 ? (
          <div className={styles.empty}>
            <Ticket size={56} strokeWidth={1} />
            <h3>No tienes tiquetes aún</h3>
            <p>Compra tus primeras entradas y aparecerán aquí</p>
          </div>
        ) : (
          <div className={styles.list}>
            {tiquetes.map(t => (
              <div key={t.id} className={`card ${styles.tiquete}`}>
                <div className={styles.tiqueteMain}>
                  <div className={styles.tiqueteLeft}>
                    <div className={styles.peliInfo}>
                      <span className={`badge ${estadoBadge(t.estado)}`}>{t.estado.toUpperCase()}</span>
                      <h3>{t.titulo}</h3>
                    </div>
                    <div className={styles.tiqueteMeta}>
                      <span><Calendar size={13} /> {new Date(t.fecha + 'T00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <span><Clock size={13} /> {t.hora?.slice(0, 5)}</span>
                      <span><MapPin size={13} /> {t.sala}</span>
                    </div>
                    <div className={styles.asientosList}>
                      {t.asientos?.map((a, i) => (
                        <span key={i} className={styles.asiento}>{a.fila}{a.columna}</span>
                      ))}
                    </div>
                  </div>
                  <div className={styles.tiqueteRight}>
                    <div className={styles.codigoBox}>
                      <span className={styles.codigoLabel}><Hash size={11} /> CÓDIGO</span>
                      <span className={styles.codigo}>{t.codigo}</span>
                    </div>
                    <div className={styles.totalBox}>
                      <span className={styles.totalLabel}>Total pagado</span>
                      <span className={styles.total}>${Number(t.total).toLocaleString('es-CO')}</span>
                    </div>
                    <button
                      className={`btn btn-ghost ${styles.btnQr}`}
                      onClick={() => setExpandido(expandido === t.id ? null : t.id)}
                    >
                      {expandido === t.id ? <><ChevronUp size={14} /> Ocultar QR</> : <><ChevronDown size={14} /> Ver QR</>}
                    </button>
                  </div>
                </div>

                {/* QR expandible */}
                {expandido === t.id && (
                  <div className={styles.qrPanel}>
                    <div className={styles.qrBox}>
                      <QRCodeSVG
                        value={t.codigo}
                        size={160}
                        bgColor="#ffffff"
                        fgColor="#080b10"
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <p className={styles.qrHint}>Presenta este QR en la entrada del cine</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
