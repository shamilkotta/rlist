import { Badge } from '@/components/ui/badge';

interface ArticleCardProps {
  title: string;
  description: string;
  domain: string;
  date: string;
  tags: string[];
  imageUrl?: string;
  faviconUrl?: string;
}

export function ArticleCard({
  title,
  description,
  domain,
  date,
  tags,
  faviconUrl,
}: ArticleCardProps) {
  return (
    <div className="relative group h-full p-8 cursor-pointer flex flex-col border-r border-b border-dashed border-border">
      {/* Corner crosses */}
      {/* Top-left corner */}
      <div className="absolute -top-2 -left-2 w-4 h-4">
        <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-border -translate-x-1/2" />
      </div>
      {/* Top-right corner */}
      <div className="absolute -top-2 -right-2 w-4 h-4">
        <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-border -translate-x-1/2" />
      </div>
      {/* Bottom-left corner */}
      <div className="absolute -bottom-2 -left-2 w-4 h-4">
        <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-border -translate-x-1/2" />
      </div>
      {/* Bottom-right corner */}
      <div className="absolute -bottom-2 -right-2 w-4 h-4">
        <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-border -translate-x-1/2" />
      </div>
      <div className="flex items-center justify-between mb-6">
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
        <span className="text-[13px] text-muted-foreground font-medium">{date}</span>
      </div>

      <div className="flex-1 mb-8">
        <h3 className="text-[19px] font-bold text-foreground mb-3 leading-snug group-hover:text-primary transition-colors tracking-tight">
          {title}
        </h3>
        <p className="text-[15px] text-muted-foreground leading-relaxed line-clamp-3 font-normal group-hover:text-foreground transition-colors">
          {description}
        </p>
      </div>

      <div className="mt-auto flex items-center gap-2 flex-wrap">
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
    </div>
  );
}
