import { ImageResponse } from "next/og"
import { getBlogArticle } from "@modules/blog/articles"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const article = getBlogArticle(slug)
  if (!article) return new Response("Not found", { status: 404 })

  const dark = article.cover.dark
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "64px 80px",
          background: dark ? "#22251f" : "#f4f1e8",
          color: dark ? "#fffdf5" : "#22251f",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: 5,
            color: dark ? "#efb55c" : "#8d5916",
            textTransform: "uppercase",
          }}
        >
          {article.eyebrow}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            fontSize: 88,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -3,
          }}
        >
          {article.cover.title.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
        <div style={{ fontSize: 28, marginBottom: 36 }}>
          {article.cover.subtitle}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: `1px solid ${dark ? "#52554e" : "#ccc7ba"}`,
            paddingTop: 22,
            fontSize: 22,
            letterSpacing: 3,
          }}
        >
          <span style={{ fontWeight: 700 }}>DAB PAL</span>
          <span>FIELD NOTES</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": "public, max-age=3600" },
    }
  )
}
