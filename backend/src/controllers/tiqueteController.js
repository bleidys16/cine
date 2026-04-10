import pool from '../db/connection.js';
import { nanoid } from 'nanoid';
import { enviarTiquete, enviarConfirmacionEntrada } from '../services/emailService.js';

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

    const { rows: detalles } = await pool.query(`
      SELECT a.fila, a.columna, a.numero, dt.precio_unitario
      FROM detalle_tiquete dt
      JOIN asientos a ON a.id = dt.asiento_id
      WHERE dt.tiquete_id = $1
    `, [tiquete.id]);

    const { rows: funcDetalle } = await pool.query(`
      SELECT f.fecha, f.hora, p.titulo, s.nombre as sala
      FROM funciones f
      JOIN peliculas p ON p.id = f.pelicula_id
      LEFT JOIN salas s ON s.id = f.sala_id
      WHERE f.id = $1
    `, [funcion_id]);

    const tiqueteCompleto = { ...tiquete, estado: 'pendiente', asientos: detalles, funcion: funcDetalle[0] };
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
      SELECT t.*, u.nombre as usuario_nombre, u.email as usuario_email, p.titulo, f.fecha, f.hora,
        json_agg(json_build_object('fila', a.fila, 'columna', a.columna, 'numero', a.numero)) AS asientos
      FROM tiquetes t
      JOIN usuarios u ON u.id = t.usuario_id
      JOIN funciones f ON f.id = t.funcion_id
      JOIN peliculas p ON p.id = f.pelicula_id
      JOIN detalle_tiquete dt ON dt.tiquete_id = t.id
      JOIN asientos a ON a.id = dt.asiento_id
      WHERE t.codigo LIKE 'PEND-%' AND t.estado != 'cancelado'
      GROUP BY t.id, u.nombre, u.email, p.titulo, f.fecha, f.hora
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
    const { rows: tiqPre } = await pool.query("SELECT codigo FROM tiquetes WHERE id=$1", [id]);
    if (tiqPre.length === 0) return res.status(404).json({ mensaje: 'Tiquete no encontrado' });

    const nuevoCodigo = tiqPre[0].codigo.startsWith('PEND-')
      ? tiqPre[0].codigo.replace('PEND-', '') + nanoid(5).toUpperCase()
      : tiqPre[0].codigo;

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
      SELECT f.fecha, f.hora, p.titulo, s.nombre as sala
      FROM funciones f
      JOIN peliculas p ON p.id = f.pelicula_id
      LEFT JOIN salas s ON s.id = f.sala_id
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

// ─────────────────────────────────────────────────────────────────────────────
// VALIDAR — ventana: desde 15 min ANTES hasta 10 min DESPUÉS del inicio
// Si el tiquete no fue usado y la función ya terminó → expirado
// Al validar exitosamente → envía email de confirmación de entrada
// ─────────────────────────────────────────────────────────────────────────────
export const validar = async (req, res) => {
  const { codigo } = req.body;
  if (!codigo) return res.status(400).json({ mensaje: 'Código requerido' });

  try {
    const { rows } = await pool.query(`
      SELECT t.*,
        f.fecha, f.hora, f.pelicula_id,
        p.titulo, p.duracion,
        s.nombre as sala,
        u.nombre as usuario_nombre, u.email as usuario_email,
        (f.fecha::date + f.hora::time) AS fecha_hora_inicio,
        (f.fecha::date + f.hora::time + (p.duracion || ' minutes')::interval) AS fecha_hora_fin
      FROM tiquetes t
      JOIN funciones f ON f.id = t.funcion_id
      JOIN peliculas p ON p.id = f.pelicula_id
      LEFT JOIN salas s ON s.id = f.sala_id
      LEFT JOIN usuarios u ON u.id = t.usuario_id
      WHERE t.codigo = $1
    `, [codigo.toUpperCase()]);

    if (rows.length === 0)
      return res.status(404).json({ valido: false, estado: 'invalido', mensaje: 'Código no encontrado' });

    const tiquete = rows[0];

    // Estado pendiente
    if (tiquete.codigo.startsWith('PEND-'))
      return res.json({ valido: false, estado: 'pendiente', mensaje: 'Tiquete pendiente de confirmación administrativa', tiquete });

    // Ya usado
    if (tiquete.estado === 'usado')
      return res.json({ valido: false, estado: 'usado', mensaje: 'Este tiquete ya fue utilizado', tiquete });

    // Cancelado
    if (tiquete.estado === 'cancelado')
      return res.json({ valido: false, estado: 'cancelado', mensaje: 'Tiquete cancelado', tiquete });

    // ── Validación de ventana de tiempo ──────────────────────────────────────
    const ahora = new Date();
    const inicio = new Date(tiquete.fecha_hora_inicio);
    const fin = new Date(tiquete.fecha_hora_fin);

    // Minutos desde el inicio (positivo = aún no ha comenzado, negativo = ya comenzó)
    const minDesdeInicio = (ahora - inicio) / (1000 * 60);
    // Minutos desde el fin (positivo = ya terminó)
    const minDesdeFin = (ahora - fin) / (1000 * 60);

    // Demasiado temprano: más de 15 min antes del inicio
    if (minDesdeInicio < -15) {
      const minutosRestantes = Math.ceil(-minDesdeInicio - 15);
      return res.json({
        valido: false,
        estado: 'muy_temprano',
        mensaje: `Aún no puedes ingresar. Faltan ${minutosRestantes} minuto${minutosRestantes !== 1 ? 's' : ''} para que abra el acceso.`,
        tiquete
      });
    }

    // Ya terminó la película y el tiquete no fue usado → expirado
    if (minDesdeFin > 0) {
      return res.json({
        valido: false,
        estado: 'expirado',
        mensaje: 'La función ya terminó. Este tiquete ha expirado.',
        tiquete
      });
    }

    // Pasaron más de 10 min desde el inicio → expirado (no dejaron entrar a tiempo)
    if (minDesdeInicio > 10) {
      return res.json({
        valido: false,
        estado: 'expirado',
        mensaje: 'El tiempo de acceso ha vencido. La función comenzó hace más de 10 minutos.',
        tiquete
      });
    }

    // ── Todo OK → marcar como usado y enviar email de entrada ────────────────
    await pool.query("UPDATE tiquetes SET estado='usado' WHERE codigo=$1", [codigo.toUpperCase()]);

    // Obtener asientos para el email
    const { rows: asientos } = await pool.query(`
      SELECT a.fila, a.columna, a.numero
      FROM detalle_tiquete dt
      JOIN asientos a ON a.id = dt.asiento_id
      WHERE dt.tiquete_id = $1
    `, [tiquete.id]);

    // Enviar email de confirmación de entrada (no bloqueante)
    if (tiquete.usuario_email) {
      enviarConfirmacionEntrada({
        email: tiquete.usuario_email,
        nombre: tiquete.usuario_nombre || 'Cinéfilo',
        tiquete: { ...tiquete, estado: 'usado', asientos }
      }).catch(err => console.error('❌ Error enviando email de entrada:', err.message));
    }

    res.json({
      valido: true,
      estado: 'valido',
      mensaje: '¡Acceso permitido! Disfruta la película.',
      tiquete: { ...tiquete, estado: 'usado', asientos }
    });

  } catch (err) {
    res.status(500).json({ mensaje: 'Error al validar tiquete', error: err.message });
  }
};

export const listarMios = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT t.*, p.titulo, f.fecha, f.hora, s.nombre AS sala,
        json_agg(json_build_object('fila', a.fila, 'columna', a.columna, 'numero', a.numero)) AS asientos
      FROM tiquetes t
      JOIN funciones f ON f.id = t.funcion_id
      JOIN peliculas p ON p.id = f.pelicula_id
      LEFT JOIN salas s ON s.id = f.sala_id
      JOIN detalle_tiquete dt ON dt.tiquete_id = t.id
      JOIN asientos a ON a.id = dt.asiento_id
      WHERE t.usuario_id = $1
      GROUP BY t.id, p.titulo, f.fecha, f.hora, s.nombre
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

export const obtenerPerfilCliente = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const { rows: usuarioRows } = await pool.query(
      'SELECT id, nombre, email FROM usuarios WHERE id = $1',
      [usuarioId]
    );

    if (usuarioRows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const { rows: tiquetesRows } = await pool.query(`
      SELECT
        t.id,
        t.codigo,
        t.total,
        t.estado AS estado_original,
        t.fecha_compra,
        p.titulo,
        f.fecha,
        f.hora,
        s.nombre AS sala,
        CASE
          WHEN t.codigo LIKE 'PEND-%' THEN 'pendiente'
          WHEN t.estado IN ('cancelado', 'usado') THEN 'expirado'
          WHEN (f.fecha::date + f.hora::time + (p.duracion || ' minutes')::interval) < NOW() THEN 'expirado'
          ELSE 'activo'
        END AS estado,
        json_agg(json_build_object('fila', a.fila, 'columna', a.columna, 'numero', a.numero)) AS asientos
      FROM tiquetes t
      JOIN funciones f ON f.id = t.funcion_id
      JOIN peliculas p ON p.id = f.pelicula_id
      LEFT JOIN salas s ON s.id = f.sala_id
      JOIN detalle_tiquete dt ON dt.tiquete_id = t.id
      JOIN asientos a ON a.id = dt.asiento_id
      WHERE t.usuario_id = $1
      GROUP BY t.id, p.titulo, f.fecha, f.hora, s.nombre, p.duracion
      ORDER BY t.fecha_compra DESC
    `, [usuarioId]);

    res.json({ usuario: usuarioRows[0], tiquetes: tiquetesRows });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener perfil del cliente', error: err.message });
  }
};

export const limpiarHistorialCliente = async (req, res) => {
  const usuarioId = req.usuario.id;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows: idsRows } = await client.query(
      'SELECT id FROM tiquetes WHERE usuario_id = $1',
      [usuarioId]
    );

    const ids = idsRows.map((row) => row.id);

    if (ids.length === 0) {
      await client.query('COMMIT');
      return res.json({ mensaje: 'No hay tiquetes para eliminar', eliminados: 0 });
    }

    await client.query(
      'DELETE FROM asientos_funcion WHERE tiquete_id = ANY($1::int[])',
      [ids]
    );

    await client.query('DELETE FROM tiquetes WHERE id = ANY($1::int[])', [ids]);

    await client.query('COMMIT');
    res.json({ mensaje: 'Historial eliminado exitosamente', eliminados: ids.length });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ mensaje: 'Error al limpiar historial', error: err.message });
  } finally {
    client.release();
  }
};

export const dashboard = async (req, res) => {
  try {
    const [ventas, ocupacion, populares, ingresosSalas] = await Promise.all([
      pool.query(`
        SELECT DATE(fecha_compra) as dia, COUNT(*) as cantidad, SUM(total) as total
        FROM tiquetes WHERE estado != 'cancelado' AND codigo NOT LIKE 'PEND-%'
        GROUP BY dia ORDER BY dia DESC LIMIT 7
      `),
      pool.query(`
        SELECT f.id, p.titulo, f.fecha, f.hora,
          s.nombre as sala,
          COUNT(af.asiento_id) as ocupados,
          s.capacidad_total - COUNT(af.asiento_id) as disponibles,
          ROUND(COUNT(af.asiento_id)::numeric / NULLIF(s.capacidad_total, 0) * 100, 1) as porcentaje
        FROM funciones f
        JOIN peliculas p ON p.id = f.pelicula_id
        LEFT JOIN salas s ON s.id = f.sala_id
        LEFT JOIN asientos_funcion af ON af.funcion_id = f.id
        WHERE f.fecha >= CURRENT_DATE
        GROUP BY f.id, p.titulo, f.fecha, f.hora, s.nombre, s.capacidad_total
        ORDER BY f.fecha ASC LIMIT 5
      `),
      pool.query(`
        SELECT p.titulo, COUNT(t.id) as ventas, SUM(t.total) as ingresos
        FROM tiquetes t
        JOIN funciones f ON f.id = t.funcion_id
        JOIN peliculas p ON p.id = f.pelicula_id
        WHERE t.estado != 'cancelado' AND t.codigo NOT LIKE 'PEND-%'
        GROUP BY p.titulo ORDER BY ingresos DESC LIMIT 5
      `),
      pool.query(`
        SELECT
          COALESCE(s.nombre, 'Sin sala') as sala,
          COUNT(DISTINCT t.id) as tiquetes,
          SUM(t.total) as ingresos,
          COUNT(DISTINCT f.id) as funciones_realizadas
        FROM tiquetes t
        JOIN funciones f ON f.id = t.funcion_id
        LEFT JOIN salas s ON s.id = f.sala_id
        WHERE t.estado != 'cancelado' AND t.codigo NOT LIKE 'PEND-%'
        GROUP BY s.nombre ORDER BY ingresos DESC
      `)
    ]);

    res.json({
      ventas_recientes: ventas.rows,
      ocupacion_funciones: ocupacion.rows,
      peliculas_populares: populares.rows,
      ingresos_salas: ingresosSalas.rows
    });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener dashboard', error: err.message });
  }
};

export const resetDashboard = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM asientos_funcion');
    await client.query('DELETE FROM detalle_tiquete');
    await client.query('DELETE FROM tiquetes');
    await client.query('COMMIT');
    res.json({ mensaje: 'Estadísticas y tiquetes reiniciados exitosamente' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ mensaje: 'Error al reiniciar dashboard', error: err.message });
  } finally {
    client.release();
  }
};