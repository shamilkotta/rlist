import { Badge } from '@repo/ui';

interface ArticleListItemProps {
  title: string;
  description: string;
  domain: string;
  date: string;
  tags: string[];
  imageUrl?: string;
  faviconUrl?: string;
}

export function ArticleListItem({
  title,
  description,
  domain,
  date,
  tags,
  faviconUrl,
}: ArticleListItemProps) {
  return (
    <div className="relative group bg-card py-3 px-4 cursor-pointer flex flex-col gap-1.5 border-r border-b border-dashed border-border">
      {/* Corner crosses */}
      {/* Left-top corner */}
      <div className="absolute -left-2 -top-2 w-4 h-4">
        <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-border -translate-x-1/2" />
      </div>
      {/* Left-bottom corner */}
      <div className="absolute -left-2 -bottom-2 w-4 h-4">
        <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-border -translate-x-1/2" />
      </div>
      {/* Right-top corner */}
      <div className="absolute -right-2 -top-2 w-4 h-4">
        <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-border -translate-x-1/2" />
      </div>
      {/* Right-bottom corner */}
      <div className="absolute -right-2 -bottom-2 w-4 h-4">
        <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-border -translate-x-1/2" />
      </div>

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
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <span className="text-[13px] text-muted-foreground font-medium whitespace-nowrap">
            {date}
          </span>
        </div>
      </div>

      <h3 className="text-[15px] font-bold text-foreground leading-snug group-hover:text-primary transition-colors tracking-tight line-clamp-1 ">
        {title}
      </h3>

      <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-1 font-normal group-hover:text-foreground transition-colors ">
        {description}
      </p>
    </div>
  );
}
