import { Link, useParams } from "react-router-dom";
import { ArrowRight, BookOpen, MessageCircle, Search } from "lucide-react";
import { SEO } from "../components/SEO";
import { getSeoTopic, seoTopics } from "../config/seoTopics";
import { NotFoundPage } from "./NotFoundPage";

export default function SeoTopicPage() {
  const { slug } = useParams();
  const topic = getSeoTopic(slug);

  if (!topic) {
    return <NotFoundPage />;
  }

  const canonical = `https://maatfeed.com/${topic.slug}`;
  const exploreUrl = `/?q=${encodeURIComponent(topic.relatedQueries[0] ?? topic.title)}`;

  return (
    <>
      <SEO
        title={`${topic.title} - MAATFEED`}
        description={topic.description}
        keywords={topic.keywords}
        canonical={canonical}
        url={canonical}
        type="article"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${topic.title} - MAATFEED`,
          description: topic.description,
          url: canonical,
          isPartOf: {
            "@type": "WebSite",
            name: "MAATFEED",
            url: "https://maatfeed.com"
          },
          about: topic.keywords.map((keyword) => ({ "@type": "Thing", name: keyword }))
        }}
      />

      <main className="px-4 pb-28 pt-4 lg:px-0 lg:pb-12">
        <article className="mx-auto max-w-4xl">
          <nav className="mb-5 flex flex-wrap gap-2 text-sm" aria-label="Themes MAATFEED">
            {seoTopics.map((item) => (
              <Link
                key={item.slug}
                to={`/${item.slug}`}
                className={`rounded-md border px-3 py-2 transition ${
                  item.slug === topic.slug
                    ? "border-gold/40 bg-gold/15 text-gold"
                    : "border-white/10 bg-white/[0.04] text-sand/70 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                {item.shortTitle}
              </Link>
            ))}
          </nav>

          <header className="rounded-lg border border-white/10 bg-white/[0.035] p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-gold/78">Guide MAATFEED</p>
            <h1 className="mt-3 font-display text-4xl text-white md:text-5xl">{topic.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-sand/75">{topic.intro}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={exploreUrl}
                className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-3 text-sm font-semibold text-ink transition hover:bg-gold/90"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Explorer les contenus
              </Link>
              <Link
                to="/community"
                className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-sand/78 transition hover:bg-white/[0.08] hover:text-white"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Voir les debats
              </Link>
            </div>
          </header>

          <div className="mt-6 grid gap-4">
            {topic.sections.map((section) => (
              <section key={section.heading} className="rounded-lg border border-white/10 bg-white/[0.03] p-5 md:p-6">
                <div className="flex items-start gap-3">
                  <BookOpen className="mt-1 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
                  <div>
                    <h2 className="text-xl font-semibold text-white">{section.heading}</h2>
                    <p className="mt-3 text-sm leading-7 text-sand/72">{section.body}</p>
                  </div>
                </div>
              </section>
            ))}
          </div>

          <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-5 md:p-6">
            <h2 className="text-xl font-semibold text-white">Recherches liees</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {topic.relatedQueries.map((query) => (
                <Link
                  key={query}
                  to={`/?q=${encodeURIComponent(query)}`}
                  className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-sand/72 transition hover:bg-white/[0.08] hover:text-white"
                >
                  {query}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
