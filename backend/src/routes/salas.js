import { Router } from 'express';
import pool from '../db/connection.js';
import { verificarToken, soloAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM salas ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener salas', error: err.message });
  }
});

router.post('/', verificarToken, soloAdmin, async (req, res) => {
  const { nombre, filas, columnas, capacidad_total, estado } = req.body;
  if (!nombre || !filas || !columnas) return res.status(400).json({ mensaje: 'Nombre, filas y columnas son requeridos' });
  try {
    const capacidad = capacidad_total || (filas * columnas);
    const { rows } = await pool.query(
      'INSERT INTO salas (nombre, filas, columnas, capacidad_total, estado) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, filas, columnas, capacidad, estado || 'activa']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear sala', error: err.message });
  }
});

router.put('/:id', verificarToken, soloAdmin, async (req, res) => {
  const { nombre, filas, columnas, capacidad_total, estado } = req.body;
  try {
    const capacidad = capacidad_total || (filas * columnas);
    const { rows } = await pool.query(
      'UPDATE salas SET nombre=$1, filas=$2, columnas=$3, capacidad_total=$4, estado=$5 WHERE id=$6 RETURNING *',
      [nombre, filas, columnas, capacidad, estado, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ mensaje: 'Sala no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar sala', error: err.message });
  }
});

router.delete('/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "UPDATE salas SET estado='inactiva' WHERE id=$1 RETURNING id",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ mensaje: 'Sala no encontrada' });
    res.json({ mensaje: 'Sala inactivada' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al inactivar sala', error: err.message });
  }
});

export default router;
