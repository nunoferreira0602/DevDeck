export async function fetchFeed(feedUrl) {
  const res = await fetch(`/api/fetch-feed?url=${encodeURIComponent(feedUrl)}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const { items, error } = await res.json()
  if (error) throw new Error(error)
  return items
}
