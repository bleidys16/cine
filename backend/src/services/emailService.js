import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'CineApp <onboarding@resend.dev>';
const APP_URL = process.env.FRONTEND_URL || 'https://cine-psi-lilac.vercel.app';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  family: 4, // Fuerza el uso de IPv4 para evitar el error ENETUNREACH en Render
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// ============================================
// EMAIL: Bienvenida al registrarse
// ============================================
export const enviarBienvenida = async ({ nombre, email }) => {
  if (!process.env.RESEND_API_KEY) {
    console.log('⚠️ RESEND_API_KEY no configurada. Simulando envío de bienvenida a', email);
    return { success: true };
  }

  try {
    await transporter.sendMail({
      from: `"CineApp 🎬" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: '🎬 Bienvenido a CineApp',
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
      <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Inter',sans-serif;">
        <div style="max-width:520px;margin:0 auto;padding:40px 20px;">
          <div style="margin-bottom:28px;">
            <span style="font-size:1.1rem;font-weight:800;color:#f0f0f0;letter-spacing:0.02em;">CINE<span style="color:#d4a843;">APP</span></span>
          </div>
          <div style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:36px 32px;">
            <h1 style="color:#f0f0f0;font-size:1.6rem;margin:0 0 10px;font-weight:700;">¡Bienvenido, ${nombre}!</h1>
            <p style="color:#909090;font-size:0.9rem;line-height:1.65;margin:0 0 24px;">Tu cuenta ha sido creada exitosamente. Ya puedes explorar la cartelera, elegir tus asientos y comprar tus tiquetes.</p>
            <div style="margin-bottom:28px;">
              <div style="padding:11px 14px;background:rgba(255,255,255,0.04);border-radius:7px;margin-bottom:6px;font-size:0.86rem;color:#d0d0d0;">🎬 Explora más de 25 películas en cartelera</div>
              <div style="padding:11px 14px;background:rgba(255,255,255,0.04);border-radius:7px;margin-bottom:6px;font-size:0.86rem;color:#d0d0d0;">💺 Selecciona tu asiento en tiempo real</div>
              <div style="padding:11px 14px;background:rgba(255,255,255,0.04);border-radius:7px;font-size:0.86rem;color:#d0d0d0;">🎟️ Recibe tu tiquete con código QR al instante</div>
            </div>
            <a href="${APP_URL}" style="display:block;text-align:center;background:#d4a843;color:#0a0a0a;font-weight:700;font-size:0.9rem;padding:13px 24px;border-radius:8px;text-decoration:none;letter-spacing:0.01em;">Ver cartelera →</a>
          </div>
          <p style="text-align:center;color:#444;font-size:0.74rem;margin-top:20px;">CineApp · SENA CNCA Nodo TIC ADSO17</p>
        </div>
      </body></html>`
    });
    console.log(`✉️  Bienvenida enviada a ${email}`);
    return { success: true };
  } catch (err) {
    console.error('❌ Error enviando bienvenida:', err.message);
    return { error: err.message };
  }
};

// ============================================
// EMAIL: Tiquete con QR al comprar
// ============================================
export const enviarTiquete = async ({ email, nombre, tiquete }) => {
  const { codigo, total, funcion, asientos } = tiquete;
  const asientosStr = asientos?.map(a => `${a.fila}${a.columna}`).join(', ') || '';
  const fechaFormateada = funcion?.fecha
    ? new Date(funcion.fecha + 'T00:00').toLocaleDateString('es-CO', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
    : '';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${codigo}&bgcolor=ffffff&color=080b10&margin=10`;

  try {
    const tituloTicket = `🎟️ Tu tiquete — ${funcion?.titulo || 'CineApp'} · ${codigo}`;
    const htmlTiquete = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
      <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Inter',sans-serif;">
        <div style="max-width:520px;margin:0 auto;padding:40px 20px;">
          <div style="margin-bottom:28px;">
            <span style="font-size:1.1rem;font-weight:800;color:#f0f0f0;letter-spacing:0.02em;">CINE<span style="color:#d4a843;">APP</span></span>
          </div>
          <div style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:36px 32px;">
            
            <p style="color:#909090;font-size:0.82rem;margin:0 0 4px;">Hola ${nombre},</p>
            <h1 style="color:#f0f0f0;font-size:1.4rem;margin:0 0 24px;font-weight:700;">Tu tiquete está listo ✅</h1>

            <!-- QR + Código -->
            <div style="display:flex;align-items:center;gap:20px;background:rgba(255,255,255,0.03);border-radius:10px;padding:20px;margin-bottom:24px;">
              <img src="${qrUrl}" width="100" height="100" alt="QR" style="border-radius:6px;background:#fff;padding:6px;flex-shrink:0;"/>
              <div>
                <p style="color:#555;font-size:0.68rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 6px;">Código de acceso</p>
                <p style="color:#d4a843;font-family:monospace;font-size:1.4rem;font-weight:700;letter-spacing:0.1em;margin:0 0 8px;">${codigo}</p>
                <p style="color:#555;font-size:0.75rem;margin:0;">Presenta este código en la entrada</p>
              </div>
            </div>

            <!-- Detalles -->
            <div style="border-top:1px solid rgba(255,255,255,0.07);padding-top:20px;">
              <h3 style="color:#f0f0f0;font-size:1rem;margin:0 0 14px;font-weight:600;">${funcion?.titulo || ''}</h3>
              ${[
          ['Fecha', fechaFormateada],
          ['Hora', funcion?.hora?.slice(0, 5) || ''],
          ['Sala', funcion?.sala || ''],
          ['Asientos', asientosStr],
        ].map(([l, v]) => `
                <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                  <span style="color:#909090;font-size:0.82rem;">${l}</span>
                  <span style="color:#f0f0f0;font-size:0.82rem;font-weight:500;">${v}</span>
                </div>`).join('')}
              <div style="display:flex;justify-content:space-between;padding:10px 0 0;">
                <span style="color:#909090;font-size:0.82rem;font-weight:600;">Total pagado</span>
                <span style="color:#d4a843;font-size:1rem;font-weight:700;">$${Number(total).toLocaleString('es-CO')}</span>
              </div>
            </div>
          </div>
          <p style="text-align:center;color:#444;font-size:0.74rem;margin-top:20px;">CineApp · SENA CNCA Nodo TIC ADSO17</p>
        </div>
      </body></html>`;

    await sendBrevoEmail(email, tituloTicket, htmlTiquete);
    console.log(`✉️  Tiquete enviado a ${email}`);
    return { success: true };
  } catch (err) {
    console.error('❌ Error enviando tiquete con Brevo:', err.message);
    return { error: err.message };
  }
};
