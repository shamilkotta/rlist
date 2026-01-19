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
    <div className="group relative bg-white border border-gray-100 rounded-xl p-8 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-gray-200 transition-all duration-200 flex flex-col h-full cursor-pointer">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-[4px] bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
            {faviconUrl ? (
              <img src={faviconUrl} alt={domain} className="w-3 h-3 object-contain" />
            ) : (
              <div className="w-3 h-3 bg-gray-200 rounded-sm" />
            )}
          </div>
          <span className="text-[13px] font-medium text-gray-500 font-mono tracking-tight">
            {domain}
          </span>
        </div>
        <span className="text-[13px] text-gray-400 font-medium">{date}</span>
      </div>

      <div className="flex-1 mb-8">
        <h3 className="text-[19px] font-bold text-gray-900 mb-3 leading-snug group-hover:text-gray-900 tracking-tight">
          {title}
        </h3>
        <p className="text-[15px] text-gray-500 leading-relaxed line-clamp-3 font-normal">
          {description}
        </p>
      </div>

      <div className="mt-auto flex items-center gap-2 flex-wrap">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-50 border border-gray-200/60 text-[11px] font-semibold text-gray-500 uppercase tracking-wider"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
