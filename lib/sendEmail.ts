import nodemailer from 'nodemailer'
import { BriefResult } from './summarizeNews'

const RECIPIENTS = [
  'jabaquero2003@gmail.com',
  // 'jose.baquero@fortantis.com',
  // 'samuel.garciacuellar@fortantis.com',
  // 'juan.olivera@fortantis.com',
]

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

const WEB_URL = 'https://fortantis-noticias-web.vercel.app'

function categoryColor(category: string): string {
  const map: Record<string, string> = {
    'Inversión Internacional': '#1A4A7A',
    'Arbitraje Comercial': '#0D2645',
    'Doctrina y Análisis': '#5A3A1A',
    'Institucional': '#3A2A5C',
    'Regulación': '#4A3A1A',
  }
  return map[category] ?? '#2A3A4A'
}

function buildEmailHtml(brief: BriefResult, edition: number, dateStr: string): string {
  const top3 = brief.articles.slice(0, 5)

  const signalRows = top3
    .map(
      (article, i) => `
    <tr>
      <td style="padding: 18px 0; border-bottom: 1px solid #E8E0D5;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <span style="display:inline-block;background:${categoryColor(article.category)};color:#FFFFFF;font-family:Arial,sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;padding:3px 8px;margin-bottom:10px;">${article.category}</span>
            </td>
          </tr>
          <tr>
            <td>
              <div style="font-family:Georgia,serif;font-size:15px;font-weight:normal;color:#0D2645;line-height:1.4;margin-bottom:6px;">
                <span style="color:#C17F3E;font-family:Arial,sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-right:8px;">Señal ${i + 1}</span>
                ${article.title}
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <div style="font-family:Arial,sans-serif;font-size:12px;color:#5A5A5A;line-height:1.6;margin-bottom:8px;">${article.summary}</div>
            </td>
          </tr>
          <tr>
            <td>
              <span style="font-family:Arial,sans-serif;font-size:10px;color:#9A8E84;letter-spacing:1px;">${article.source}</span>
              <span style="color:#D0C8C0;margin:0 6px;">·</span>
              <a href="${article.sourceUrl}" style="font-family:Arial,sans-serif;font-size:10px;color:#C17F3E;text-decoration:none;letter-spacing:1px;text-transform:uppercase;">Leer →</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Noticiero Fortantis — Edición #${edition}</title>
</head>
<body style="margin:0;padding:0;background-color:#EDEAE4;font-family:Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#EDEAE4;padding:28px 12px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

  <!-- HEADER -->
  <tr>
    <td style="background-color:#0D2645;padding:32px 40px 28px;">
      <img src="${WEB_URL}/logo-fortantis.png"
           alt="Fortantis"
           width="130"
           style="display:block;height:auto;margin-bottom:20px;" />
      <div style="font-family:Georgia,serif;font-size:20px;font-weight:normal;color:#FFFFFF;line-height:1.3;margin-bottom:6px;">Noticiero Fortantis</div>
      <div style="width:32px;height:1px;background:#C17F3E;margin:12px 0;"></div>
      <div style="font-family:Arial,sans-serif;font-size:11px;color:#6B88A8;">
        Edición #${edition} &nbsp;·&nbsp; ${dateStr}
      </div>
    </td>
  </tr>

  <tr><td style="height:3px;background:#C17F3E;"></td></tr>

  <!-- CTA PRINCIPAL -->
  <tr>
    <td style="background:#F7F4F0;padding:16px 40px;text-align:center;border-bottom:1px solid #E0D9CF;">
      <a href="${WEB_URL}"
         style="display:inline-block;background:#0D2645;color:#C17F3E;text-decoration:none;
                padding:10px 28px;font-family:Arial,sans-serif;font-size:9px;
                letter-spacing:3px;text-transform:uppercase;">
        Leer edición completa ↗
      </a>
    </td>
  </tr>

  <!-- MORNING BRIEF -->
  <tr>
    <td style="background:#FFFFFF;padding:28px 40px 20px;">
      <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#C17F3E;margin-bottom:12px;">Apertura</div>
      <p style="font-family:Georgia,serif;font-size:13px;color:#2A2A2A;line-height:1.75;margin:0;font-style:italic;">${brief.morningBrief}</p>
    </td>
  </tr>

  <!-- TOP 3 SIGNALS -->
  <tr>
    <td style="background:#FFFFFF;padding:8px 40px 28px;">
      <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#9A8E84;border-bottom:2px solid #0D2645;padding-bottom:8px;margin-bottom:4px;">Noticias Principales</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${signalRows}
      </table>
    </td>
  </tr>

  <!-- CTA FINAL -->
  <tr>
    <td style="background:#F7F4F0;padding:22px 40px;text-align:center;border-top:1px solid #E0D9CF;">
      <div style="font-family:Arial,sans-serif;font-size:11px;color:#7A7A7A;margin-bottom:14px;">
        Edición completa incluye: LatAm Radar · Quantum & Daños · Firmas e Instituciones · Oportunidad de Contenido
      </div>
      <a href="${WEB_URL}"
         style="display:inline-block;background:#C17F3E;color:#FFFFFF;text-decoration:none;
                padding:10px 28px;font-family:Arial,sans-serif;font-size:9px;
                letter-spacing:3px;text-transform:uppercase;">
        Leer edición completa ↗
      </a>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="background:#0D2645;padding:20px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#C17F3E;">FORTANTIS</div>
            <div style="font-family:Arial,sans-serif;font-size:9px;color:#3A5470;margin-top:2px;letter-spacing:1px;text-transform:uppercase;">LatAm Native. Globally Minded.</div>
          </td>
          <td align="right">
            <div style="font-family:Arial,sans-serif;font-size:10px;color:#4A6480;line-height:1.7;text-align:right;">
              <a href="https://fortantis.com" style="color:#C17F3E;text-decoration:none;">fortantis.com</a><br>
              <span style="color:#3A5470;">© ${new Date().getFullYear()} Fortantis · Uso interno</span>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

</table>
</td></tr>
</table>

</body>
</html>`
}

export async function sendNewsEmail(brief: BriefResult, edition: number): Promise<void> {
  const dateStr = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const html = buildEmailHtml(brief, edition, dateStr)

  const dayNum = new Date().getDay()
  const dayLabel = dayNum === 2 ? 'Martes' : dayNum === 5 ? 'Viernes' : ''
  const subject = `Noticiero Fortantis #${edition}${dayLabel ? ` · ${dayLabel}` : ''} — ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`

  await transporter.sendMail({
    from: `"Fortantis Signal" <${process.env.GMAIL_USER}>`,
    to: RECIPIENTS.join(', '),
    subject,
    html,
  })

  console.log(`   Correo enviado a ${RECIPIENTS.length} destinatarios`)
}
