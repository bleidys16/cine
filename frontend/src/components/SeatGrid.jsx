import styles from './SeatGrid.module.css';

export default function SeatGrid({ asientos, seleccionados, onToggle }) {
  const filas = [...new Set(asientos.map(a => a.fila))].sort();

  const getEstado = (asiento) => {
    if (asiento.estado_funcion === 'ocupado') return 'ocupado';
    if (seleccionados.includes(asiento.id)) return 'seleccionado';
    return 'disponible';
  };

  return (
    <div className={styles.wrap}>
      {/* Pantalla */}
      <div className={styles.pantalla}>
        <div className={styles.pantallaBar} />
        <span>PANTALLA</span>
      </div>

      {/* Leyenda */}
      <div className={styles.leyenda}>
        <div className={styles.leyendaItem}><span className={`${styles.dot} ${styles.dotDisp}`} />Disponible</div>
        <div className={styles.leyendaItem}><span className={`${styles.dot} ${styles.dotSel}`} />Seleccionado</div>
        <div className={styles.leyendaItem}><span className={`${styles.dot} ${styles.dotOcup}`} />Ocupado</div>
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {filas.map(fila => (
          <div key={fila} className={styles.row}>
            <span className={styles.filaLabel}>{fila}</span>
            <div className={styles.seats}>
              {asientos
                .filter(a => a.fila === fila)
                .sort((a, b) => a.columna - b.columna)
                .map(asiento => {
                  const estado = getEstado(asiento);
                  return (
                    <button
                      key={asiento.id}
                      title={`${asiento.fila}${asiento.columna}`}
                      disabled={estado === 'ocupado'}
                      className={`${styles.seat} ${styles[estado]}`}
                      onClick={() => onToggle(asiento.id)}
                    >
                      <span className={styles.seatNum}>{asiento.columna}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
