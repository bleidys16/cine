const APP_URL = process.env.FRONTEND_URL || 'https://cine-psi-lilac.vercel.app';
const SENDER_EMAIL = process.env.GMAIL_USER || 'lariosbleidys@gmail.com';

const sendBrevoEmail = async (toEmail, subject, htmlContent) => {
  if (!process.env.BREVO_API_KEY) {
    console.log(`⚠️ BREVO_API_KEY no configurada. Simulando envío a ${toEmail}`);
    return { success: true };
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: 'CineApp', email: SENDER_EMAIL },
      to: [{ email: toEmail }],
      subject: subject,
      htmlContent: htmlContent
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Brevo HTTP Error: ${response.status} - ${err}`);
  }
  return await response.json();
};

// ============================================
// EMAIL: Bienvenida al registrarse
// ============================================
export const enviarBienvenida = async ({ nombre, email }) => {
  try {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
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
            <a href="${APP_URL}" style="display:block;text-align:center;background:#d4a843;color:#0a0a0a;font-weight:700;font-size:0.9rem;padding:13px 24px;border-radius:8px;text-decoration:none;">Ver cartelera →</a>
          </div>
          <p style="text-align:center;color:#444;font-size:0.74rem;margin-top:20px;">CineApp · SENA CNCA Nodo TIC ADSO17</p>
        </div>
      </body></html>`;

    await sendBrevoEmail(email, '🎬 Bienvenido a CineApp', html);
    console.log(`✉️  Bienvenida enviada a ${email}`);
    return { success: true };
  } catch (err) {
    console.error('❌ Error enviando bienvenida:', err.message);
    return { error: err.message };
  }
};

// ============================================
// EMAIL: Tiquete con QR al confirmar compra
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
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
      <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Inter',sans-serif;">
        <div style="max-width:520px;margin:0 auto;padding:40px 20px;">
          <div style="margin-bottom:28px;">
            <span style="font-size:1.1rem;font-weight:800;color:#f0f0f0;">CINE<span style="color:#d4a843;">APP</span></span>
          </div>
          <div style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:36px 32px;">
            <p style="color:#909090;font-size:0.82rem;margin:0 0 4px;">Hola ${nombre},</p>
            <h1 style="color:#f0f0f0;font-size:1.4rem;margin:0 0 24px;font-weight:700;">Tu tiquete está listo ✅</h1>
            <div style="display:flex;align-items:center;gap:20px;background:rgba(255,255,255,0.03);border-radius:10px;padding:20px;margin-bottom:24px;">
              <img src="${qrUrl}" width="100" height="100" alt="QR" style="border-radius:6px;background:#fff;padding:6px;flex-shrink:0;"/>
              <div>
                <p style="color:#555;font-size:0.68rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 6px;">Código de acceso</p>
                <p style="color:#d4a843;font-family:monospace;font-size:1.4rem;font-weight:700;letter-spacing:0.1em;margin:0 0 8px;">${codigo}</p>
                <p style="color:#555;font-size:0.75rem;margin:0;">Presenta este QR en la entrada del cine</p>
              </div>
            </div>
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
            <div style="margin-top:24px;padding:14px;background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.15);border-radius:8px;">
              <p style="color:#d4a843;font-size:0.8rem;margin:0;text-align:center;">⏰ Puedes ingresar desde <strong>15 minutos antes</strong> del inicio de tu función</p>
            </div>
          </div>
          <p style="text-align:center;color:#444;font-size:0.74rem;margin-top:20px;">CineApp · SENA CNCA Nodo TIC ADSO17</p>
        </div>
      </body></html>`;

    await sendBrevoEmail(email, `🎟️ Tu tiquete — ${funcion?.titulo || 'CineApp'} · ${codigo}`, html);
    console.log(`✉️  Tiquete enviado a ${email}`);
    return { success: true };
  } catch (err) {
    console.error('❌ Error enviando tiquete:', err.message);
    return { error: err.message };
  }
};

// ============================================
// EMAIL: Confirmación de entrada al validar QR
// ============================================
export const enviarConfirmacionEntrada = async ({ email, nombre, tiquete }) => {
  const { codigo, funcion, asientos } = tiquete;
  const asientosStr = asientos?.map(a => `${a.fila}${a.columna}`).join(', ') || '';
  const horaEntrada = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  const fechaFormateada = funcion?.fecha
    ? new Date(funcion.fecha + 'T00:00').toLocaleDateString('es-CO', {
        weekday: 'long', day: 'numeric', month: 'long'
      })
    : '';

  try {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
      <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Inter',sans-serif;">
        <div style="max-width:520px;margin:0 auto;padding:40px 20px;">
          <div style="margin-bottom:28px;">
            <span style="font-size:1.1rem;font-weight:800;color:#f0f0f0;">CINE<span style="color:#d4a843;">APP</span></span>
          </div>
          <div style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;">

            <!-- Header verde de confirmación -->
            <div style="background:#0d2b1a;border-bottom:1px solid rgba(34,197,94,0.2);padding:28px 32px;text-align:center;">
              <div style="width:56px;height:56px;background:rgba(34,197,94,0.12);border:2px solid rgba(34,197,94,0.3);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
                <span style="font-size:24px;">✓</span>
              </div>
              <h1 style="color:#4ade80;font-size:1.3rem;margin:0 0 4px;font-weight:700;">¡Entrada confirmada!</h1>
              <p style="color:#555;font-size:0.82rem;margin:0;">Acceso registrado a las ${horaEntrada}</p>
            </div>

            <!-- Cuerpo -->
            <div style="padding:28px 32px;">
              <p style="color:#909090;font-size:0.88rem;margin:0 0 20px;">Hola <strong style="color:#f0f0f0;">${nombre}</strong>, tu entrada ha sido validada exitosamente. ¡Que disfrutes la película!</p>

              <!-- Info función -->
              <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:18px 20px;margin-bottom:20px;">
                <h2 style="color:#f0f0f0;font-size:1.05rem;font-weight:700;margin:0 0 14px;">${funcion?.titulo || ''}</h2>
                ${[
                  ['📅 Fecha', fechaFormateada],
                  ['🕐 Hora', funcion?.hora?.slice(0, 5) || ''],
                  ['🏛️ Sala', funcion?.sala || ''],
                  ['💺 Asientos', asientosStr],
                  ['🎟️ Código', codigo],
                ].map(([l, v]) => `
                  <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                    <span style="color:#555;font-size:0.8rem;">${l}</span>
                    <span style="color:#d0d0d0;font-size:0.82rem;font-weight:500;">${v}</span>
                  </div>`).join('')}
              </div>

              <!-- Mensaje final -->
              <div style="text-align:center;padding:16px;background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.12);border-radius:8px;">
                <p style="color:#d4a843;font-size:0.85rem;margin:0;font-weight:500;">🍿 ¡Disfruta tu película!</p>
              </div>
            </div>
          </div>
          <p style="text-align:center;color:#444;font-size:0.74rem;margin-top:20px;">CineApp · SENA CNCA Nodo TIC ADSO17</p>
        </div>
      </body></html>`;

    await sendBrevoEmail(email, `✅ Entrada confirmada — ${funcion?.titulo || 'CineApp'}`, html);
    console.log(`✉️  Confirmación de entrada enviada a ${email}`);
    return { success: true };
  } catch (err) {
    console.error('❌ Error enviando confirmación de entrada:', err.message);
    return { error: err.message };
  }
};