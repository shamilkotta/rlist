import type { Id } from '@rlist/api/convex/_generated/dataModel';
import { formatRelativeDate } from './date';

export type ArticleForDisplay = {
  id: Id<'articles'>;
  url: string;
  title: string;
  description: string;
  domain: string;
  date: string;
  tags: string[];
  faviconUrl: string;
};

type RawArticle = {
  articleId: Id<'articles'>;
  url: string;
  title: string | null;
  description: string | null;
  domain: string;
  faviconUrl: string;
  tags: string[];
  _creationTime: number;
};

export function mapArticlesForDisplay(articles: RawArticle[] | undefined): ArticleForDisplay[] {
  if (!articles) return [];

  return articles.map((a) => ({
    id: a.articleId,
    url: a.url,
    title: a.title ?? a.domain,
    description: a.description ?? '',
    domain: a.domain,
    date: formatRelativeDate(a._creationTime),
    tags: a.tags,
    faviconUrl: a.faviconUrl,
  }));
}
