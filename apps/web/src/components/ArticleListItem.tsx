import { ArticleActions } from '@/components/ArticleActions';
import { TagEditor } from '@/components/TagEditor';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Id } from '@rlist/api/convex/_generated/dataModel';

interface ArticleListItemProps {
  id: Id<'articles'>;
  url: string;
  title: string;
  description: string;
  domain: string;
  date: string;
  tags: string[];
  imageUrl?: string;
  faviconUrl?: string;
  isRead: boolean;
  isArchived: boolean;
  activeTags?: string[];
  onTagClick?: (_tag: string) => void;
}

export function ArticleListItem({
  id,
  url,
  title,
  description,
  domain,
  date,
  tags,
  faviconUrl,
  isRead,
  isArchived,
  activeTags,
  onTagClick,
}: ArticleListItemProps) {
  const openArticle = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={openArticle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openArticle();
        }
      }}
      className="relative group py-5 px-4 cursor-pointer flex flex-col gap-1.5 border-r border-b border-dashed border-border"
    >
      <ListItemCorners />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-5 h-5 rounded-[4px] bg-muted flex items-center justify-center overflow-hidden border border-border shrink-0">
            {faviconUrl ? (
              <img src={faviconUrl} alt={domain} className="w-3 h-3 object-contain" />
            ) : (
              <div className="w-3 h-3 bg-muted-foreground/20 rounded-sm" />
            )}
          </div>
          <span className="text-[13px] font-medium text-muted-foreground font-mono tracking-tight shrink-0">
            {domain}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <TagEditor
            articleId={id}
            initialTags={tags}
            activeTags={activeTags}
            onTagClick={onTagClick}
          />
          <span className="text-[13px] text-muted-foreground font-medium whitespace-nowrap">
            {date}
          </span>
          <ArticleActions articleId={id} isRead={isRead} isArchived={isArchived} />
        </div>
      </div>

      <h3
        className={cn(
          'text-[15px] font-bold text-foreground leading-snug tracking-tight line-clamp-1 ',
          'group-has-[.badge:hover]:text-foreground group-hover:text-primary transition-colors'
        )}
      >
        {title}
      </h3>

      <p
        className={cn(
          'text-[13px] text-muted-foreground leading-relaxed line-clamp-1 font-normal ',
          'group-has-[.badge:hover]:text-muted-foreground group-hover:text-foreground transition-colors'
        )}
      >
        {description}
      </p>
    </div>
  );
}

function ListItemCorners() {
  return (
    <>
      <div className="absolute -left-2 -top-2 w-4 h-4">
        <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-border -translate-x-1/2" />
      </div>
      <div className="absolute -left-2 -bottom-2 w-4 h-4">
        <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-border -translate-x-1/2" />
      </div>
      <div className="absolute -right-2 -top-2 w-4 h-4">
        <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-border -translate-x-1/2" />
      </div>
      <div className="absolute -right-2 -bottom-2 w-4 h-4">
        <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-border -translate-x-1/2" />
      </div>
    </>
  );
}

export function ArticleListItemSkeleton() {
  return (
    <div className="relative py-5 px-4 flex flex-col gap-1.5 border-r border-b border-dashed border-border">
      <ListItemCorners />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Skeleton className="w-5 h-5 rounded-[4px] shrink-0" />
          <Skeleton className="h-3.5 w-28" />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>
      </div>

      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3.5 w-1/2" />
    </div>
  );
}
