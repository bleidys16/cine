import pool from '../db/connection.js';

export const listar = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT f.*, p.titulo, p.imagen_url, p.genero, p.clasificacion, p.duracion,
        COUNT(DISTINCT af.asiento_id) AS asientos_ocupados,
        150 - COUNT(DISTINCT af.asiento_id) AS asientos_disponibles
      FROM funciones f
      JOIN peliculas p ON f.pelicula_id = p.id
      LEFT JOIN asientos_funcion af ON af.funcion_id = f.id
      WHERE f.estado IN ('disponible', 'preventa') AND f.fecha >= CURRENT_DATE
      GROUP BY f.id, p.titulo, p.imagen_url, p.genero, p.clasificacion, p.duracion
      ORDER BY f.fecha ASC, f.hora ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener funciones', error: err.message });
  }
};

export const listarPorPelicula = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT f.*,
        COUNT(DISTINCT af.asiento_id) AS asientos_ocupados,
        150 - COUNT(DISTINCT af.asiento_id) AS asientos_disponibles
      FROM funciones f
      LEFT JOIN asientos_funcion af ON af.funcion_id = f.id
      WHERE f.pelicula_id = $1 AND f.estado IN ('disponible', 'preventa') AND f.fecha >= CURRENT_DATE
      GROUP BY f.id
      ORDER BY f.fecha ASC, f.hora ASC
    `, [req.params.peliculaId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener funciones', error: err.message });
  }
};

export const obtenerAsientos = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT a.*,
        CASE WHEN af.asiento_id IS NOT NULL THEN 'ocupado' ELSE 'disponible' END AS estado_funcion
      FROM asientos a
      LEFT JOIN asientos_funcion af ON af.asiento_id = a.id AND af.funcion_id = $1
      WHERE a.estado = 'activo'
      ORDER BY a.fila ASC, a.columna ASC
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener asientos', error: err.message });
  }
};

export const crear = async (req, res) => {
  const { pelicula_id, fecha, hora, sala, precio, estado } = req.body;
  if (!pelicula_id || !fecha || !hora || !precio)
    return res.status(400).json({ mensaje: 'Todos los campos son requeridos' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO funciones (pelicula_id, fecha, hora, sala, precio, estado) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [pelicula_id, fecha, hora, sala || 'Sala 1', precio, estado || 'disponible']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear función', error: err.message });
  }
};

export const actualizar = async (req, res) => {
  const { pelicula_id, fecha, hora, sala, precio, estado } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE funciones SET pelicula_id=$1, fecha=$2, hora=$3, sala=$4, precio=$5, estado=$6 WHERE id=$7 RETURNING *',
      [pelicula_id, fecha, hora, sala, precio, estado, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ mensaje: 'Función no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar función', error: err.message });
  }
};
