import { getBaseURL } from "@lib/util/env"

type BreadcrumbItem = {
  name: string
  path: string
}

const BreadcrumbSchema = ({ items }: { items: BreadcrumbItem[] }) => {
  const base = getBaseURL()
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${base}${item.path}`,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default BreadcrumbSchema
