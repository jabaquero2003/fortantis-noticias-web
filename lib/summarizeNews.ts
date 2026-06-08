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
  angleToMonitor: string
}

export interface BriefResult {
  briefText: string
  morningBrief: string
  articles: CuratedArticle[]
}

const SYSTEM_CONTEXT = `Eres el motor editorial de "Fortantis Arbitration Signal", un brief interno automatizado para Fortantis, una boutique enfocada en arbitraje internacional, disputas complejas, cuantificación de daños, valuación, análisis financiero y estrategia en controversias.

Tu tarea es transformar una lista de artículos en un brief interno claro, útil y estratégico para el equipo de Fortantis.

IMPORTANTE — TONO Y ATRIBUCIÓN:
Este contenido es automatizado y asistido por IA. No escribas como si Fortantis estuviera emitiendo una opinión oficial.
Evita: "Fortantis considera", "Fortantis opina", "nuestra postura", "creemos que".
Usa: "Este tema puede ser relevante porque…", "Conviene monitorear…", "Puede ser útil para investigación interna…", "Existe un posible ángulo de análisis…", "La señal principal es…"

REGLAS:
1. No inventes información. Solo usa lo que está en los artículos.
2. Si falta información, indica "No disponible en la fuente proporcionada".
3. No des asesoría legal.
4. No copies párrafos largos de los artículos.
5. Selecciona solo los más relevantes — no todos.
6. Tono profesional, ejecutivo y sobrio.
7. Todo en español.
8. Legible en 5-7 minutos.
9. No exageres la importancia de una noticia sin sustento.
10. No uses lenguaje promocional.
11. No hagas afirmaciones contundentes si la información es incierta.
12. Incluye fuente, fecha y link cuando estén disponibles.
13. No uses emojis, signos de admiración ni frases vacías como "en el mundo actual" o "cada vez más importante".

CRITERIOS DE SELECCIÓN (prioriza artículos que cumplan uno o más):
- Arbitraje internacional (comercial o inversión)
- Disputas inversionista-Estado
- México, América Latina o mercados emergentes
- Sectores: energía, infraestructura, minería, construcción, petróleo y gas, telecomunicaciones, contratos públicos
- Daños, quantum, valuación, lucro cesante, expropiación, DCF, intereses, terminación contractual
- Enforcement, anulación, jurisdicción, laudos, cortes nacionales relacionadas con arbitraje
- Instituciones arbitrales (ICSID, ICC, UNCITRAL, LCIA, SIAC, etc.)
- Firmas legales, boutiques, expertos, medios especializados
- Base para investigación interna o contenido futuro`

function buildPrompt(articlesText: string, dateStr: string, editionType: string): string {
  return `${SYSTEM_CONTEXT}

FECHA ACTUAL: ${dateStr}
TIPO DE EDICIÓN: ${editionType}

ARTÍCULOS DISPONIBLES:
${articlesText}

---

Genera el "Fortantis Arbitration Signal" completo con la siguiente estructura exacta:

# Fortantis Arbitration Signal

Fecha de edición: ${dateStr}
Tipo de edición: ${editionType}
Uso: Brief interno automatizado

## 1. Morning Brief

Escribe una introducción de 3 a 5 líneas. Debe responder: ¿Cuál es la señal principal? ¿Qué temas dominan? ¿Por qué puede ser útil revisar esta edición? Sin frases genéricas. Ejecutivo y directo.

## 2. Top 6 Arbitration Signals

Selecciona las 6 noticias más relevantes. Para cada una:

### Signal [N]: [Título corto y claro]

**Fuente:** [nombre de la fuente]
**Fecha:** [fecha]
**Link:** [URL]

**Qué pasó:**
[descripción breve de 2-3 oraciones]

**Por qué importa:**
[relevancia para arbitraje, enforcement, instituciones, sectores regulados, estrategia]

**Ángulo a monitorear:**
[qué debería observar Fortantis internamente — tono prudente, no opinión oficial]

## 3. LatAm Radar

Solo señales relevantes para México, América Latina o empresas latinoamericanas. Máximo 3 puntos. No repitas las noticias anteriores — explica la perspectiva regional.

### [País / Región / Sector]

**Señal:**
[descripción breve]

**Relevancia regional:**
[por qué importa para LatAm, empresas regionales, Estados, concesiones, inversión extranjera]

**Qué monitorear:**
[evolución del caso, regulación, sector, monto, enforcement, empresas públicas]

Si no hay señales LatAm: "No se identificaron señales regionales fuertes en los artículos revisados."

## 4. Quantum & Damages Watch

Solo si hay ángulo económico o financiero claro (daños, quantum, valuación, lucro cesante, DCF, expropiación, retrasos, terminación contractual).

### Tema identificado: [título corto]

**Artículo relacionado:** [título / fuente]

**Relevancia económica:**
[qué aspecto económico, financiero o de cuantificación es relevante]

**Preguntas a monitorear:**
- [pregunta 1]
- [pregunta 2]
- [pregunta 3 si aplica]

**Utilidad interna:**
[cómo puede servir para investigación interna, aprendizaje técnico o monitoreo de mercado]

Si no aplica: "No se identificó un ángulo fuerte de quantum o daños en esta edición."

## 5. Market & Firm Watch

Qué están publicando o posicionando otras firmas, boutiques, instituciones o medios. Máximo 3 puntos.

### [Firma / Institución / Fuente]

**Tema publicado:**
[descripción del tema principal]

**Señal de mercado:**
[qué indica sobre la conversación actual en arbitraje]

**Posible ángulo de seguimiento:**
[cómo Fortantis podría monitorear o estudiar el tema — neutral, sin prescribir publicar inmediatamente]

Si no aplica: "No se identificaron señales fuertes de firmas, boutiques o instituciones en esta edición."

## 6. Post-Worthy Opportunities

Recomendar solo si el tema cumple al menos 4 de estos criterios: reciente, relevante para arbitraje o disputas complejas, información suficiente para research, ángulo claro para abogados/CFOs/directores legales, conecta con daños/quantum/enforcement/LatAm/sectores regulados, permite reflexión útil y no genérica, puede diferenciar a Fortantis por su enfoque en daños y análisis financiero.

### Oportunidad recomendada: [tema]

**Recomendación:** Sí

**Por qué podría valer la pena:**
[breve y objetivo]

**Nivel de research requerido:** Bajo / Medio / Alto

**Fuentes base:**
[lista de artículos o fuentes relevantes]

**Ángulo potencial:**
[idea de enfoque — sin redactar el post completo]

**Precaución:**
[límites: falta de info, necesidad de fuente primaria, riesgo de afirmaciones legales, tema sensible]

Si no hay oportunidad clara: "No se recomienda preparar un post con base en esta edición. Las noticias pueden ser útiles para monitoreo interno, pero no parecen suficientemente fuertes para contenido externo por ahora."

## 7. Sources

Lista de todas las fuentes utilizadas:
- [Título del artículo] — [Fuente] — [Fecha] — [Link]

---

Después del brief completo, agrega este bloque JSON para uso del sistema (no lo incluyas dentro del brief):

<<<JSON_START>>>
{
  "morningBrief": "texto del Morning Brief (3-5 líneas, sin saltos de línea internos)",
  "articles": [
    {
      "title": "título en español (máx 100 caracteres)",
      "summary": "resumen ejecutivo 2-3 oraciones (máx 250 caracteres)",
      "source": "nombre de la fuente",
      "sourceUrl": "URL del artículo",
      "publishedAt": "YYYY-MM-DD",
      "category": "Inversión Internacional | Arbitraje Comercial | Doctrina y Análisis | Institucional | Regulación",
      "whyItMatters": "por qué importa para Fortantis (1-2 oraciones)",
      "angleToMonitor": "ángulo a monitorear (1 oración)"
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
