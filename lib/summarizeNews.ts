import Anthropic from '@anthropic-ai/sdk'
import { RawArticle } from './fetchNews'
import { randomUUID } from 'crypto'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface CuratedArticle {
  id: string
  title: string
  summary: string
  source: string
  sourceUrl: string
  publishedAt: string
  category: string
  whyItMatters: string
}

export interface BriefResult {
  briefText: string
  morningBrief: string
  articles: CuratedArticle[]
}

const SYSTEM_CONTEXT = `Eres el motor editorial del "Noticiero Fortantis", un brief interno automatizado para Fortantis, una boutique especializada en arbitraje internacional, disputas complejas, cuantificación de daños, valuación, análisis financiero y estrategia en controversias.

AUDIENCIA: Abogados senior, directores legales, expertos en daños y CFOs. Conocen el campo. No necesitan explicaciones básicas. Necesitan señales, no resúmenes de Wikipedia.

TONO OBLIGATORIO:
- Ejecutivo, sobrio, preciso.
- Lenguaje prudente: "puede ser relevante porque…", "conviene monitorear…", "la señal principal es…", "podría ser útil para investigación interna…"
- NO uses frases genéricas como: "en un mundo globalizado", "cada vez más importante", "es fundamental destacar", "sin lugar a dudas", "en el contexto actual", "cabe mencionar que".
- NO escribas como si Fortantis emitiera una opinión oficial. Este brief es automatizado y asistido por IA.
- NO exageres la importancia de ninguna noticia sin sustento claro.
- NO uses emojis, signos de admiración ni lenguaje promocional.
- NO copies párrafos largos de los artículos. Parafrasea e interpreta.
- NO des asesoría legal.
- TODO en español. Tono de memo interno, no de artículo de opinión.

CRITERIOS DE SELECCIÓN (prioriza artículos que cumplan uno o más):
- Arbitraje internacional comercial o de inversión
- Disputas inversionista-Estado (ISDS)
- México, América Latina o mercados emergentes
- Sectores: energía, infraestructura, minería, construcción, petróleo y gas, telecomunicaciones, contratos públicos
- Daños, quantum, valuación, lucro cesante, expropiación, DCF, intereses, terminación contractual
- Enforcement, anulación, jurisdicción, laudos, cortes nacionales relacionadas con arbitraje
- Instituciones arbitrales: ICSID, ICC, UNCITRAL, LCIA, SIAC y equivalentes
- Publicaciones de firmas legales, boutiques, expertos o medios especializados`

function buildPrompt(articlesText: string, dateStr: string, editionType: string): string {
  return `${SYSTEM_CONTEXT}

FECHA ACTUAL: ${dateStr}
TIPO DE EDICIÓN: ${editionType}

ARTÍCULOS DISPONIBLES:
${articlesText}

---

Genera el "Noticiero Fortantis" completo con la estructura exacta que se indica a continuación.

REGLA GLOBAL: Escribe en prosa fluida. Sin sub-títulos internos dentro de las secciones. Sin etiquetas como "Qué pasó:", "Por qué importa:", "Ángulo a monitorear:". Integra toda la información en párrafos naturales y ejecutivos. Legible en 5-7 minutos.

# Noticiero Fortantis

Fecha de edición: ${dateStr}
Uso: Brief interno automatizado

## 1. Apertura

Escribe 3-5 líneas que respondan: ¿cuál es la señal dominante de esta edición? ¿qué temas se repiten o destacan? ¿por qué conviene revisar esta edición? Sin frases de relleno. Directo al punto. No menciones que eres una IA.

## 2. Señales Principales

Selecciona exactamente 6 noticias. Prioriza relevancia sobre cantidad. Si no hay 6 fuertes, selecciona menos pero de mayor calidad.

Para cada señal usa este formato:

### [Título claro y corto — sin numeración]

**Fuente:** [nombre] · **Fecha:** [fecha] · **[Leer artículo](URL)**

[Dos párrafos en prosa fluida. Primer párrafo: qué ocurrió y el contexto inmediato. Segundo párrafo: por qué puede ser relevante para arbitraje o disputas complejas, y qué conviene monitorear. No repitas el título. No uses etiquetas. Ejecutivo y directo.]

## 3. LatAm Radar

REGLA CRÍTICA: Esta sección NO puede repetir artículos que ya aparecen en Señales Principales. Si una noticia ya está arriba, no la incluyas aquí bajo ninguna circunstancia.

Esta sección es exclusivamente para:
- Noticias directamente relacionadas con México o América Latina que no estén en Señales Principales
- Noticias globales con impacto razonable en empresas, Estados, SOEs, contratos públicos o sectores regulados de América Latina
- Señales sectoriales para energía, infraestructura, minería, construcción, petróleo y gas, telecomunicaciones o concesiones en la región

Máximo 3 puntos. Para cada uno:

### [País / Región / Sector]

[Párrafo en prosa sobre la señal regional y su relevancia para LatAm. Directo, sin sub-títulos.]

Si no hay señales LatAm genuinamente distintas, escribe exactamente:
"No se identificaron señales regionales adicionales en esta edición."

## 4. Quantum & Daños

Esta sección solo aparece con contenido real si hay un ángulo económico claro. Los ángulos válidos son: daños, quantum, valuación, lucro cesante, pérdida de utilidades, DCF, intereses, tipo de cambio, riesgo país, costos hundidos, expropiación, terminación contractual, retrasos de proyectos o contratos de largo plazo en infraestructura, energía, minería o construcción.

Si hay ángulo válido: escribe un párrafo fluido por tema identificado. Menciona la fuente. No sub-títulos internos.

Si no hay ángulo válido, escribe exactamente:
"No se identificó un ángulo fuerte de quantum o daños en esta edición."

## 5. Firmas e Instituciones

Qué están publicando o posicionando firmas, boutiques, instituciones arbitrales o expertos en los artículos revisados. Máximo 3 puntos. Para cada uno: quién publicó, qué tema está posicionando, qué señal de mercado representa, qué puede ser útil monitorear internamente.

Prosa fluida. Sin sub-títulos. Sin repetir artículos ya mencionados en Señales Principales como noticia principal — solo se puede hacer referencia breve como contexto.

Si no aplica, escribe exactamente:
"Sin publicaciones relevantes de firmas o instituciones en esta edición."

## 6. Oportunidad de Contenido

Esta sección es muy selectiva. Solo recomienda una oportunidad de post si la noticia cumple al menos 4 de estos 7 criterios:
1. Es reciente (publicada en los últimos 7 días)
2. Es relevante para arbitraje internacional o disputas complejas
3. Tiene suficiente información para hacer research interno
4. Tiene un ángulo claro para abogados, directores legales, CFOs o expertos en daños
5. Se conecta con daños, quantum, valuación, enforcement, LatAm, sectores regulados o estrategia de disputas
6. Permite una reflexión útil y no genérica
7. Puede diferenciar a Fortantis por su enfoque técnico, financiero o de disputas complejas

Si hay oportunidad válida: un párrafo fluido con la recomendación, el tema, y el ángulo concreto para Fortantis.

Si no hay oportunidad fuerte, escribe exactamente:
"No se recomienda preparar un post con base en esta edición. Las noticias revisadas pueden ser útiles para monitoreo interno, pero no parecen suficientemente fuertes para contenido externo por ahora."

## 7. Fuentes

Lista limpia de todos los artículos revisados en esta edición:
- [Título] — [Fuente] — [Fecha] — [Link]

---

Después del brief, agrega este bloque JSON exactamente así, sin modificar los delimitadores:

<<<JSON_START>>>
{
  "morningBrief": "texto de apertura en una sola línea, sin saltos de línea, máximo 3-4 oraciones ejecutivas",
  "articles": [
    {
      "title": "título en español claro y corto, máximo 90 caracteres",
      "summary": "resumen ejecutivo en prosa, 2 oraciones máximo, máximo 220 caracteres",
      "source": "nombre de la fuente",
      "sourceUrl": "URL exacta del artículo",
      "publishedAt": "YYYY-MM-DD",
      "category": "Inversión Internacional | Arbitraje Comercial | Doctrina y Análisis | Institucional | Regulación",
      "whyItMatters": "por qué importa para Fortantis, 1-2 oraciones, prosa directa"
    }
  ]
}
<<<JSON_END>>>`
}

export async function curateAndSummarize(raw: RawArticle[]): Promise<BriefResult> {
  if (raw.length === 0) {
    return {
      briefText: '',
      morningBrief: 'No se encontraron artículos para esta edición.',
      articles: [],
    }
  }

  const today = new Date()
  const dateStr = today.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const dayNum = today.getDay()
  const editionType =
    dayNum === 2 ? 'Martes' : dayNum === 5 ? 'Viernes' : today.toLocaleDateString('es-ES', { weekday: 'long' })

  const articlesText = raw
    .map(
      (a, i) =>
        `[${i + 1}] TÍTULO: ${a.title}\nFUENTE: ${a.source}\nFECHA: ${a.pubDate}\nURL: ${a.link}\nEXTRACTO: ${a.contentSnippet}`
    )
    .join('\n\n---\n\n')

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: buildPrompt(articlesText, dateStr, editionType),
      },
    ],
  })

  const fullText = response.content[0].type === 'text' ? response.content[0].text : ''

  const jsonMatch = fullText.match(/<<<JSON_START>>>([\s\S]*?)<<<JSON_END>>>/)
  const briefText = fullText.replace(/<<<JSON_START>>>[\s\S]*?<<<JSON_END>>>/, '').trim()

  let morningBrief = ''
  let articles: CuratedArticle[] = []

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1].trim())
      morningBrief = parsed.morningBrief ?? ''
      articles = (parsed.articles ?? []).map((a: Omit<CuratedArticle, 'id'>) => ({
        ...a,
        id: randomUUID(),
      }))
    } catch {
      const arrayMatch = jsonMatch[1].match(/\[[\s\S]*\]/)
      if (arrayMatch) {
        try {
          articles = JSON.parse(arrayMatch[0]).map((a: Omit<CuratedArticle, 'id'>) => ({
            ...a,
            id: randomUUID(),
          }))
        } catch {}
      }
    }
  }

  return { briefText, morningBrief, articles }
}
