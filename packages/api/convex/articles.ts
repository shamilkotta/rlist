import { paginationOptsValidator } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import { internal } from './_generated/api';
import type { Id } from './_generated/dataModel';
import { action, internalMutation, internalQuery, mutation, query } from './_generated/server';
import { authComponent } from './auth';

const FETCH_TIMEOUT_MS = 10_000;
const FETCH_MAX_BODY_BYTES = 5 * 1024 * 1024; // 5MB

const ALLOWED_PORTS = new Set([80, 443]);
const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^localhost$/i,
  /^\[::1\]$/,
  /^\[fe80:/i,
];

function isPrivateOrReservedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (lower === 'localhost' || lower.endsWith('.localhost')) return true;
  if (lower === '169.254.169.254') return true; // cloud metadata
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname)) return true;
  }
  return false;
}

const BLOCKED_SCHEMES = /^(javascript|file|data|vbscript):/i;

export function validateAndNormalizeArticleUrl(input: string): string | null {
  const trimmed = input.trim().replace(/\/+$/, '');
  if (!trimmed) return null;
  if (BLOCKED_SCHEMES.test(trimmed)) return null;

  let url: URL;
  try {
    const toParse = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    url = new URL(toParse);
  } catch {
    return null;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  const portNum = url.port ? Number.parseInt(url.port, 10) : url.protocol === 'https:' ? 443 : 80;
  if (!Number.isNaN(portNum) && !ALLOWED_PORTS.has(portNum)) return null;
  if (isPrivateOrReservedHost(url.hostname)) return null;

  return url.href;
}

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

type FetchMetadataResult = {
  title: string | null;
  description: string | null;
  faviconUrl: string;
  domain: string;
};

const TAG_MAX_LENGTH = 15;
const MAX_USER_TAGS = 2;
const MAX_FILTER_TAGS = 12;

function normalizeUserTags(tags: string[]): string[] {
  const normalized = [...new Set(tags.map((t) => t.trim().toUpperCase()).filter(Boolean))].slice(
    0,
    MAX_USER_TAGS
  );
  for (const tag of normalized) {
    if (tag.length > TAG_MAX_LENGTH) {
      throw new ConvexError({
        code: 'TAG_TOO_LONG',
        message: 'Each tag must be at most 15 characters',
      });
    }
  }
  return normalized;
}

function normalizeTagFilters(tags: string[]): string[] {
  return [...new Set(tags.map((tag) => tag.trim().toUpperCase()).filter(Boolean))]
    .filter((tag) => tag.length <= TAG_MAX_LENGTH)
    .slice(0, MAX_FILTER_TAGS);
}

function hasMatchingTag(articleTags: string[], selectedTags: string[]): boolean {
  if (selectedTags.length === 0) {
    return true;
  }

  return articleTags.some((tag) => selectedTags.includes(tag));
}

export const fetchMetadata = action({
  args: { url: v.string() },
  returns: v.object({
    title: v.union(v.string(), v.null()),
    description: v.union(v.string(), v.null()),
    faviconUrl: v.string(),
    domain: v.string(),
  }),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new ConvexError({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required',
      });
    }

    const normalizedUrl = validateAndNormalizeArticleUrl(args.url);
    if (!normalizedUrl) {
      throw new ConvexError({
        code: 'INVALID_URL',
        message: 'Invalid URL',
      });
    }

    const existingArticle = (await ctx.runQuery(internal.articles.getArticleByUrl, {
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
  let domain: string;
  try {
    domain = new URL(url).hostname;
  } catch {
    return {
      title: null,
      description: null,
      faviconUrl: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url)}&sz=32`,
      domain: url,
    };
  }

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RListBot/1.0; +https://rlist.app)',
        Accept: 'text/html',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { title: null, description: null, faviconUrl, domain };
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.toLowerCase().includes('text/html')) {
      return { title: null, description: null, faviconUrl, domain };
    }

    const reader = response.body?.getReader();
    if (!reader) {
      return { title: null, description: null, faviconUrl, domain };
    }

    let html = '';
    let totalBytes = 0;
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > FETCH_MAX_BODY_BYTES) break;
      html += decoder.decode(value, { stream: true });
    }

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
    return await ctx.db
      .query('articles')
      .withIndex('by_url', (q) => q.eq('url', args.url))
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
    const article = await ctx.db
      .query('articles')
      .withIndex('by_url', (q) => q.eq('url', args.url))
      .unique();

    let articleId: Id<'articles'>;
    if (!article) {
      articleId = await ctx.db.insert('articles', {
        url: args.url,
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
      isRead: false,
      isArchived: false,
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
    const normalizedUrl = validateAndNormalizeArticleUrl(args.url);

    if (!normalizedUrl) {
      throw new ConvexError({
        code: 'INVALID_URL',
        message: 'Invalid URL',
      });
    }

    const tags = normalizeUserTags(args.tags);

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

    const tags = normalizeUserTags(args.tags);
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

// TODO: revisit this query
export const searchUserArticles = query({
  args: { query: v.string() },
  returns: v.array(
    v.object({
      articleId: v.id('articles'),
      url: v.string(),
      title: v.union(v.string(), v.null()),
      description: v.union(v.string(), v.null()),
      domain: v.string(),
      faviconUrl: v.string(),
      tags: v.array(v.string()),
      isRead: v.optional(v.boolean()),
      isArchived: v.optional(v.boolean()),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new ConvexError({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required',
      });
    }

    const searchQuery = args.query.trim().toLowerCase();
    if (!searchQuery) return [];

    const terms = searchQuery.split(/\s+/).filter(Boolean);
    const userId = user._id.toString();

    const userArticles = await ctx.db
      .query('userArticles')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .order('desc')
      .collect();

    const result = [];
    for (const ua of userArticles) {
      if (result.length >= 10) break;
      if (ua.isArchived) continue;

      const article = await ctx.db.get(ua.articleId);
      if (!article) continue;

      const searchable = [article.title, article.description, article.url]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (!terms.every((term) => searchable.includes(term))) continue;

      result.push({
        articleId: article._id,
        url: article.url,
        title: article.title,
        description: article.description,
        domain: article.domain,
        faviconUrl: article.faviconUrl,
        tags: ua.tags,
        isRead: ua.isRead,
        isArchived: ua.isArchived,
        _creationTime: ua._creationTime,
      });
    }

    return result;
  },
});

const userArticleListItemValidator = v.object({
  articleId: v.id('articles'),
  url: v.string(),
  title: v.union(v.string(), v.null()),
  description: v.union(v.string(), v.null()),
  domain: v.string(),
  faviconUrl: v.string(),
  tags: v.array(v.string()),
  isRead: v.optional(v.boolean()),
  isArchived: v.optional(v.boolean()),
  _creationTime: v.number(),
});

export const listUserArticles = query({
  args: {
    paginationOpts: paginationOptsValidator,
    filter: v.optional(v.union(v.literal('unread'), v.literal('all'), v.literal('archive'))),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.object({
    page: v.array(userArticleListItemValidator),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new ConvexError({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required',
      });
    }

    const filter = args.filter ?? 'unread';
    const tags = normalizeTagFilters(args.tags ?? []);
    const userId = user._id.toString();
    const userArticles =
      filter === 'archive'
        ? await ctx.db
            .query('userArticles')
            .withIndex('by_userId_and_isArchived', (q) =>
              q.eq('userId', userId).eq('isArchived', true)
            )
            .order('desc')
            .paginate(args.paginationOpts)
        : filter === 'all'
          ? await ctx.db
              .query('userArticles')
              .withIndex('by_userId_and_isArchived', (q) =>
                q.eq('userId', userId).eq('isArchived', false)
              )
              .order('desc')
              .paginate(args.paginationOpts)
          : await ctx.db
              .query('userArticles')
              .withIndex('by_userId_and_isArchived_and_isRead', (q) =>
                q.eq('userId', userId).eq('isArchived', false).eq('isRead', false)
              )
              .order('desc')
              .paginate(args.paginationOpts);

    const page = [];
    for (const ua of userArticles.page) {
      if (!hasMatchingTag(ua.tags, tags)) {
        continue;
      }

      const article = await ctx.db.get(ua.articleId);
      if (article) {
        page.push({
          articleId: article._id,
          url: article.url,
          title: article.title,
          description: article.description,
          domain: article.domain,
          faviconUrl: article.faviconUrl,
          tags: ua.tags,
          isRead: ua.isRead,
          isArchived: ua.isArchived,
          _creationTime: ua._creationTime,
        });
      }
    }

    return {
      page,
      isDone: userArticles.isDone,
      continueCursor: userArticles.continueCursor,
    };
  },
});

export const listUserTags = query({
  args: {
    filter: v.optional(v.union(v.literal('unread'), v.literal('all'), v.literal('archive'))),
  },
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new ConvexError({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required',
      });
    }

    const filter = args.filter ?? 'unread';
    const userId = user._id.toString();
    const userArticles =
      filter === 'archive'
        ? await ctx.db
            .query('userArticles')
            .withIndex('by_userId_and_isArchived', (q) =>
              q.eq('userId', userId).eq('isArchived', true)
            )
            .order('desc')
            .collect()
        : filter === 'all'
          ? await ctx.db
              .query('userArticles')
              .withIndex('by_userId_and_isArchived', (q) =>
                q.eq('userId', userId).eq('isArchived', false)
              )
              .order('desc')
              .collect()
          : await ctx.db
              .query('userArticles')
              .withIndex('by_userId_and_isArchived_and_isRead', (q) =>
                q.eq('userId', userId).eq('isArchived', false).eq('isRead', false)
              )
              .order('desc')
              .collect();

    const tags = normalizeTagFilters(userArticles.flatMap((article) => article.tags));
    return tags.sort((left, right) => left.localeCompare(right));
  },
});

export const toggleReadStatus = mutation({
  args: { articleId: v.id('articles') },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new ConvexError({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required',
      });
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

    await ctx.db.patch(userArticle._id, { isRead: !userArticle.isRead });
    return null;
  },
});

export const toggleArchiveStatus = mutation({
  args: { articleId: v.id('articles') },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new ConvexError({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required',
      });
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

    await ctx.db.patch(userArticle._id, { isArchived: !userArticle.isArchived });
    return null;
  },
});

export const deleteArticle = mutation({
  args: { articleId: v.id('articles') },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new ConvexError({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required',
      });
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

    await ctx.db.delete(userArticle._id);
    return null;
  },
});
