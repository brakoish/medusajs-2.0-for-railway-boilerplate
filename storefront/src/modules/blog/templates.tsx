import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { BlogArticle, blogArticles } from "./articles"

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`))

const fallbackImages: Record<string, { src: string; alt: string }> = {
  "how-to-clean-puffco-peak-pro-proxy": {
    src: "/dab-pal/lineup.png",
    alt: "Dab Pal cleaning kit with black and white finishes",
  },
  "how-to-clean-a-quartz-banger": {
    src: "/dab-pal/product-front.png",
    alt: "Black Speck Dab Pal with swab and iso storage",
  },
  "clean-vs-dirty-dab-swabs": {
    src: "/dab-pal/product-front.png",
    alt: "Dab Pal clean and dirty swab storage case",
  },
  "how-to-keep-dab-gear-clean-while-traveling": {
    src: "/dab-pal/lineup.png",
    alt: "Portable Dab Pal travel cleaning kit finishes",
  },
}

const getArticleImage = (article: BlogArticle) =>
  article.image ??
  fallbackImages[article.slug] ?? {
    src: "/dab-pal/product-front-white.jpg",
    alt: "White Speck Dab Pal cleaning kit",
  }

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
              className="group max-w-[20rem] small:max-w-none rounded-lg border border-gray-200 bg-white transition hover:border-amber-300 hover:shadow-elevation-card-rest"
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-t-lg bg-zinc-50">
                <Image
                  src={getArticleImage(article).src}
                  alt={getArticleImage(article).alt}
                  fill
                  sizes="(max-width: 800px) 100vw, 50vw"
                  className="object-contain p-5 transition-transform duration-300 group-hover:scale-[1.03]"
                />
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
  const image = getArticleImage(article)

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

            <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-lg bg-zinc-50">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority
                sizes="(max-width: 800px) 100vw, 760px"
                className="object-contain p-6 small:p-10"
              />
            </div>

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
              <div className="mt-4 grid gap-2">
                <LocalizedClientLink
                  href="/store/black-speck"
                  className="inline-flex rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                  Shop Black Speck
                </LocalizedClientLink>
                <LocalizedClientLink
                  href="/store/white-speck"
                  className="inline-flex rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 transition hover:border-amber-300"
                >
                  Shop White Speck
                </LocalizedClientLink>
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
