import { useState, useEffect, useRef } from 'react';
import { ScanLine, CheckCircle2, XCircle, AlertCircle, Search, Camera, CameraOff, Keyboard } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../services/api';
import styles from './AdminValidador.module.css';

export default function AdminValidador() {
  const [codigo, setCodigo] = useState('');
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [modoEscaner, setModoEscaner] = useState(false);
  const [escaneando, setEscaneando] = useState(false);
  const [errorCamara, setErrorCamara] = useState('');
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);

  // Iniciar cámara
  useEffect(() => {
    if (modoEscaner) {
      setErrorCamara('');
      const html5Qr = new Html5Qrcode('qr-reader');
      html5QrRef.current = html5Qr;

      html5Qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          // QR escaneado exitosamente
          await html5Qr.stop();
          setModoEscaner(false);
          setEscaneando(false);
          setCodigo(decodedText);
          validarCodigo(decodedText);
        },
        () => {} // error silencioso mientras busca
      ).then(() => {
        setEscaneando(true);
      }).catch(err => {
        setErrorCamara('No se pudo acceder a la cámara. Verifica los permisos.');
        setModoEscaner(false);
        console.error(err);
      });
    } else {
      // Detener cámara si estaba activa
      if (html5QrRef.current && escaneando) {
        html5QrRef.current.stop().catch(() => {});
        setEscaneando(false);
      }
    }

    return () => {
      if (html5QrRef.current && escaneando) {
        html5QrRef.current.stop().catch(() => {});
      }
    };
  }, [modoEscaner]);

  const validarCodigo = async (cod) => {
    const codigoFinal = (cod || codigo).trim();
    if (!codigoFinal) return;
    setCargando(true);
    setResultado(null);
    try {
      const { data } = await api.post('/tiquetes/validar', { codigo: codigoFinal });
      setResultado(data);
    } catch (err) {
      setResultado(err.response?.data || { valido: false, estado: 'invalido', mensaje: 'Error de red' });
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    validarCodigo();
  };

  const resetear = () => {
    setCodigo('');
    setResultado(null);
    setErrorCamara('');
  };

  const iconMap = {
    valido: <CheckCircle2 size={64} color="var(--green)" strokeWidth={1.5} />,
    usado: <AlertCircle size={64} color="var(--accent)" strokeWidth={1.5} />,
    cancelado: <XCircle size={64} color="var(--red)" strokeWidth={1.5} />,
    invalido: <XCircle size={64} color="var(--red)" strokeWidth={1.5} />,
  };

  const colorMap = {
    valido: 'var(--green)',
    usado: 'var(--accent)',
    cancelado: 'var(--red)',
    invalido: 'var(--red)',
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2>Validación de Tiquetes</h2>
        <p>Escanea el QR o ingresa el código manualmente</p>
      </div>

      <div className={styles.center}>
        <div className={`card ${styles.scanner}`}>

          {/* Tabs: Cámara / Manual */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${modoEscaner ? styles.tabActive : ''}`}
              onClick={() => { setModoEscaner(true); setResultado(null); }}
            >
              <Camera size={16} /> Escanear QR
            </button>
            <button
              className={`${styles.tab} ${!modoEscaner ? styles.tabActive : ''}`}
              onClick={() => setModoEscaner(false)}
            >
              <Keyboard size={16} /> Código manual
            </button>
          </div>

          {/* Vista de cámara */}
          {modoEscaner ? (
            <div className={styles.camaraWrap}>
              <div id="qr-reader" className={styles.qrReader} />
              {!escaneando && !errorCamara && (
                <div className={styles.camaraLoading}>
                  <div className="spinner" style={{ width: 32, height: 32 }} />
                  <p>Iniciando cámara...</p>
                </div>
              )}
              {escaneando && (
                <p className={styles.camaraHint}>
                  <ScanLine size={14} /> Apunta la cámara al código QR del tiquete
                </p>
              )}
              {errorCamara && (
                <div className="error-msg" style={{ marginTop: 12 }}>
                  <CameraOff size={14} style={{ display: 'inline', marginRight: 6 }} />
                  {errorCamara}
                </div>
              )}
              <button className="btn btn-ghost" style={{ marginTop: 12, width: '100%' }} onClick={() => setModoEscaner(false)}>
                Cancelar
              </button>
            </div>
          ) : (
            /* Vista manual */
            <>
              <div className={styles.scanIcon}>
                <ScanLine size={32} color="var(--accent)" />
              </div>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputRow}>
                  <input
                    className={`input ${styles.codigoInput}`}
                    placeholder="Ej: ABC1234XYZ"
                    value={codigo}
                    onChange={e => setCodigo(e.target.value.toUpperCase())}
                    style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'monospace', fontSize: '1.1rem' }}
                    autoFocus
                  />
                  <button className="btn btn-primary" type="submit" disabled={cargando || !codigo.trim()}>
                    {cargando ? <div className="spinner" /> : <><Search size={16} /> Validar</>}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Resultado */}
          {resultado && (
            <div className={styles.resultado}>
              <hr className="divider" />
              <div className={styles.resultIcon}>{iconMap[resultado.estado] || iconMap.invalido}</div>
              <h3 style={{ color: colorMap[resultado.estado], fontSize: '1.3rem' }}>{resultado.mensaje}</h3>

              {resultado.tiquete && (
                <div className={styles.tiqueteInfo}>
                  <div className={styles.infoRow}><span>Código</span><strong style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{resultado.tiquete.codigo}</strong></div>
                  <div className={styles.infoRow}><span>Película</span><strong>{resultado.tiquete.titulo}</strong></div>
                  <div className={styles.infoRow}><span>Función</span><strong>{resultado.tiquete.fecha} — {resultado.tiquete.hora?.slice(0, 5)}</strong></div>
                  <div className={styles.infoRow}><span>Sala</span><strong>{resultado.tiquete.sala}</strong></div>
                  <div className={styles.infoRow}><span>Total</span><strong style={{ color: 'var(--accent)' }}>${Number(resultado.tiquete.total).toLocaleString('es-CO')}</strong></div>
                </div>
              )}

              <button className="btn btn-ghost" onClick={resetear} style={{ marginTop: 8 }}>
                Validar otro tiquete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
