import { notFound, permanentRedirect } from "next/navigation"

export default async function FinishPage({ params }: { params: Promise<{ finish: string }> }) {
  const { finish } = await params
  if (finish === "white-speck") permanentRedirect("/store?finish=marble")
  if (finish === "black-speck") permanentRedirect("/store?finish=slate")
  notFound()
}
