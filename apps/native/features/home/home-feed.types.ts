export type TabFilter = 'unread' | 'all' | 'archive';

export type PaginationStatus = 'LoadingFirstPage' | 'CanLoadMore' | 'LoadingMore' | 'Exhausted';

export type DisplayArticle = {
  articleId: string;
  url: string;
  title: string | null;
  description: string | null;
  domain: string;
  faviconUrl: string;
  tags: string[];
  isRead: boolean;
  isArchived: boolean;
  creationTime: number;
};
