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
      {/* Pantalla curva */}
      <div className={styles.pantallaCurva}>
        <div className={styles.pantallaArco} />
        <span className={styles.pantallaTexto}>Pantalla</span>
      </div>

      {/* Leyenda */}
      <div className={styles.leyenda}>
        <div className={styles.leyendaItem}>
          <div className={`${styles.seat} ${styles.disponible}`} style={{ pointerEvents: 'none', transform: 'scale(0.6)' }}><span className={styles.seatNum}>1</span></div>
          Disponible
        </div>
        <div className={styles.leyendaItem}>
          <div className={`${styles.seat} ${styles.seleccionado}`} style={{ pointerEvents: 'none', transform: 'scale(0.6)' }}><span className={styles.seatNum}>1</span></div>
          Seleccionado
        </div>
        <div className={styles.leyendaItem}>
          <div className={`${styles.seat} ${styles.ocupado}`} style={{ pointerEvents: 'none', transform: 'scale(0.6)' }}></div>
          Ocupado
        </div>
      </div>

      {/* Grid con perspectiva */}
      <div className={styles.gridContainer}>
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
    </div>
  );
}
