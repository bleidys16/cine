import { Resend } from 'resend';

const APP_URL = process.env.FRONTEND_URL || 'https://cine-psi-lilac.vercel.app';
const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================
// EMAIL: Bienvenida al registrarse
// ============================================
export const enviarBienvenida = async ({ nombre, email }) => {
  if (!process.env.RESEND_API_KEY) {
    console.log('⚠️ RESEND_API_KEY no configurada. Simulando envío de bienvenida a', email);
    return { success: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'CineApp 🎬 <onboarding@resend.dev>', // Resend usa este remitente por defecto en cuentas gratis
      to: email,
      subject: '🎬 Bienvenido a CineApp',
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
      <body style="margin:0;padding:0;background:#080b10;font-family:'Segoe UI',sans-serif;">
        <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
          <div style="text-align:center;margin-bottom:32px;">
            <div style="display:inline-block;background:#111620;border:1px solid rgba(232,184,75,0.3);border-radius:12px;padding:12px 24px;">
              <span style="font-size:1.4rem;font-weight:900;color:#f0f2f5;letter-spacing:0.1em;">CINE<span style="color:#e8b84b;">APP</span></span>
            </div>
          </div>
          <div style="background:#111620;border:1px solid rgba(255,255,255,0.06);border-radius:20px;padding:40px 32px;">
            <h1 style="color:#f0f2f5;font-size:1.8rem;margin:0 0 8px;font-weight:700;">¡Bienvenido, ${nombre}! 🎉</h1>
            <p style="color:#8892a4;font-size:0.95rem;line-height:1.6;margin:0 0 28px;">Tu cuenta ha sido creada exitosamente. Ya puedes explorar la cartelera, seleccionar tus asientos y comprar tus tiquetes en segundos.</p>
            <div style="margin-bottom:32px;">
              <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:12px 16px;margin-bottom:8px;"><span style="color:#f0f2f5;font-size:0.88rem;">🎬 Explora la cartelera de películas</span></div>
              <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:12px 16px;margin-bottom:8px;"><span style="color:#f0f2f5;font-size:0.88rem;">💺 Elige tus asientos favoritos</span></div>
              <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:12px 16px;margin-bottom:8px;"><span style="color:#f0f2f5;font-size:0.88rem;">🎟️ Recibe tu tiquete con código QR</span></div>
              <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:12px 16px;"><span style="color:#f0f2f5;font-size:0.88rem;">✅ Acceso rápido en la entrada</span></div>
            </div>
            <a href="${APP_URL}" style="display:block;text-align:center;background:#e8b84b;color:#000;font-weight:700;font-size:0.95rem;padding:14px 24px;border-radius:8px;text-decoration:none;">Ver cartelera →</a>
          </div>
          <p style="text-align:center;color:#4a5568;font-size:0.78rem;margin-top:24px;">CineApp — SENA CNCA Nodo TIC ADSO17</p>
        </div>
      </body></html>`
    });

    if (error) {
      console.error('❌ Error de Resend:', error.message);
      return { error: error.message };
    }

    console.log(`✉️  Bienvenida enviada a ${email}`);
    return { success: true };
  } catch (err) {
    console.error('❌ Error enviando bienvenida:', err.message);
    return { error: err.message, stack: err.stack };
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

  if (!process.env.RESEND_API_KEY) {
    console.log('⚠️ RESEND_API_KEY no configurada. Simulando envío de tiquete a', email);
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'CineApp 🎬 <onboarding@resend.dev>',
      to: email,
      subject: `🎟️ Tu tiquete para ${funcion?.titulo || 'la función'} — ${codigo}`,
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
      <body style="margin:0;padding:0;background:#080b10;font-family:'Segoe UI',sans-serif;">
        <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
          <div style="text-align:center;margin-bottom:32px;">
            <div style="display:inline-block;background:#111620;border:1px solid rgba(232,184,75,0.3);border-radius:12px;padding:12px 24px;">
              <span style="font-size:1.4rem;font-weight:900;color:#f0f2f5;letter-spacing:0.1em;">CINE<span style="color:#e8b84b;">APP</span></span>
            </div>
          </div>
          <div style="background:#111620;border:1px solid rgba(255,255,255,0.06);border-radius:20px;padding:40px 32px;">
            <div style="text-align:center;margin-bottom:28px;">
              <div style="font-size:3rem;margin-bottom:8px;">✅</div>
              <h1 style="color:#f0f2f5;font-size:1.6rem;margin:0 0 6px;font-weight:700;">¡Compra exitosa!</h1>
              <p style="color:#8892a4;margin:0;font-size:0.9rem;">Hola ${nombre}, aquí está tu tiquete</p>
            </div>
            <div style="text-align:center;margin-bottom:28px;">
              <div style="display:inline-block;background:#ffffff;border-radius:16px;padding:12px;border:3px solid rgba(232,184,75,0.4);">
                <img src="${qrUrl}" width="180" height="180" alt="QR" style="display:block;border-radius:8px;"/>
              </div>
              <div style="margin-top:12px;background:rgba(232,184,75,0.1);border:1px dashed rgba(232,184,75,0.4);border-radius:10px;padding:12px;">
                <p style="color:#8892a4;font-size:0.68rem;font-weight:700;letter-spacing:0.12em;margin:0 0 4px;">CÓDIGO DE ACCESO</p>
                <p style="color:#e8b84b;font-family:monospace;font-size:1.6rem;font-weight:900;letter-spacing:0.15em;margin:0;">${codigo}</p>
              </div>
            </div>
            <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:20px;margin-bottom:24px;">
              <h3 style="color:#f0f2f5;font-size:1.1rem;margin:0 0 16px;font-weight:700;">${funcion?.titulo || ''}</h3>
              <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);"><span style="color:#8892a4;font-size:0.85rem;">📅 Fecha</span><span style="color:#f0f2f5;font-size:0.85rem;font-weight:600;">${fechaFormateada}</span></div>
              <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);"><span style="color:#8892a4;font-size:0.85rem;">🕐 Hora</span><span style="color:#f0f2f5;font-size:0.85rem;font-weight:600;">${funcion?.hora?.slice(0,5) || ''}</span></div>
              <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);"><span style="color:#8892a4;font-size:0.85rem;">📍 Sala</span><span style="color:#f0f2f5;font-size:0.85rem;font-weight:600;">${funcion?.sala || ''}</span></div>
              <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);"><span style="color:#8892a4;font-size:0.85rem;">💺 Asientos</span><span style="color:#f0f2f5;font-size:0.85rem;font-weight:600;">${asientosStr}</span></div>
              <div style="display:flex;justify-content:space-between;padding:8px 0;"><span style="color:#8892a4;font-size:0.85rem;">💰 Total</span><span style="color:#e8b84b;font-size:0.85rem;font-weight:700;">$${Number(total).toLocaleString('es-CO')}</span></div>
            </div>
            <p style="color:#4a5568;font-size:0.82rem;text-align:center;margin:0;">Presenta este QR o el código en la entrada del cine.<br/>No compartas este código con nadie.</p>
          </div>
          <p style="text-align:center;color:#4a5568;font-size:0.78rem;margin-top:24px;">CineApp — SENA CNCA Nodo TIC ADSO17</p>
        </div>
      </body></html>`
    });

    if (error) {
      console.error('❌ Error de Resend en tiquete:', error.message);
      return;
    }

    console.log(`✉️  Tiquete enviado a ${email}`);
  } catch (err) {
    console.error('❌ Error catch enviando tiquete:', err.message);
  }
};