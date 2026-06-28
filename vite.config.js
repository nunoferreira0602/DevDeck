import https from 'https'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Parser from 'rss-parser'

const agent = new https.Agent({ rejectUnauthorized: false })
const parser = new Parser({ timeout: 10000, requestOptions: { agent } })

function rssProxyMiddleware() {
  return {
    name: 'rss-proxy-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/fetch-feed')) return next()

        const feedUrl = decodeURIComponent(
          new URL(req.url, 'http://localhost').searchParams.get('url') ?? '',
        )

        if (!feedUrl) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'url required' }))
          return
        }

        try {
          const feed = await parser.parseURL(feedUrl)
          const items = feed.items
            .filter((item) => item.link && item.title)
            .map((item) => ({
              title: item.title.trim(),
              url: item.link.trim(),
              source: feed.title ?? '',
              published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
              raw_content: item.contentSnippet || item.content || null,
            }))
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ items }))
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err.message }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), rssProxyMiddleware()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.js',
    passWithNoTests: true,
  },
})
