import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'CineApp <noreply@cineapp.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@cine.com';

// ─── Plantilla base HTML ───────────────────────────────────────────
const baseTemplate = (contenido) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>CineApp</title>
</head>
<body style="margin:0;padding:0;background:#080b10;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080b10;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111620;border-radius:16px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;max-width:100%;">
        
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#111620,#0d1117);padding:28px 36px;border-bottom:1px solid rgba(232,184,75,0.2);">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="display:inline-block;background:rgba(232,184,75,0.15);border:1px solid rgba(232,184,75,0.3);border-radius:8px;padding:8px 12px;margin-bottom:12px;">
                    <span style="color:#e8b84b;font-size:18px;">🎬</span>
                  </span>
                  <div style="font-size:20px;font-weight:700;color:#f0f2f5;letter-spacing:0.05em;">
                    CINE<span style="color:#e8b84b;">APP</span>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Contenido -->
        <tr>
          <td style="padding:36px;">
            ${contenido}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 36px;border-top:1px solid rgba(255,255,255,0.06);background:rgba(0,0,0,0.2);">
            <p style="margin:0;font-size:12px;color:#4a5568;text-align:center;">
              CineApp — SENA CNCA Nodo TIC ADSO17<br/>
              Este es un correo automático, por favor no respondas.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ─── 1. Correo de bienvenida ───────────────────────────────────────
export const enviarBienvenida = async (nombre, email) => {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: '¡Bienvenido a CineApp! 🎬',
      html: baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:26px;color:#f0f2f5;">¡Hola, ${nombre}! 👋</h1>
        <p style="color:#8892a4;font-size:15px;line-height:1.6;margin:0 0 24px;">
          Tu cuenta ha sido creada exitosamente. Ya puedes explorar la cartelera, 
          seleccionar tus asientos y comprar tus tiquetes.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(232,184,75,0.06);border:1px solid rgba(232,184,75,0.2);border-radius:12px;padding:20px;margin-bottom:24px;">
          <tr>
            <td style="padding:8px 0;">
              <span style="color:#e8b84b;font-size:16px;">🎭</span>
              <span style="color:#f0f2f5;font-size:14px;margin-left:8px;">Explora la cartelera completa</span>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;">
              <span style="color:#e8b84b;font-size:16px;">💺</span>
              <span style="color:#f0f2f5;font-size:14px;margin-left:8px;">Elige tus asientos en el mapa de la sala</span>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;">
              <span style="color:#e8b84b;font-size:16px;">🎟️</span>
              <span style="color:#f0f2f5;font-size:14px;margin-left:8px;">Recibe tu tiquete con código QR al instante</span>
            </td>
          </tr>
        </table>

        <a href="${process.env.FRONTEND_URL || 'https://cine-psi-lilac.vercel.app'}" 
           style="display:inline-block;background:#e8b84b;color:#000;font-weight:700;font-size:15px;padding:14px 28px;border-radius:8px;text-decoration:none;">
          Ver cartelera →
        </a>
      `)
    });
  } catch (err) {
    console.error('Error enviando bienvenida:', err.message);
  }
};

// ─── 2. Correo de tiquete con QR ──────────────────────────────────
export const enviarTiquete = async ({ email, nombre, tiquete }) => {
  if (!process.env.RESEND_API_KEY) return;
  const asientos = tiquete.asientos?.map(a => `${a.fila}${a.columna}`).join(', ') || '';
  const fecha = tiquete.funcion?.fecha
    ? new Date(tiquete.funcion.fecha + 'T00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `🎟️ Tu tiquete para ${tiquete.funcion?.titulo} — ${tiquete.codigo}`,
      html: baseTemplate(`
        <h1 style="margin:0 0 6px;font-size:24px;color:#f0f2f5;">¡Compra exitosa! ✅</h1>
        <p style="color:#8892a4;font-size:14px;margin:0 0 28px;">Hola ${nombre}, aquí está tu tiquete.</p>

        <!-- Código QR placeholder -->
        <div style="text-align:center;margin-bottom:28px;">
          <div style="display:inline-block;background:#fff;border-radius:12px;padding:16px;border:3px solid rgba(232,184,75,0.4);">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${tiquete.codigo}&bgcolor=ffffff&color=080b10" 
                 alt="QR ${tiquete.codigo}" width="180" height="180" style="display:block;border-radius:4px;"/>
          </div>
          <p style="color:#8892a4;font-size:12px;margin:8px 0 0;">Presenta este QR en la entrada</p>
        </div>

        <!-- Código texto -->
        <div style="background:rgba(0,0,0,0.3);border:1px dashed rgba(232,184,75,0.4);border-radius:10px;padding:16px;text-align:center;margin-bottom:24px;">
          <p style="margin:0 0 4px;font-size:11px;color:#4a5568;letter-spacing:0.1em;text-transform:uppercase;">Código de acceso</p>
          <p style="margin:0;font-size:28px;font-weight:900;color:#e8b84b;letter-spacing:0.15em;font-family:monospace;">${tiquete.codigo}</p>
        </div>

        <!-- Detalles -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          ${[
            ['🎬 Película', tiquete.funcion?.titulo],
            ['📅 Fecha', fecha],
            ['🕐 Hora', tiquete.funcion?.hora?.slice(0,5)],
            ['🏛️ Sala', tiquete.funcion?.sala],
            ['💺 Asientos', asientos],
            ['💰 Total pagado', `$${Number(tiquete.total).toLocaleString('es-CO')}`],
          ].map(([label, value]) => `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
              <td style="padding:10px 0;color:#8892a4;font-size:13px;">${label}</td>
              <td style="padding:10px 0;color:#f0f2f5;font-size:13px;font-weight:600;text-align:right;">${value || '—'}</td>
            </tr>
          `).join('')}
        </table>

        <p style="margin:24px 0 0;font-size:12px;color:#4a5568;text-align:center;">
          Llega 15 minutos antes de la función 🍿
        </p>
      `)
    });
  } catch (err) {
    console.error('Error enviando tiquete:', err.message);
  }
};

// ─── 3. Notificación al admin de nueva venta ──────────────────────
export const notificarAdminVenta = async ({ tiquete, nombreCliente }) => {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `💰 Nueva venta — ${tiquete.codigo} — $${Number(tiquete.total).toLocaleString('es-CO')}`,
      html: baseTemplate(`
        <h1 style="margin:0 0 6px;font-size:22px;color:#f0f2f5;">Nueva venta registrada 💰</h1>
        <p style="color:#8892a4;font-size:14px;margin:0 0 24px;">Se acaba de procesar una compra en CineApp.</p>

        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          ${[
            ['👤 Cliente', nombreCliente],
            ['🎬 Película', tiquete.funcion?.titulo],
            ['📅 Función', `${tiquete.funcion?.fecha} — ${tiquete.funcion?.hora?.slice(0,5)}`],
            ['🎟️ Código', tiquete.codigo],
            ['💺 Asientos', tiquete.asientos?.map(a => `${a.fila}${a.columna}`).join(', ')],
            ['💰 Total', `$${Number(tiquete.total).toLocaleString('es-CO')}`],
          ].map(([label, value]) => `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
              <td style="padding:10px 0;color:#8892a4;font-size:13px;">${label}</td>
              <td style="padding:10px 0;color:#f0f2f5;font-size:13px;font-weight:600;text-align:right;">${value || '—'}</td>
            </tr>
          `).join('')}
        </table>

        <div style="margin-top:24px;text-align:center;">
          <a href="${process.env.FRONTEND_URL || 'https://cine-psi-lilac.vercel.app'}/admin" 
             style="display:inline-block;background:rgba(232,184,75,0.15);color:#e8b84b;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;border:1px solid rgba(232,184,75,0.3);">
            Ver en el panel admin →
          </a>
        </div>
      `)
    });
  } catch (err) {
    console.error('Error notificando admin:', err.message);
  }
};
