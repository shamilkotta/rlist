import { ConvexError, v } from 'convex/values';
import { internal } from './_generated/api';
import type { Id } from './_generated/dataModel';
import { action, internalMutation, internalQuery, mutation, query } from './_generated/server';
import { authComponent } from './auth';

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

export function normalizeUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, '');
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

type FetchMetadataResult = {
  title: string | null;
  description: string | null;
  faviconUrl: string;
  domain: string;
};

export const fetchMetadata = action({
  args: { url: v.string() },
  returns: v.object({
    title: v.union(v.string(), v.null()),
    description: v.union(v.string(), v.null()),
    faviconUrl: v.string(),
    domain: v.string(),
  }),
  handler: async (_ctx, args) => {
    const normalizedUrl = normalizeUrl(args.url);

    const existingArticle = (await _ctx.runQuery(internal.articles.getArticleByUrl, {
      url: normalizedUrl,
    })) as FetchMetadataResult | null;

    if (existingArticle) {
      return {
        title: existingArticle.title,
        description: existingArticle.description,
        faviconUrl: existingArticle.faviconUrl,
        domain: existingArticle.domain,
      };
    }

    return await fetchMetadataForUrl(normalizedUrl);
  },
});

const metadataValidator = v.object({
  title: v.union(v.string(), v.null()),
  description: v.union(v.string(), v.null()),
  faviconUrl: v.string(),
  domain: v.string(),
});

async function fetchMetadataForUrl(url: string) {
  const fullUrl = normalizeUrl(url);
  let domain: string;
  try {
    domain = new URL(fullUrl).hostname;
  } catch {
    return {
      title: null,
      description: null,
      faviconUrl: `https://www.google.com/s2/favicons?domain=${url}&sz=32`,
      domain: url,
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
}

export const getArticleByUrl = internalQuery({
  args: { url: v.string() },
  returns: v.union(
    v.object({
      _id: v.id('articles'),
      _creationTime: v.number(),
      url: v.string(),
      title: v.union(v.string(), v.null()),
      description: v.union(v.string(), v.null()),
      faviconUrl: v.string(),
      domain: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const normalizedUrl = normalizeUrl(args.url);
    return await ctx.db
      .query('articles')
      .withIndex('by_url', (q) => q.eq('url', normalizedUrl))
      .unique();
  },
});

export const addArticleInternal = internalMutation({
  args: {
    userId: v.string(),
    url: v.string(),
    tags: v.array(v.string()),
    metadata: metadataValidator,
  },
  returns: v.object({
    articleId: v.id('articles'),
    userArticleId: v.id('userArticles'),
  }),
  handler: async (ctx, args) => {
    const normalizedUrl = normalizeUrl(args.url);

    const article = await ctx.db
      .query('articles')
      .withIndex('by_url', (q) => q.eq('url', normalizedUrl))
      .unique();

    let articleId: Id<'articles'>;
    if (!article) {
      articleId = await ctx.db.insert('articles', {
        url: normalizedUrl,
        title: args.metadata.title,
        description: args.metadata.description,
        faviconUrl: args.metadata.faviconUrl,
        domain: args.metadata.domain,
      });
    } else {
      articleId = article._id;
    }

    const existingUserArticle = await ctx.db
      .query('userArticles')
      .withIndex('by_userId_and_articleId', (q) =>
        q.eq('userId', args.userId).eq('articleId', articleId)
      )
      .unique();

    if (existingUserArticle) {
      throw new ConvexError({
        code: 'ALREADY_SAVED_ARTICLE',
        message: 'You have already saved this article',
      });
    }

    const userArticleId = await ctx.db.insert('userArticles', {
      userId: args.userId,
      articleId,
      tags: args.tags,
    });

    return { articleId, userArticleId };
  },
});

export const addArticle = action({
  args: {
    url: v.string(),
    tags: v.array(v.string()),
  },
  returns: v.object({
    articleId: v.id('articles'),
    userArticleId: v.id('userArticles'),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{ articleId: Id<'articles'>; userArticleId: Id<'userArticles'> }> => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new ConvexError({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required',
      });
    }

    const userId = user._id.toString();
    const normalizedUrl = normalizeUrl(args.url);

    if (!normalizedUrl) {
      throw new ConvexError({
        code: 'INVALID_URL',
        message: 'Invalid URL',
      });
    }

    const tags = args.tags
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean)
      .slice(0, 2);
    for (const tag of tags) {
      if (tag.length > 15) {
        throw new ConvexError({
          code: 'TAG_TOO_LONG',
          message: 'Each tag must be at most 15 characters',
        });
      }
    }

    const existingArticle = await ctx.runQuery(internal.articles.getArticleByUrl, {
      url: normalizedUrl,
    });

    let metadata: {
      title: string | null;
      description: string | null;
      faviconUrl: string;
      domain: string;
    };
    if (existingArticle) {
      metadata = {
        title: existingArticle.title,
        description: existingArticle.description,
        faviconUrl: existingArticle.faviconUrl,
        domain: existingArticle.domain,
      };
    } else {
      metadata = await fetchMetadataForUrl(normalizedUrl);
    }

    return await ctx.runMutation(internal.articles.addArticleInternal, {
      userId,
      url: normalizedUrl,
      tags,
      metadata,
    });
  },
});

export const updateArticleTags = mutation({
  args: {
    articleId: v.id('articles'),
    tags: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new ConvexError({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required',
      });
    }

    const tags = [...new Set(args.tags.map((t) => t.trim().toUpperCase()).filter(Boolean))].slice(
      0,
      2
    );
    for (const tag of tags) {
      if (tag.length > 15) {
        throw new ConvexError({
          code: 'TAG_TOO_LONG',
          message: 'Each tag must be at most 15 characters',
        });
      }
    }

    const userId = user._id.toString();
    const userArticle = await ctx.db
      .query('userArticles')
      .withIndex('by_userId_and_articleId', (q) =>
        q.eq('userId', userId).eq('articleId', args.articleId)
      )
      .unique();

    if (!userArticle) {
      throw new ConvexError({
        code: 'ARTICLE_NOT_FOUND',
        message: 'Article not found',
      });
    }

    await ctx.db.patch(userArticle._id, { tags });
    return null;
  },
});

export const listUserArticles = query({
  args: {},
  returns: v.array(
    v.object({
      articleId: v.id('articles'),
      url: v.string(),
      title: v.union(v.string(), v.null()),
      description: v.union(v.string(), v.null()),
      domain: v.string(),
      faviconUrl: v.string(),
      tags: v.array(v.string()),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new ConvexError({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required',
      });
    }

    const userId = user._id.toString();
    const userArticles = await ctx.db
      .query('userArticles')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .order('desc')
      .collect();

    const result = [];
    for (const ua of userArticles) {
      const article = await ctx.db.get(ua.articleId);
      if (article) {
        result.push({
          articleId: article._id,
          url: article.url,
          title: article.title,
          description: article.description,
          domain: article.domain,
          faviconUrl: article.faviconUrl,
          tags: ua.tags,
          _creationTime: ua._creationTime,
        });
      }
    }

    return result;
  },
});
