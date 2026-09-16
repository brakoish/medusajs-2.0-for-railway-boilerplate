import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getBaseURL } from "@lib/util/env"
import { blogArticles, getBlogArticle } from "@modules/blog/articles"
import { BlogArticleTemplate } from "@modules/blog/templates"
import BreadcrumbSchema from "@modules/common/components/breadcrumb-schema"

type Props = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return blogArticles.map((article) => ({
    slug: article.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = getBlogArticle(slug)
  if (!article) notFound()

  const url = `${getBaseURL()}/blog/${article.slug}`

  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    alternates: {
      canonical: url,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [`${url}/social`],
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      tags: article.keywords,
      images: [
        { url: `${url}/social`, width: 1200, height: 630, alt: article.title },
      ],
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = getBlogArticle(slug)
  if (!article) notFound()

  const url = `${getBaseURL()}/blog/${article.slug}`
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    image: `${url}/social`,
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
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
