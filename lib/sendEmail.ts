import { Resend } from 'resend'
import { CuratedArticle } from './summarizeNews'

const resend = new Resend(process.env.RESEND_API_KEY)

const RECIPIENTS = [
  'jose.baquero@fortantis.com',
  'samuel.garciacuellar@fortantis.com',
  'juan.olivera@fortantis.com',
]

function buildEmailHtml(articles: CuratedArticle[], edition: number, date: string): string {
  const articleRows = articles
    .map(
      (a) => `
    <tr>
      <td style="padding: 0 0 32px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
               style="border-left: 3px solid #C17F3E; padding-left: 20px;">
          <tr>
            <td>
              <span style="display:inline-block; background:#0D2645; color:#C17F3E;
                           font-size:10px; letter-spacing:2px; text-transform:uppercase;
                           padding:3px 8px; margin-bottom:10px; font-family:Arial,sans-serif;">
                ${a.category}
              </span>
            </td>
          </tr>
          <tr>
            <td style="font-family:'Georgia',serif; font-size:16px; color:#0D2645;
                       line-height:1.4; font-weight:normal; padding-bottom:8px;">
              ${a.title}
            </td>
          </tr>
          <tr>
            <td style="font-family:Arial,sans-serif; font-size:13px; color:#5A5A5A;
                       line-height:1.6; padding-bottom:10px;">
              ${a.summary}
            </td>
          </tr>
          <tr>
            <td style="font-family:Arial,sans-serif; font-size:11px; color:#9CA3AF;">
              <strong style="color:#9CA3AF;">${a.source}</strong>
              &nbsp;·&nbsp;
              ${new Date(a.publishedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
              &nbsp;·&nbsp;
              <a href="${a.sourceUrl}" style="color:#C17F3E; text-decoration:none;">Leer artículo completo →</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `
    )
    .join('')

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background-color:#F0EBE3; font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F0EBE3; padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0" border="0" style="max-width:620px; width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="background-color:#0D2645; padding:32px 40px; text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <span style="color:#C17F3E; font-size:22px; letter-spacing:8px;
                                 font-family:Arial,sans-serif; font-weight:300; text-transform:uppercase;">
                      FORTANTIS
                    </span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:6px;">
                    <span style="color:#8BA0BB; font-size:11px; letter-spacing:3px; text-transform:uppercase;">
                      Inteligencia en Arbitraje Internacional
                    </span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:20px;">
                    <div style="width:40px; height:1px; background:#C17F3E; display:inline-block;"></div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:16px;">
                    <span style="color:#FFFFFF; font-size:13px; font-family:'Georgia',serif;">
                      Edición #${edition} · ${date}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- INTRO -->
          <tr>
            <td style="background:#FFFFFF; padding:28px 40px 20px; border-bottom:1px solid #E8E0D5;">
              <p style="margin:0; font-family:'Georgia',serif; font-size:14px; color:#5A5A5A; line-height:1.7;">
                A continuación encontrará las <strong style="color:#0D2645;">${articles.length} noticias más relevantes</strong>
                de arbitraje internacional seleccionadas esta semana por el sistema inteligente de Fortantis.
                Las noticias han sido verificadas con sus fuentes originales.
              </p>
            </td>
          </tr>

          <!-- ARTICLES -->
          <tr>
            <td style="background:#FFFFFF; padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${articleRows}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="background:#FFFFFF; padding:0 40px 36px; text-align:center; border-top:1px solid #E8E0D5;">
              <a href="https://noticias.fortantis.com"
                 style="display:inline-block; background:#0D2645; color:#C17F3E;
                        text-decoration:none; padding:12px 32px; font-family:Arial,sans-serif;
                        font-size:12px; letter-spacing:3px; text-transform:uppercase; margin-top:24px;">
                Ver edición completa →
              </a>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#0D2645; padding:24px 40px; text-align:center;">
              <p style="margin:0; color:#4A6480; font-size:11px; font-family:Arial,sans-serif; line-height:1.6;">
                © ${new Date().getFullYear()} Fortantis · Boletín de uso interno<br>
                <a href="https://fortantis.com" style="color:#C17F3E; text-decoration:none;">fortantis.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendNewsEmail(articles: CuratedArticle[], edition: number): Promise<void> {
  const dateStr = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const html = buildEmailHtml(articles, edition, dateStr)

  const { data, error } = await resend.emails.send({
    from: 'Fortantis Noticias <onboarding@resend.dev>',
    to: RECIPIENTS,
    subject: `Fortantis · Arbitraje Internacional — Edición #${edition} · ${dateStr}`,
    html,
  })

  if (error) throw new Error(`Error enviando correo: ${JSON.stringify(error)}`)
  console.log(`✓ Correo enviado: ${data?.id}`)
}
