import { v } from 'convex/values';
import { action } from './_generated/server';

function extractMetaContent(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return null;
}

function extractTitle(html: string): string | null {
  return (
    extractMetaContent(html, 'og:title') ??
    extractMetaContent(html, 'twitter:title') ??
    html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ??
    null
  );
}

function extractDescription(html: string): string | null {
  return (
    extractMetaContent(html, 'og:description') ??
    extractMetaContent(html, 'description') ??
    extractMetaContent(html, 'twitter:description') ??
    null
  );
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export const fetchMetadata = action({
  args: { url: v.string() },
  returns: v.object({
    title: v.union(v.string(), v.null()),
    description: v.union(v.string(), v.null()),
    faviconUrl: v.string(),
    domain: v.string(),
  }),
  handler: async (_ctx, args) => {
    const fullUrl = normalizeUrl(args.url);
    let domain: string;
    try {
      domain = new URL(fullUrl).hostname;
    } catch {
      return {
        title: null,
        description: null,
        faviconUrl: `https://www.google.com/s2/favicons?domain=${args.url}&sz=32`,
        domain: args.url,
      };
    }

    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

    try {
      const response = await fetch(fullUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RListBot/1.0; +https://rlist.app)',
          Accept: 'text/html',
        },
      });

      if (!response.ok) {
        return { title: null, description: null, faviconUrl, domain };
      }

      const html = await response.text();
      const title = extractTitle(html);
      const description = extractDescription(html);

      return { title, description, faviconUrl, domain };
    } catch {
      return { title: null, description: null, faviconUrl, domain };
    }
  },
});
