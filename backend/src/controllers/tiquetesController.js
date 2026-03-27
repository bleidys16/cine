import pool from '../db/connection.js';
import { nanoid } from 'nanoid';
import { enviarTiquete } from '../services/emailService.js';

export const comprar = async (req, res) => {
  const { funcion_id, asientos_ids } = req.body;
  const usuario_id = req.usuario?.id || null;

  if (!funcion_id || !asientos_ids?.length)
    return res.status(400).json({ mensaje: 'Función y asientos requeridos' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: funcRows } = await client.query(
      "SELECT precio FROM funciones WHERE id = $1 AND estado = 'disponible'",
      [funcion_id]
    );
    if (funcRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ mensaje: 'Función no disponible' });
    }

    const { rows: ocupados } = await client.query(
      'SELECT asiento_id FROM asientos_funcion WHERE funcion_id = $1 AND asiento_id = ANY($2::int[])',
      [funcion_id, asientos_ids]
    );
    if (ocupados.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        mensaje: 'Algunos asientos ya están ocupados',
        asientos_ocupados: ocupados.map(r => r.asiento_id)
      });
    }

    const precio = parseFloat(funcRows[0].precio);
    const total = precio * asientos_ids.length;
    const codigo = 'PEND-' + nanoid(5).toUpperCase();

    // Guardar el tiquete con el prefijo PEND- para evitar errores de restricción de base de datos
    const { rows: tiqRows } = await client.query(
      "INSERT INTO tiquetes (codigo, usuario_id, funcion_id, total) VALUES ($1,$2,$3,$4) RETURNING *",
      [codigo, usuario_id, funcion_id, total]
    );
    const tiquete = tiqRows[0];

    for (const asiento_id of asientos_ids) {
      await client.query(
        'INSERT INTO detalle_tiquete (tiquete_id, asiento_id, precio_unitario) VALUES ($1,$2,$3)',
        [tiquete.id, asiento_id, precio]
      );
      await client.query(
        'INSERT INTO asientos_funcion (funcion_id, asiento_id, tiquete_id) VALUES ($1,$2,$3)',
        [funcion_id, asiento_id, tiquete.id]
      );
    }

    await client.query('COMMIT');

    // Obtener detalles completos
    const { rows: detalles } = await pool.query(`
      SELECT a.fila, a.columna, a.numero, dt.precio_unitario
      FROM detalle_tiquete dt
      JOIN asientos a ON a.id = dt.asiento_id
      WHERE dt.tiquete_id = $1
    `, [tiquete.id]);

    const { rows: funcDetalle } = await pool.query(`
      SELECT f.fecha, f.hora, f.sala, p.titulo
      FROM funciones f JOIN peliculas p ON p.id = f.pelicula_id
      WHERE f.id = $1
    `, [funcion_id]);

    const tiqueteCompleto = { ...tiquete, estado: 'pendiente', asientos: detalles, funcion: funcDetalle[0] };

    // NOTA: El correo NO se envía aquí. Se envía cuando el admin lo aprueba en confirmarTiquete.
    res.status(201).json({ tiquete: tiqueteCompleto });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ mensaje: 'Error al procesar compra', error: err.message });
  } finally {
    client.release();
  }
};

export const listarPendientes = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT t.*, u.nombre as usuario_nombre, u.email as usuario_email, p.titulo, f.fecha, f.hora, f.sala,
        json_agg(json_build_object('fila', a.fila, 'columna', a.columna, 'numero', a.numero)) AS asientos
      FROM tiquetes t
      JOIN usuarios u ON u.id = t.usuario_id
      JOIN funciones f ON f.id = t.funcion_id
      JOIN peliculas p ON p.id = f.pelicula_id
      JOIN detalle_tiquete dt ON dt.tiquete_id = t.id
      JOIN asientos a ON a.id = dt.asiento_id
      WHERE t.codigo LIKE 'PEND-%' AND t.estado != 'cancelado'
      GROUP BY t.id, u.nombre, u.email, p.titulo, f.fecha, f.hora, f.sala
      ORDER BY t.fecha_compra ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener pendientes', error: err.message });
  }
};

export const confirmarTiquete = async (req, res) => {
  const { id } = req.params;
  try {
    // Primero obtenemos el tiquete para saber su código actual
    const { rows: tiqPre } = await pool.query("SELECT codigo FROM tiquetes WHERE id=$1", [id]);
    if (tiqPre.length === 0) return res.status(404).json({ mensaje: 'Tiquete no encontrado' });
    
    // Le quitamos el PEND- al código
    const nuevoCodigo = tiqPre[0].codigo.startsWith('PEND-') ? tiqPre[0].codigo.replace('PEND-', '') + nanoid(5).toUpperCase() : tiqPre[0].codigo;
    // Nos aseguramos de que mida 10 caracteres. Si quitamos PEND-, quedan 5. Añadimos 5 randoms al final.

    const { rows: tiqRows } = await pool.query(
      "UPDATE tiquetes SET codigo=$1, estado='activo' WHERE id=$2 RETURNING *", 
      [nuevoCodigo, id]
    );
    const tiquete = tiqRows[0];

    const { rows: detalles } = await pool.query(`
      SELECT a.fila, a.columna, a.numero, dt.precio_unitario
      FROM detalle_tiquete dt
      JOIN asientos a ON a.id = dt.asiento_id
      WHERE dt.tiquete_id = $1
    `, [tiquete.id]);

    const { rows: funcDetalle } = await pool.query(`
      SELECT f.fecha, f.hora, f.sala, p.titulo
      FROM funciones f JOIN peliculas p ON p.id = f.pelicula_id
      WHERE f.id = $1
    `, [tiquete.funcion_id]);

    const { rows: userRows } = await pool.query('SELECT nombre, email FROM usuarios WHERE id = $1', [tiquete.usuario_id]);

    const tiqueteCompleto = { ...tiquete, asientos: detalles, funcion: funcDetalle[0] };

    if (userRows.length > 0) {
      await enviarTiquete({
        email: userRows[0].email,
        nombre: userRows[0].nombre,
        tiquete: tiqueteCompleto
      });
    }

    res.json({ mensaje: 'Tiquete confirmado y correo enviado', tiquete: tiqueteCompleto });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al confirmar', error: err.message });
  }
};

export const rechazarTiquete = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query("UPDATE tiquetes SET estado='cancelado' WHERE id=$1 RETURNING *", [id]);
    if (rows.length === 0) return res.status(404).json({ mensaje: 'Tiquete no encontrado' });
    res.json({ mensaje: 'Tiquete cancelado exitosamente', tiquete: rows[0] });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al cancelar', error: err.message });
  }
};

export const validar = async (req, res) => {
  const { codigo } = req.body;
  if (!codigo) return res.status(400).json({ mensaje: 'Código requerido' });

  try {
    const { rows } = await pool.query(`
      SELECT t.*, f.fecha, f.hora, f.sala, p.titulo
      FROM tiquetes t
      JOIN funciones f ON f.id = t.funcion_id
      JOIN peliculas p ON p.id = f.pelicula_id
      WHERE t.codigo = $1
    `, [codigo.toUpperCase()]);

    if (rows.length === 0)
      return res.status(404).json({ valido: false, estado: 'invalido', mensaje: 'Código no encontrado' });

    const tiquete = rows[0];
    if (tiquete.codigo.startsWith('PEND-'))
      return res.json({ valido: false, estado: 'pendiente', mensaje: 'Tiquete pendiente de confirmación administrativa', tiquete });
    if (tiquete.estado === 'usado')
      return res.json({ valido: false, estado: 'usado', mensaje: 'Tiquete ya fue utilizado', tiquete });
    if (tiquete.estado === 'cancelado')
      return res.json({ valido: false, estado: 'cancelado', mensaje: 'Tiquete cancelado', tiquete });

    await pool.query("UPDATE tiquetes SET estado='usado' WHERE codigo=$1", [codigo.toUpperCase()]);
    res.json({ valido: true, estado: 'valido', mensaje: 'Acceso permitido ✓', tiquete: { ...tiquete, estado: 'usado' } });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al validar tiquete', error: err.message });
  }
};

export const listarMios = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT t.*, p.titulo, f.fecha, f.hora, f.sala,
        json_agg(json_build_object('fila', a.fila, 'columna', a.columna, 'numero', a.numero)) AS asientos
      FROM tiquetes t
      JOIN funciones f ON f.id = t.funcion_id
      JOIN peliculas p ON p.id = f.pelicula_id
      JOIN detalle_tiquete dt ON dt.tiquete_id = t.id
      JOIN asientos a ON a.id = dt.asiento_id
      WHERE t.usuario_id = $1
      GROUP BY t.id, p.titulo, f.fecha, f.hora, f.sala
      ORDER BY t.fecha_compra DESC
    `, [req.usuario.id]);
    res.json(rows.map(t => {
      if (t.codigo.startsWith('PEND-')) t.estado = 'pendiente';
      return t;
    }));
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener tiquetes', error: err.message });
  }
};

export const dashboard = async (req, res) => {
  try {
    const [ventas, ocupacion, populares] = await Promise.all([
      pool.query(`
        SELECT DATE(fecha_compra) as dia, COUNT(*) as cantidad, SUM(total) as total
        FROM tiquetes WHERE estado != 'cancelado' AND codigo NOT LIKE 'PEND-%'
        GROUP BY dia ORDER BY dia DESC LIMIT 7
      `),
      pool.query(`
        SELECT f.id, p.titulo, f.fecha, f.hora,
          COUNT(af.asiento_id) as ocupados,
          150 - COUNT(af.asiento_id) as disponibles,
          ROUND(COUNT(af.asiento_id)::numeric / 150 * 100, 1) as porcentaje
        FROM funciones f
        JOIN peliculas p ON p.id = f.pelicula_id
        LEFT JOIN asientos_funcion af ON af.funcion_id = f.id
        WHERE f.fecha >= CURRENT_DATE
        GROUP BY f.id, p.titulo, f.fecha, f.hora
        ORDER BY f.fecha ASC LIMIT 5
      `),
      pool.query(`
        SELECT p.titulo, COUNT(t.id) as ventas, SUM(t.total) as ingresos
        FROM tiquetes t
        JOIN funciones f ON f.id = t.funcion_id
        JOIN peliculas p ON p.id = f.pelicula_id
        WHERE t.estado != 'cancelado' AND t.codigo NOT LIKE 'PEND-%'
        GROUP BY p.titulo ORDER BY ventas DESC LIMIT 5
      `)
    ]);
    res.json({
      ventas_recientes: ventas.rows,
      ocupacion_funciones: ocupacion.rows,
      peliculas_populares: populares.rows
    });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener dashboard', error: err.message });
  }
};
