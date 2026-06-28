import https from 'https'
import Parser from 'rss-parser'

const agent = new https.Agent({ rejectUnauthorized: false })
const parser = new Parser({ timeout: 10000, requestOptions: { agent } })

export default async function handler(req, res) {
  const { url } = req.query
  if (!url) {
    return res.status(400).json({ error: 'url parameter required' })
  }

  try {
    const feed = await parser.parseURL(decodeURIComponent(url))
    const items = feed.items
      .filter((item) => item.link && item.title)
      .map((item) => ({
        title: item.title.trim(),
        url: item.link.trim(),
        source: feed.title ?? '',
        published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
        raw_content: item.contentSnippet || item.content || null,
      }))

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')
    res.json({ items })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
