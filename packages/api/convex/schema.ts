import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  articles: defineTable({
    url: v.string(),
    title: v.union(v.string(), v.null()),
    description: v.union(v.string(), v.null()),
    faviconUrl: v.string(),
    domain: v.string(),
  }).index('by_url', ['url']),

  userArticles: defineTable({
    userId: v.string(),
    articleId: v.id('articles'),
    tags: v.array(v.string()),
    isRead: v.optional(v.boolean()),
    isArchived: v.optional(v.boolean()),
  })
    .index('by_userId', ['userId'])
    .index('by_userId_and_articleId', ['userId', 'articleId']),
});
