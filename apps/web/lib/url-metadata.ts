// Utility functions for fetching URL metadata
export async function fetchUrlMetadata(url: string): Promise<{
  title?: string
  description?: string
  favicon?: string
}> {
  try {
    // Use a CORS proxy or server-side function to fetch metadata
    // For now, we'll use a simple approach that works client-side
    const response = await fetch(
      `https://api.microlink.io/?url=${encodeURIComponent(url)}&meta=false&screenshot=false&video=false`,
    )

    if (!response.ok) {
      throw new Error("Failed to fetch metadata")
    }

    const data = await response.json()

    return {
      title: data.data?.title || undefined,
      description: data.data?.description || undefined,
      favicon: data.data?.logo?.url || undefined,
    }
  } catch (error) {
    console.error("Error fetching URL metadata:", error)
    return {}
  }
}

export function getDomainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "")
  } catch {
    return url
  }
}

export function truncateText(text: string, maxLength = 120): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + "..."
}
