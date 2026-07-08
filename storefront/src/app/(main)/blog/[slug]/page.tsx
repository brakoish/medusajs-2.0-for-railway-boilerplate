import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getBaseURL } from "@lib/util/env"
import { blogArticles, getBlogArticle } from "@modules/blog/articles"
import { BlogArticleTemplate } from "@modules/blog/templates"
import BreadcrumbSchema from "@modules/common/components/breadcrumb-schema"

type Props = {
  params: { slug: string }
}

export function generateStaticParams() {
  return blogArticles.map((article) => ({
    slug: article.slug,
  }))
}

export function generateMetadata({ params }: Props): Metadata {
  const article = getBlogArticle(params.slug)
  if (!article) notFound()

  const url = `${getBaseURL()}/blog/${article.slug}`

  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      tags: article.keywords,
    },
  }
}

export default function ArticlePage({ params }: Props) {
  const article = getBlogArticle(params.slug)
  if (!article) notFound()

  const url = `${getBaseURL()}/blog/${article.slug}`
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: url,
    author: {
      "@type": "Organization",
      name: "Dab Pal",
    },
    publisher: {
      "@type": "Organization",
      name: "Dab Pal",
      logo: {
        "@type": "ImageObject",
        url: `${getBaseURL()}/icon-512.png`,
      },
    },
  }
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: article.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  }
  const howToSchema = article.howTo
    ? {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: article.title,
        description: article.description,
        totalTime: article.howTo.totalTime,
        mainEntityOfPage: url,
        supply: article.howTo.supplies.map((name) => ({
          "@type": "HowToSupply",
          name,
        })),
        tool: article.howTo.tools.map((name) => ({
          "@type": "HowToTool",
          name,
        })),
        step: article.howTo.steps.map((text, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: text,
          text,
        })),
      }
    : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "" },
          { name: "Guides", path: "/blog" },
          { name: article.title, path: `/blog/${article.slug}` },
        ]}
      />
      <BlogArticleTemplate article={article} />
    </>
  )
}
