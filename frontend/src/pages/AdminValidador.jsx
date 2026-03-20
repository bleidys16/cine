import { useState } from 'react';
import { ScanLine, CheckCircle2, XCircle, AlertCircle, Search } from 'lucide-react';
import api from '../services/api';
import styles from './AdminValidador.module.css';

export default function AdminValidador() {
  const [codigo, setCodigo] = useState('');
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);

  const validar = async (e) => {
    e.preventDefault();
    if (!codigo.trim()) return;
    setCargando(true);
    setResultado(null);
    try {
      const { data } = await api.post('/tiquetes/validar', { codigo: codigo.trim() });
      setResultado(data);
    } catch (err) {
      setResultado(err.response?.data || { valido: false, estado: 'invalido', mensaje: 'Error de red' });
    } finally {
      setCargando(false);
    }
  };

  const resetear = () => { setCodigo(''); setResultado(null); };

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
        <p>Ingresa o escanea el código del tiquete para validar el acceso</p>
      </div>

      <div className={styles.center}>
        <div className={`card ${styles.scanner}`}>
          <div className={styles.scanIcon}>
            <ScanLine size={32} color="var(--accent)" />
          </div>
          <form onSubmit={validar} className={styles.form}>
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

          {resultado && (
            <div className={styles.resultado}>
              <hr className="divider" />
              <div className={styles.resultIcon}>{iconMap[resultado.estado] || iconMap.invalido}</div>
              <h3 style={{ color: colorMap[resultado.estado], fontSize: '1.3rem' }}>{resultado.mensaje}</h3>

              {resultado.tiquete && (
                <div className={styles.tiqueteInfo}>
                  <div className={styles.infoRow}><span>Código</span><strong style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{resultado.tiquete.codigo}</strong></div>
                  <div className={styles.infoRow}><span>Película</span><strong>{resultado.tiquete.titulo}</strong></div>
                  <div className={styles.infoRow}><span>Función</span><strong>{resultado.tiquete.fecha} — {resultado.tiquete.hora?.slice(0,5)}</strong></div>
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
