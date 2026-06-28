process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'url'

const VALID_CATEGORIES = ['AI', 'Tactics', 'Processes', 'Industry']

const PROMPT_TEMPLATE = (title, content) => `
You are classifying a tech article for a Software Engineering Tech Lead.
Respond with a JSON object only — no markdown fences, no prose, no explanation.

Schema: { "summary": "string (2-3 sentences)", "category": "AI | Tactics | Processes | Industry", "relevance_score": number (1-10) }

Relevance criteria (score high if):
- Practical applicability for a tech lead
- Technical depth, not generic/marketing content
- Novel insight, not rehash of well-known concepts
- Covers AI usage in engineering, engineering tactics, processes, or industry trends

Article title: ${title}
Article content: ${content || '(no content — classify from title only)'}
`.trim()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
)

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genai.getGenerativeModel({ model: 'gemini-2.0-flash' })

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function classifyArticle(article, maxRetries = 3) {
  const prompt = PROMPT_TEMPLATE(article.title, article.raw_content)

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt)
      const text = result.response.text().trim()
      const parsed = JSON.parse(text)

      if (
        typeof parsed.summary !== 'string' ||
        !VALID_CATEGORIES.includes(parsed.category) ||
        typeof parsed.relevance_score !== 'number'
      ) {
        throw new Error(`Invalid schema: ${JSON.stringify(parsed)}`)
      }

      return {
        summary: parsed.summary,
        category: parsed.category,
        relevance_score: Math.min(10, Math.max(1, Math.round(parsed.relevance_score))),
      }
    } catch (err) {
      console.error(`[classify] attempt ${attempt}/${maxRetries} failed for "${article.title}": ${err.message}`)
      if (attempt < maxRetries) await sleep(1000 * attempt)
    }
  }
  return null
}

export async function classifyAndStore(articles) {
  if (articles.length === 0) {
    console.error('[classify] No articles to classify')
    return
  }

  console.error(`[classify] Classifying ${articles.length} articles...`)
  const toUpsert = []

  for (const article of articles) {
    const classification = await classifyArticle(article)
    if (!classification) {
      console.error(`[classify] Skipping "${article.title}" after all retries failed`)
      continue
    }

    toUpsert.push({
      ...article,
      summary_ai: classification.summary,
      category: classification.category,
      relevance_score: classification.relevance_score,
    })

    console.error(`[classify] "${article.title}" → ${classification.category} (${classification.relevance_score}/10)`)

    // stay within free tier rate limit (15 req/min)
    await sleep(4100)
  }

  if (toUpsert.length === 0) return

  const { error } = await supabase
    .from('articles')
    .upsert(toUpsert, { onConflict: 'url', ignoreDuplicates: true })

  if (error) throw new Error(`Supabase upsert failed: ${error.message}`)

  console.error(`[classify] Stored ${toUpsert.length} articles`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let raw = ''
  process.stdin.setEncoding('utf-8')
  process.stdin.on('data', (chunk) => (raw += chunk))
  process.stdin.on('end', () => {
    const articles = JSON.parse(raw || '[]')
    classifyAndStore(articles)
      .then(() => process.exit(0))
      .catch((err) => {
        console.error('[classify] Fatal:', err.message)
        process.exit(1)
      })
  })
}
