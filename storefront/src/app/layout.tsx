import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "leaflet/dist/leaflet.css"
import "styles/globals.css"
import { PostHogProvider } from "./posthog-provider"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        <PostHogProvider>
          <main className="relative">{props.children}</main>
        </PostHogProvider>
      </body>
    </html>
  )
}
