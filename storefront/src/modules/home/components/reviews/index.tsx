const reviews = [
  {
    quote:
      "Outstanding communication with seller. Product is as described. Been looking for something like this for the longest, this definitely exceeded my expectations. Exceptional quality! A must have.",
    name: "Martin K.",
    label: "Verified buyer",
    stars: 5,
  },
  {
    quote:
      "Great little tool, will work great with my erig when I'm on the go. Arrived super quickly and well packaged! Thanks so much!",
    name: "RichyFlows",
    label: "Verified buyer",
    stars: 5,
  },
  {
    quote:
      "Made from a durable plastic with a moveable piece for separating used from unused. Love it.",
    name: "Verified buyer",
    label: "5-star review",
    stars: 5,
  },
  {
    quote:
      "Absolutely incredible service. Item is cool. Seller was spot on with communications.",
    name: "Sarah C.",
    label: "Verified buyer",
    stars: 5,
  },
]

const Stars = ({ count }: { count: number }) => (
  <div
    className="flex items-center gap-0.5 text-amber-500"
    aria-label={`${count} out of 5 stars`}
  >
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < count ? "fill-current" : "fill-gray-300"}`}
        viewBox="0 0 20 20"
      >
        <path d="M10 1l2.6 6h6.4l-5.2 4 2 6.4-5.8-4.2-5.8 4.2 2-6.4-5.2-4h6.4z" />
      </svg>
    ))}
  </div>
)

export default function Reviews() {
  return (
    <section id="reviews" className="bg-zinc-50 py-20 small:py-32 border-y border-gray-100 scroll-mt-24">
      <div className="content-container">
        <div className="max-w-2xl mb-12 small:mb-16">
          <span className="uppercase tracking-[0.25em] text-xs text-gray-500">
            What people say
          </span>
          <h2 className="text-3xl small:text-5xl font-semibold tracking-tight mt-4 leading-tight">
            Rated 5/5 by dabbers who actually use it.
          </h2>
        </div>
        <div className="grid grid-cols-1 small:grid-cols-2 gap-6">
          {reviews.map((r, i) => (
            <figure
              key={i}
              className="bg-white border border-gray-200 rounded-lg p-6 small:p-8 flex flex-col gap-4"
            >
              <Stars count={r.stars} />
              <blockquote className="text-base small:text-lg leading-relaxed text-gray-800">
                &ldquo;{r.quote}&rdquo;
              </blockquote>
              <figcaption className="text-sm text-gray-500 mt-auto">
                {r.name} · {r.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
