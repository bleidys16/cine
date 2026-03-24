import pool from '../db/connection.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { enviarBienvenida } from '../services/emailService.js';

export const registrar = async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password)
    return res.status(400).json({ mensaje: 'Todos los campos son requeridos' });

  try {
    const { rows: existe } = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );
    if (existe.length > 0)
      return res.status(409).json({ mensaje: 'El email ya está registrado' });

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO usuarios (nombre, email, contrasena) VALUES ($1, $2, $3) RETURNING id, nombre, email, rol',
      [nombre, email, hash]
    );
    const usuario = rows[0];

    // ✅ Email en segundo plano — si falla no rompe el registro
    enviarBienvenida({ nombre: usuario.nombre, email: usuario.email }).catch(err =>
      console.error('Error email bienvenida:', err.message)
    );

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, usuario });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al registrar', error: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ mensaje: 'Email y contraseña requeridos' });

  try {
    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );
    if (rows.length === 0)
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });

    const usuario = rows[0];
    const valido = await bcrypt.compare(password, usuario.contrasena);
    if (!valido)
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
    });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: err.message });
  }
};