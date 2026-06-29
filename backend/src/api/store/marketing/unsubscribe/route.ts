import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import {
  normalizeMarketingEmail,
  suppressMarketingEmail,
  verifyMarketingToken,
} from "../../../../lib/marketing-suppression"

const page = (title: string, body: string, ok = true) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body {
        margin: 0;
        background: #f4f4f5;
        color: #18181b;
        font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main {
        box-sizing: border-box;
        max-width: 520px;
        margin: 10vh auto;
        padding: 32px;
        background: #fff;
        border-radius: 12px;
      }
      .brand {
        margin: 0 0 24px;
        color: #f59e0b;
        font-size: 22px;
        font-weight: 800;
        letter-spacing: 0.12em;
      }
      h1 {
        margin: 0 0 10px;
        font-size: 24px;
      }
      p {
        margin: 0;
        color: #52525b;
        line-height: 1.55;
      }
      .badge {
        display: inline-block;
        margin-top: 22px;
        color: ${ok ? "#166534" : "#991b1b"};
        background: ${ok ? "#dcfce7" : "#fee2e2"};
        border-radius: 999px;
        padding: 7px 12px;
        font-size: 13px;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <main>
      <p class="brand">DAB PAL</p>
      <h1>${title}</h1>
      <p>${body}</p>
      <span class="badge">${ok ? "Updated" : "Not updated"}</span>
    </main>
  </body>
</html>`

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const email = normalizeMarketingEmail(String(req.query.email || ""))
  const token = String(req.query.token || "")

  if (!email || !verifyMarketingToken(email, token)) {
    res
      .status(400)
      .type("html")
      .send(page("This link is invalid", "Your unsubscribe link could not be verified.", false))
    return
  }

  await suppressMarketingEmail({
    email,
    reason: "unsubscribe",
    source: "abandoned-cart",
  })

  res
    .status(200)
    .type("html")
    .send(page("You are unsubscribed", "You will not receive Dab Pal cart recovery emails. Order and shipping emails will still be sent when you buy something."))
}
