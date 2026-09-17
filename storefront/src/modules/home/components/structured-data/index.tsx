import { getBaseURL } from "@lib/util/env"

const StructuredData = () => {
  const url = getBaseURL()

  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Dab Pal",
    email: "hello@thedabpal.com",
    sameAs: ["https://www.instagram.com/nslabs_/"],
    contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: "hello@thedabpal.com", availableLanguage: "English" },
    url,
    logo: `${url}/icon-512.png`,
    description:
      "Dab Pal makes portable Puffco cleaning kits, dab swab cases, and quartz banger cleaning gear. Made to order in NY.",
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
    </>
  )
}

export default StructuredData
