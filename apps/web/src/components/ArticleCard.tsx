import { ArticleActions } from '@/components/ArticleActions';
import { TagEditor } from '@/components/TagEditor';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Id } from '@rlist/api/convex/_generated/dataModel';

interface ArticleCardProps {
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

function CardCorners() {
  return (
    <>
      <div className="absolute -top-2 -left-2 w-4 h-4">
        <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-border -translate-x-1/2" />
      </div>
      <div className="absolute -top-2 -right-2 w-4 h-4">
        <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-border -translate-x-1/2" />
      </div>
      <div className="absolute -bottom-2 -left-2 w-4 h-4">
        <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-border -translate-x-1/2" />
      </div>
      <div className="absolute -bottom-2 -right-2 w-4 h-4">
        <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-border -translate-x-1/2" />
      </div>
    </>
  );
}

export function ArticleCard({
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
}: ArticleCardProps) {
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
      className="relative group h-full p-4 lg:p-6 cursor-pointer flex flex-col border-r border-b border-dashed border-border"
    >
      <CardCorners />
      <div className="flex items-center justify-between mb-3 md:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-[4px] bg-muted flex items-center justify-center overflow-hidden border border-border">
            {faviconUrl ? (
              <img src={faviconUrl} alt={domain} className="w-3 h-3 object-contain" />
            ) : (
              <div className="w-3 h-3 bg-muted-foreground/20 rounded-sm" />
            )}
          </div>
          <span className="text-[13px] font-medium text-muted-foreground font-mono tracking-tight">
            {domain}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[13px] text-muted-foreground font-medium">{date}</span>
          <ArticleActions articleId={id} isRead={isRead} isArchived={isArchived} />
        </div>
      </div>

      <div className="flex-1 mb-4 md:mb-8">
        <h3
          className={cn(
            'text-[19px] font-bold text-foreground mb-1 md:mb-3 leading-snug tracking-tight',
            'group-has-[.badge:hover]:text-foreground group-hover:text-primary transition-colors'
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            'text-[15px] text-muted-foreground leading-relaxed line-clamp-3 font-normal',
            'group-has-[.badge:hover]:text-muted-foreground group-hover:text-foreground transition-colors'
          )}
        >
          {description}
        </p>
      </div>

      <div className="mt-auto">
        <TagEditor
          articleId={id}
          initialTags={tags}
          activeTags={activeTags}
          onTagClick={onTagClick}
        />
      </div>
    </div>
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="relative h-full p-4 lg:p-6 flex flex-col border-r border-b border-dashed border-border">
      <CardCorners />
      <div className="flex items-center justify-between mb-3 md:mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-5 h-5 rounded-[4px]" />
          <Skeleton className="h-3.5 w-24" />
        </div>
        <Skeleton className="h-3.5 w-16" />
      </div>

      <div className="flex-1 mb-4 md:mb-8">
        <Skeleton className="h-5 w-full mb-2" />
        <Skeleton className="h-5 w-3/4 mb-3" />
        <Skeleton className="h-4 w-full mb-1.5" />
        <Skeleton className="h-4 w-full mb-1.5" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      <div className="mt-auto flex gap-2">
        <Skeleton className="h-6 w-14 rounded-full" />
        <Skeleton className="h-6 w-18 rounded-full" />
      </div>
    </div>
  );
}
