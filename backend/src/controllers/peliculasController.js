import pool from '../db/connection.js';

export const listar = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM peliculas WHERE estado = 'activa' ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener películas', error: err.message });
  }
};

export const listarTodas = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM peliculas ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener películas', error: err.message });
  }
};

export const obtener = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM peliculas WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ mensaje: 'Película no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener película', error: err.message });
  }
};

export const crear = async (req, res) => {
  const { titulo, descripcion, duracion, genero, clasificacion, imagen_url, trailer_url } = req.body;
  if (!titulo || !duracion) return res.status(400).json({ mensaje: 'Título y duración son requeridos' });

  try {
    const { rows } = await pool.query(
      'INSERT INTO peliculas (titulo, descripcion, duracion, genero, clasificacion, imagen_url, trailer_url) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [titulo, descripcion, duracion, genero, clasificacion, imagen_url, trailer_url]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear película', error: err.message });
  }
};

export const actualizar = async (req, res) => {
  const { titulo, descripcion, duracion, genero, clasificacion, imagen_url, trailer_url, estado } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE peliculas SET titulo=$1, descripcion=$2, duracion=$3, genero=$4, clasificacion=$5, imagen_url=$6, trailer_url=$7, estado=$8 WHERE id=$9 RETURNING *',
      [titulo, descripcion, duracion, genero, clasificacion, imagen_url, trailer_url, estado, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ mensaje: 'Película no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar película', error: err.message });
  }
};

export const eliminar = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "UPDATE peliculas SET estado='inactiva' WHERE id=$1 RETURNING id",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ mensaje: 'Película no encontrada' });
    res.json({ mensaje: 'Película desactivada exitosamente' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar película', error: err.message });
  }
};
