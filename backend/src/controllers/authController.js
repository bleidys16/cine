import pool from '../db/connection.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registrar = async (req, res) => {
  const { nombre, email, contrasena } = req.body;
  if (!nombre || !email || !contrasena)
    return res.status(400).json({ mensaje: 'Todos los campos son requeridos' });

  try {
    const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existe.rows.length > 0)
      return res.status(400).json({ mensaje: 'El email ya está registrado' });

    const hash = await bcrypt.hash(contrasena, 10);
    const { rows } = await pool.query(
      'INSERT INTO usuarios (nombre, email, contrasena, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol',
      [nombre, email, hash, 'cliente']
    );
    const token = jwt.sign({ id: rows[0].id, rol: rows[0].rol }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ usuario: rows[0], token });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error del servidor', error: err.message });
  }
};

export const login = async (req, res) => {
  const { email, contrasena } = req.body;
  if (!email || !contrasena)
    return res.status(400).json({ mensaje: 'Email y contraseña requeridos' });

  try {
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (rows.length === 0)
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });

    const valido = await bcrypt.compare(contrasena, rows[0].contrasena);
    if (!valido)
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });

    const token = jwt.sign({ id: rows[0].id, rol: rows[0].rol }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { contrasena: _, ...usuario } = rows[0];
    res.json({ usuario, token });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error del servidor', error: err.message });
  }
};
