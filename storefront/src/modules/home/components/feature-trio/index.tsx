const features = [
  {
    title: "30 Q-tips + 1oz iso",
    description:
      "Everything you need for a quick clean, packed tight. No more loose swabs rattling around your bag.",
  },
  {
    title: "Used / unused slider",
    description:
      "Built-in divider keeps fresh swabs separate from used ones. Stay hygienic on the road.",
  },
  {
    title: "Pocket-sized, made for dabbers",
    description:
      "No magnets to fail, no hinges to snap. Slips into a backpack, dab bag, or glove box.",
  },
]

export default function FeatureTrio() {
  return (
    <section className="bg-white py-20 small:py-32 border-b border-gray-100">
      <div className="content-container">
        <div className="max-w-2xl mb-12 small:mb-20">
          <span className="uppercase tracking-[0.25em] text-xs text-gray-500">
            What it does
          </span>
          <h2 className="text-3xl small:text-5xl font-semibold tracking-tight mt-4 leading-tight">
            Built for the way you actually clean your banger.
          </h2>
        </div>
        <div className="grid grid-cols-1 small:grid-cols-3 gap-8 small:gap-12">
          {features.map((f, i) => (
            <div key={i} className="flex flex-col gap-3">
              <span className="text-sm text-gray-400 font-mono">
                0{i + 1}
              </span>
              <h3 className="text-xl small:text-2xl font-semibold tracking-tight">
                {f.title}
              </h3>
              <p className="text-base text-gray-600 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
