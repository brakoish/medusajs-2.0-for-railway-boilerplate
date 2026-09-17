import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { BlogArticle, blogArticles } from "./articles"
import { BlogTextCover } from "./text-cover"
import { GuideProductLink } from "./product-link"

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`))

const getRelatedArticles = (article: BlogArticle) =>
  blogArticles
    .filter((item) => item.slug !== article.slug)
    .map((item) => ({
      article: item,
      score: item.keywords.filter((keyword) =>
        article.keywords.includes(keyword)
      ).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.article)

export const BlogIndexTemplate = () => {
  return (
    <main className="bg-white">
      <section className="border-b border-gray-100">
        <div className="content-container py-12 small:py-20">
          <div className="max-w-3xl">
            <span className="text-xs uppercase tracking-[0.25em] text-amber-700">
              Field notes
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

      <nav aria-label="Guide topics" className="content-container pt-8 flex flex-wrap gap-4">
        <LocalizedClientLink className="studio-text-link" href="/blog/how-to-clean-puffco-peak-pro-proxy">Puffco by model</LocalizedClientLink>
        <LocalizedClientLink className="studio-text-link" href="/blog/best-swabs-for-dabs">Swab selection</LocalizedClientLink>
        <LocalizedClientLink className="studio-text-link" href="/blog/how-to-clean-a-quartz-banger">Banger care</LocalizedClientLink>
        <LocalizedClientLink className="studio-text-link" href="/blog/dab-terms-glossary">Dab dictionary</LocalizedClientLink>
      </nav>
      <section className="content-container py-10 small:py-16">
        <div className="grid grid-cols-1 small:grid-cols-2 gap-4 small:gap-6">
          {blogArticles.map((article) => (
            <LocalizedClientLink
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group min-w-0 rounded-lg border border-gray-200 bg-white transition hover:border-amber-300 hover:shadow-elevation-card-rest"
            >
              <div className="overflow-hidden rounded-t-lg">
                <BlogTextCover article={article} />
              </div>
              <div className="p-5 small:p-6">
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
              </div>
            </LocalizedClientLink>
          ))}
        </div>
      </section>
    </main>
  )
}

export const BlogArticleTemplate = ({ article }: { article: BlogArticle }) => {
  const related = getRelatedArticles(article)

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
            <div className="mt-8 max-w-3xl">
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
                <LocalizedClientLink href="/about" className="underline">By Dab Pal</LocalizedClientLink>
                <span aria-hidden>•</span>
                <span>Updated {formatDate(article.updatedAt)}</span>
                <span aria-hidden>•</span>
                <span>{article.readingMinutes} min read</span>
              </div>
            </div>
          </div>
        </header>

        <div className="content-container grid grid-cols-1 large:grid-cols-[minmax(0,760px)_minmax(260px,1fr)] gap-10 large:gap-16 py-10 small:py-16">
          <div className="min-w-0">
            <div className="space-y-5 text-lg leading-8 text-gray-700">
              {article.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <nav aria-label="On this page" className="mt-8 border-y border-gray-200 py-5">
              <h2 className="font-semibold mb-3">In this guide</h2>
              <ul className="grid gap-2">{article.sections.map((section, index) => <li key={section.heading}><a className="underline text-sm leading-6" href={`#guide-section-${index}`}>{section.heading}</a></li>)}</ul>
            </nav>
            {article.howTo && (
              <section className="mt-10 rounded-lg border border-gray-200 bg-zinc-50 p-5 small:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-2xl font-semibold tracking-tight text-gray-950">
                    Quick steps
                  </h2>
                  <span className="text-sm text-gray-500">
                    {article.howTo.steps.length} steps
                  </span>
                </div>
                <ol className="mt-5 grid gap-4">
                  {article.howTo.steps.map((step, index) => (
                    <li key={step} className="flex gap-3 text-sm leading-6">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-gray-700 shadow-borders-base">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {article.guideLinks && (
              <nav
                aria-label="Related cleaning guides"
                className="mt-8 grid gap-3 small:grid-cols-2"
              >
                {article.guideLinks.map((link) => (
                  <LocalizedClientLink
                    key={link.slug}
                    href={`/blog/${link.slug}`}
                    className="rounded-lg border border-gray-200 p-4 hover:border-amber-400"
                  >
                    <span className="block font-semibold text-gray-950">
                      {link.label} →
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-gray-600">
                      {link.description}
                    </span>
                  </LocalizedClientLink>
                ))}
              </nav>
            )}

            {article.comparison && (
              <section className="mt-8">
                <h2 className="text-2xl font-semibold text-gray-950">
                  Compare your options
                </h2>
                <div className="mt-4 grid gap-4">
                  {article.comparison.map((item) => (
                    <div
                      key={item.type}
                      className="rounded-lg border border-gray-200 p-5"
                    >
                      <h3 className="font-semibold text-gray-950">
                        {item.type}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-gray-700">
                        {item.use}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {item.check}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5">
              <h2 className="text-lg font-semibold text-gray-950">
                A place for your cleaning supplies
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                Dab Pal holds 30 regular Q-tips with a clean/dirty slider and an
                empty 1oz bottle. Swabs and iso are not included. Made to order
                in NY; allow 3–5 business days before shipping.
              </p>
              <GuideProductLink slug={article.slug} />
            </section>

            <div className="mt-8 overflow-hidden rounded-lg">
              <BlogTextCover article={article} />
            </div>



            <div className="mt-10 space-y-10">
              {article.sections.map((section, index) => (
                <section key={section.heading} id={`guide-section-${index}`} className="scroll-mt-36">
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
                clean vs dirty swabs. Swabs and iso are not included.
              </p>
              <div className="mt-4 grid gap-2">
                <GuideProductLink slug={article.slug} placement="article_sidebar"
                  href="/store/black-speck"
                  className="inline-flex rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                  Shop Slate
                </GuideProductLink>
                <GuideProductLink slug={article.slug} placement="article_sidebar"
                  href="/store/white-speck"
                  className="inline-flex rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 transition hover:border-amber-300"
                >
                  Shop Marble
                </GuideProductLink>
              </div>
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
