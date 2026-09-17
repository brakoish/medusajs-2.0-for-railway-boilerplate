import { ArrowRight } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { blogArticles } from "@modules/blog/articles"
import { BlogTextCover } from "@modules/blog/text-cover"

const steps = [
  [
    "Pack the essentials.",
    "Add your own regular swabs and fill the included empty 1 oz bottle. Everything has a place.",
  ],
  [
    "Keep them separate.",
    "The movable slider keeps used swabs away from the clean ones until you can toss them.",
  ],
  [
    "Close it. Take it along.",
    "A compact 80 × 80 × 25 mm case, made to order and hand-finished in Astoria, NY.",
  ],
]
export default function StudioStory() {
  return (
    <>
      <section id="how-it-works" className="studio-story studio-container">
        <div className="studio-section-heading">
          <div>
            <span className="studio-eyebrow">
              Small case. Thoughtful details.
            </span>
            <h2 className="studio-display">
              A little order.
              <br />A better routine.
            </h2>
          </div>
          <p>
            A portable dab swab case for your Puffco, e-rig, or quartz banger
            clean-up supplies.
          </p>
        </div>
        <div className="studio-steps">
          {steps.map(([title, text], i) => (
            <div key={title}>
              <span className="studio-step-number">0{i + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <div className="studio-demo">
          <video
            controls
            muted
            playsInline
            preload="none"
            poster="/dab-pal/studio/black.webp"
            aria-label="See the Dab Pal slider in action"
          >
            <source
              src="https://bucket-production-a39d.up.railway.app/medusa-media/dabpal_video-01KRBQAN081CB5FHH4QC6G6PKN.mp4"
              type="video/mp4"
            />
            Your browser does not support video.
          </video>
          <div>
            <span className="studio-eyebrow">Made to be used</span>
            <h2 className="studio-display">
              Meet your
              <br />
              daily sidekick.
            </h2>
            <p>
              Storage for 30 regular Q-tips, an empty 1 oz bottle, and a slider
              that keeps fresh and used swabs apart. Simple, useful, ready to
              go.
            </p>
            <p>
              Swabs and isopropyl alcohol are not included. Specialty swab fit
              varies.
            </p>
            <LocalizedClientLink href="/care" className="studio-text-link">
              Care for your Pal <ArrowRight />
            </LocalizedClientLink>
          </div>
        </div>
      </section>
      <section className="studio-notes studio-container">
        <div className="studio-section-heading">
          <div>
            <span className="studio-eyebrow">Field notes</span>
            <h2 className="studio-display">Good habits start here.</h2>
          </div>
          <LocalizedClientLink href="/blog" className="studio-text-link">
            All cleaning guides <ArrowRight />
          </LocalizedClientLink>
        </div>
        <div className="studio-notes-grid">
          {blogArticles.filter((article) => ["how-to-clean-puffco-peak-pro-proxy", "best-swabs-for-dabs", "what-to-keep-in-a-dab-cleaning-kit"].includes(article.slug)).map((article) => (
            <LocalizedClientLink
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="studio-note"
            >
              <BlogTextCover article={article} />
              <h3>{article.title}</h3>
              <span>
                {article.readingMinutes} min read <ArrowRight />
              </span>
            </LocalizedClientLink>
          ))}
        </div>
      </section>
    </>
  )
}
