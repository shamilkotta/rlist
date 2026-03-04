import { AppLogo } from '@/components/AppLogo';
import { Link } from '@tanstack/react-router';

type PolicySection = {
  title: string;
  paragraphs: Array<string>;
  bullets?: Array<string>;
};

type PolicyPageProps = {
  title: string;
  effectiveDate: string;
  summary: string;
  sections: Array<PolicySection>;
  relatedLinks?: Array<{ label: string; to: string }>;
};

export function PolicyPage({
  title,
  effectiveDate,
  summary,
  sections,
  relatedLinks = [],
}: PolicyPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <AppLogo className="w-6 h-6" imgClassName="w-6 h-6" />
            <span>rlist</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              to="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              App privacy
            </Link>
            <Link
              to="/privacy/chrome-extension"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Extension privacy
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <p className="text-sm text-muted-foreground">Effective date: {effectiveDate}</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">{title}</h1>
        <p className="mt-4 text-muted-foreground leading-7">{summary}</p>

        {relatedLinks.length > 0 ? (
          <div className="mt-6 rounded-lg border border-border p-4 bg-muted/30">
            <p className="text-sm font-medium mb-2">Related policy pages</p>
            <div className="flex flex-wrap items-center gap-3">
              {relatedLinks.map((item) => (
                <Link key={item.to} to={item.to} className="text-sm text-primary hover:underline">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-8 space-y-8">
          {sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-muted-foreground leading-7">
                  {paragraph}
                </p>
              ))}
              {section.bullets ? (
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground leading-7">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
