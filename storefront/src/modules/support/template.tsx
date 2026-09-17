import Link from "next/link"
import PrivacyChoice from "./privacy-choice"

type Page = { title: string; description: string; sections: readonly { heading: string; body: readonly string[] }[] }

export default function SupportPage({ page, privacy = false }: { page: Page; privacy?: boolean }) {
  return <main className="studio-container support-page">
    <header><span className="studio-eyebrow">Dab Pal / A little help</span><h1 className="studio-display">{page.title}</h1><p>{page.description}</p></header>
    <div className="support-layout">
      <div>{page.sections.map(section => <section key={section.heading}><h2>{section.heading}</h2>{section.body.map(body => <p key={body}>{body}</p>)}</section>)}
        {privacy && <PrivacyChoice />}
        <a className="studio-text-link mt-8" href="mailto:hello@thedabpal.com">Email hello@thedabpal.com</a>
      </div>
      <nav aria-label="Customer help"><h2>A little help</h2><Link href="/shipping-returns">Shipping & returns</Link><Link href="/contact">Contact</Link><Link href="/care">Care for your Pal</Link><Link href="/about">About Dab Pal</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Shopping terms</Link><Link href="/store">Pick your Pal</Link></nav>
    </div>
  </main>
}
