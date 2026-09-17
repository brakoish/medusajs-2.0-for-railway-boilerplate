export function productUrlForSku(sku?: string | null) {
  if (!sku || !/^DABPAL-(WHT|BLK)-(SINGLE|3|6)$/.test(sku)) return "/store"
  const finish = sku.startsWith("DABPAL-WHT") ? "marble" : "slate"
  const pack = sku.endsWith("-3") ? "3" : sku.endsWith("-6") ? "6" : "1"
  return `/store?finish=${finish}&pack=${pack}`
}
