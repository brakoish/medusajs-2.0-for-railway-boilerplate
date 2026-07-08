import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { BlogArticle, blogArticles } from "./articles"

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`))

export const BlogIndexTemplate = () => {
  return (
    <main className="bg-white">
      <section className="border-b border-gray-100">
        <div className="content-container py-12 small:py-20">
          <div className="max-w-[20rem] small:max-w-3xl">
            <span className="text-xs uppercase tracking-[0.25em] text-amber-700">
              Dab Pal guide
            </span>
            <h1 className="mt-4 text-4xl small:text-6xl font-semibold tracking-tight leading-[1.05] text-gray-950">
              Puffco, banger, and dab swab cleaning guides.
            </h1>
            <p className="mt-5 max-w-2xl text-base small:text-lg leading-relaxed text-gray-600">
              Practical cleaning notes for Puffco, e-rig, and quartz banger
              users who want swabs, iso, and gear organized without making a
              whole thing out of it.
            </p>
          </div>
        </div>
      </section>

      <section className="content-container py-10 small:py-16">
        <div className="grid grid-cols-1 small:grid-cols-2 gap-4 small:gap-6">
          {blogArticles.map((article) => (
            <LocalizedClientLink
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group max-w-[20rem] small:max-w-none rounded-lg border border-gray-200 bg-white p-5 small:p-6 transition hover:border-amber-300 hover:shadow-elevation-card-rest"
            >
              <span className="text-xs uppercase tracking-[0.22em] text-amber-700">
                {article.eyebrow}
              </span>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-gray-950 group-hover:text-amber-800">
                {article.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                {article.description}
              </p>
              <div className="mt-5 flex items-center gap-3 text-xs text-gray-500">
                <span>{formatDate(article.updatedAt)}</span>
                <span aria-hidden>•</span>
                <span>{article.readingMinutes} min read</span>
              </div>
            </LocalizedClientLink>
          ))}
        </div>
      </section>
    </main>
  )
}

export const BlogArticleTemplate = ({ article }: { article: BlogArticle }) => {
  const related = blogArticles
    .filter((item) => item.slug !== article.slug)
    .slice(0, 3)

  return (
    <main className="bg-white">
      <article>
        <header className="border-b border-gray-100">
          <div className="content-container py-10 small:py-16">
            <LocalizedClientLink
              href="/blog"
              className="text-sm text-gray-500 hover:text-gray-950"
            >
              Back to guides
            </LocalizedClientLink>
            <div className="mt-8 max-w-[20rem] small:max-w-3xl">
              <span className="text-xs uppercase tracking-[0.25em] text-amber-700">
                {article.eyebrow}
              </span>
              <h1 className="mt-4 text-4xl small:text-6xl font-semibold tracking-tight leading-[1.05] text-gray-950">
                {article.title}
              </h1>
              <p className="mt-5 text-base small:text-lg leading-relaxed text-gray-600">
                {article.description}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span>Updated {formatDate(article.updatedAt)}</span>
                <span aria-hidden>•</span>
                <span>{article.readingMinutes} min read</span>
              </div>
            </div>
          </div>
        </header>

        <div className="content-container grid grid-cols-1 large:grid-cols-[minmax(0,760px)_minmax(260px,1fr)] gap-10 large:gap-16 py-10 small:py-16">
          <div className="max-w-[20rem] small:max-w-none">
            <div className="space-y-5 text-lg leading-8 text-gray-700">
              {article.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-10 space-y-10">
              {article.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-2xl small:text-3xl font-semibold tracking-tight text-gray-950">
                    {section.heading}
                  </h2>
                  <div className="mt-4 space-y-4 text-base leading-7 text-gray-700">
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {article.sourceUrl && (
              <p className="mt-10 rounded-lg border border-gray-200 bg-zinc-50 p-4 text-sm leading-relaxed text-gray-600">
                Care reference:{" "}
                <a
                  href={article.sourceUrl}
                  className="font-medium text-amber-800 hover:text-amber-900"
                  rel="noreferrer"
                  target="_blank"
                >
                  {article.sourceLabel}
                </a>
                .
              </p>
            )}

            <section className="mt-12 border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-950">
                Quick answers
              </h2>
              <div className="mt-5 divide-y divide-gray-200">
                {article.faq.map((item) => (
                  <div key={item.q} className="py-5">
                    <h3 className="text-base font-semibold text-gray-950">
                      {item.q}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="large:sticky large:top-28 self-start space-y-4">
            <div className="rounded-lg border border-gray-200 bg-zinc-50 p-5">
              <h2 className="text-sm font-semibold text-gray-950">
                Keep the kit together
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Dab Pal holds 30 Q-tips, a 1oz iso bottle, and a slider for
                clean vs dirty swabs.
              </p>
              <LocalizedClientLink
                href="/store"
                className="mt-4 inline-flex rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                Shop Dab Pal
              </LocalizedClientLink>
            </div>

            <div className="rounded-lg border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-950">
                More guides
              </h2>
              <div className="mt-3 space-y-3">
                {related.map((item) => (
                  <LocalizedClientLink
                    key={item.slug}
                    href={`/blog/${item.slug}`}
                    className="block text-sm leading-snug text-gray-600 hover:text-amber-800"
                  >
                    {item.title}
                  </LocalizedClientLink>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </article>
    </main>
  )
}
