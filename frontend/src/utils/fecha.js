/**
 * Formatea una fecha de forma segura sin "Invalid Date"
 * Acepta strings como "2026-03-22", objetos Date, o timestamps
 */
export const formatFecha = (fecha, opciones = {}) => {
  if (!fecha) return '';
  try {
    // Si ya es string tipo "2026-03-22", lo usamos directamente
    const str = typeof fecha === 'string' ? fecha.slice(0, 10) : new Date(fecha).toISOString().slice(0, 10);
    const [year, month, day] = str.split('-').map(Number);
    const date = new Date(year, month - 1, day); // evita problemas de timezone
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...opciones
    });
  } catch {
    return '';
  }
};

export const formatHora = (hora) => {
  if (!hora) return '';
  return hora.slice(0, 5);
};
