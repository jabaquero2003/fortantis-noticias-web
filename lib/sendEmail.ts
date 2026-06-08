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

function processInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#0D2645;font-weight:600;">$1</strong>')
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" style="color:#C17F3E;text-decoration:none;">$1</a>'
    )
    .replace(
      /(?<![[(])(https?:\/\/[^\s<>"]+)/g,
      '<a href="$1" style="color:#C17F3E;text-decoration:none;font-size:11px;word-break:break-all;">$1</a>'
    )
}

function briefToHtml(markdown: string): string {
  if (!markdown) return ''

  const lines = markdown.split('\n')
  const parts: string[] = []
  let listItems: string[] = []

  function flushList() {
    if (listItems.length > 0) {
      parts.push(
        `<table width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 14px;">` +
          listItems
            .map(
              (item) =>
                `<tr><td style="padding:3px 0 3px 16px;font-family:Arial,sans-serif;font-size:13px;color:#4A4A4A;line-height:1.65;border-left:2px solid #E8E0D5;">` +
                `<span style="color:#C17F3E;margin-right:6px;">—</span>${item}</td></tr>`
            )
            .join('') +
          `</table>`
      )
      listItems = []
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed.startsWith('* ') && !trimmed.startsWith('- ')) {
      flushList()
    }

    if (trimmed.startsWith('# ')) {
      const text = processInline(trimmed.slice(2))
      parts.push(
        `<div style="font-family:Arial,sans-serif;font-size:20px;font-weight:300;color:#C17F3E;letter-spacing:0.22em;text-transform:uppercase;margin-bottom:2px;">${text}</div>`
      )
    } else if (trimmed.startsWith('## ')) {
      const text = processInline(trimmed.slice(3))
      parts.push(
        `<table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 14px 0;">` +
          `<tr><td style="background:#0D2645;padding:11px 18px;">` +
          `<span style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#C17F3E;font-weight:700;">${text}</span>` +
          `</td></tr>` +
          `<tr><td style="height:2px;background:#C17F3E;"></td></tr>` +
          `</table>`
      )
    } else if (trimmed.startsWith('### ')) {
      const text = processInline(trimmed.slice(4))
      parts.push(
        `<div style="font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:#0D2645;` +
          `margin:20px 0 10px;padding:10px 14px;background:#F7F4F0;border-left:3px solid #C17F3E;">${text}</div>`
      )
    } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      listItems.push(processInline(trimmed.slice(2)))
    } else if (trimmed === '' || trimmed === '---') {
      parts.push(`<div style="height:6px;"></div>`)
    } else if (/^\*\*[^*]+:\*\*/.test(trimmed)) {
      const match = trimmed.match(/^\*\*([^*]+):\*\*\s*(.*)/)
      if (match) {
        const label = match[1]
        const value = processInline(match[2])
        parts.push(
          `<table cellpadding="0" cellspacing="0" style="margin:3px 0 5px;">` +
            `<tr>` +
            `<td style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#9A8E84;padding-right:8px;white-space:nowrap;vertical-align:top;padding-top:2px;">${label}</td>` +
            `<td style="font-family:Arial,sans-serif;font-size:13px;color:#0D2645;line-height:1.55;">${value || '&nbsp;'}</td>` +
            `</tr></table>`
        )
      }
    } else if (
      trimmed.startsWith('Fecha de edición:') ||
      trimmed.startsWith('Tipo de edición:') ||
      trimmed.startsWith('Uso:')
    ) {
      const colonIdx = trimmed.indexOf(':')
      const label = trimmed.slice(0, colonIdx)
      const value = processInline(trimmed.slice(colonIdx + 1).trim())
      parts.push(
        `<span style="font-family:Arial,sans-serif;font-size:11px;color:#9A8E84;letter-spacing:1px;">${label}: </span>` +
          `<span style="font-family:Arial,sans-serif;font-size:11px;color:#0D2645;">${value}</span><br>`
      )
    } else {
      const text = processInline(trimmed)
      if (text) {
        parts.push(
          `<p style="font-family:Arial,sans-serif;font-size:13px;color:#4A4A4A;line-height:1.7;margin:5px 0 10px;">${text}</p>`
        )
      }
    }
  }

  flushList()
  return parts.join('')
}

function buildEmailHtml(brief: BriefResult, edition: number, dateStr: string): string {
  const briefHtml = briefToHtml(brief.briefText)

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
<table width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;width:100%;">

  <!-- HEADER con logo -->
  <tr>
    <td style="background-color:#0D2645;padding:36px 44px 28px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <!-- Logo de Fortantis -->
            <img src="https://fortantis-noticias-web.vercel.app/logo-fortantis.png"
                 alt="Fortantis"
                 width="140"
                 style="display:block;height:auto;margin-bottom:22px;max-width:140px;" />
            <div style="font-family:Georgia,serif;font-size:22px;font-weight:normal;color:#FFFFFF;line-height:1.2;margin-bottom:4px;">Noticiero Fortantis</div>
            <div style="width:36px;height:1px;background:#C17F3E;margin:14px 0;"></div>
            <div style="font-family:Arial,sans-serif;font-size:11px;color:#6B88A8;">
              Edición #${edition} &nbsp;·&nbsp; ${dateStr}
            </div>
            <div style="font-family:Arial,sans-serif;font-size:10px;color:#3A5470;margin-top:4px;letter-spacing:1px;text-transform:uppercase;">Brief interno automatizado</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr><td style="height:3px;background:#C17F3E;"></td></tr>

  <!-- BOTÓN VER EN LA WEB — arriba del contenido -->
  <tr>
    <td style="background:#F7F4F0;padding:18px 44px;text-align:center;border-bottom:1px solid #E0D9CF;">
      <a href="https://fortantis-noticias-web.vercel.app"
         style="display:inline-block;background:#0D2645;color:#C17F3E;text-decoration:none;
                padding:11px 32px;font-family:Arial,sans-serif;font-size:10px;
                letter-spacing:3px;text-transform:uppercase;">
        Ver edición en la web ↗
      </a>
    </td>
  </tr>

  <!-- CONTENIDO DEL BRIEF -->
  <tr>
    <td style="background:#FFFFFF;padding:36px 44px;">
      ${briefHtml}
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="background:#0D2645;padding:22px 44px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#C17F3E;">FORTANTIS</div>
            <div style="font-family:Arial,sans-serif;font-size:10px;color:#3A5470;margin-top:3px;letter-spacing:1px;text-transform:uppercase;">Latam Native. Globally Minded.</div>
          </td>
          <td align="right" style="vertical-align:top;">
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
