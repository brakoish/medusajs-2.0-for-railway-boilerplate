import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useEffect, useState } from "react"
import type { DabPalSettings } from "../../../lib/dabpal-settings"
import { adminRequest, buttonClass, DabPalLayout, inputClass, panelClass } from "../../components/dabpal-layout"

export const config = defineRouteConfig({ label: "Product Studio" })
export default function ProductStudio() {
  const [settings, setSettings] = useState<DabPalSettings | null>(null)
  const [version, setVersion] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState("")
  const [dirty, setDirty] = useState(false)
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = "" } }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])
  const load = async () => {
    if (dirty && !window.confirm("Reload published settings and discard your unsaved changes?")) return
    setBusy(true); setError("")
    try { const data = await adminRequest("/admin/dab-pal/settings"); setSettings(data.settings); setVersion(data.version); setDirty(false) }
    catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }
  useEffect(() => { void load() }, [])
  async function publish() {
    setBusy(true); setError(""); setSaved("")
    try { const data = await adminRequest("/admin/dab-pal/settings", { settings, version }); setVersion(data.version); setSettings(data.settings); setDirty(false); setSaved("Published. Reload the storefront to see your changes.") }
    catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }
  const change = (key: keyof DabPalSettings, value: any) => { setSettings(current => current ? { ...current, [key]: value } : current); setSaved(""); setDirty(true) }
  async function upload(file: File | undefined, finish: "slate" | "marble", key: "image" | "detail_image") {
    if (!file || !settings) return
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) { setError("Choose a JPG, PNG or WebP image under 5 MB."); return }
    setBusy(true); setError("")
    try {
      const body = new FormData(); body.append("files", file)
      const response = await fetch("/admin/uploads", { method: "POST", credentials: "include", body })
      const result = await response.json()
      if (!response.ok || !result.files?.[0]?.url) throw new Error(result.message || "Image upload failed. Try again.")
      change("finishes", { ...settings.finishes, [finish]: { ...settings.finishes[finish], [key]: result.files[0].url } })
    } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }
  const textField = (key: "title" | "subtitle" | "description" | "included" | "capacity" | "construction", label: string) => <label className="block space-y-2"><span className="text-sm font-medium">{label}</span><textarea className={inputClass} rows={key === "title" || key === "subtitle" ? 1 : 3} value={settings?.[key] || ""} onChange={e => change(key, e.target.value)} /></label>
  return <DabPalLayout title="Product Studio" description="Edit the content customers see, finish photographs, and custom color choices. Prices and inventory remain in the product catalog.">
    <div className="flex flex-wrap items-center gap-3"><a href="/app/products" className="underline">Manage catalog, prices & stock</a><a href="https://thedabpal.com/store" target="_blank" rel="noreferrer" className="underline">Open storefront ↗</a></div>
    {error && <div role="alert" className="rounded-lg border border-ui-border-error p-4 text-ui-fg-error">{error} <button onClick={load} className="underline">Reload settings</button></div>}
    {saved && <p role="status" className="rounded-lg bg-ui-bg-subtle p-4">{saved}</p>}
    {!settings ? <p role="status">{busy ? "Loading product settings…" : "Settings unavailable."}</p> : <form onSubmit={e => { e.preventDefault(); void publish() }}>
      <fieldset disabled={busy} className="space-y-6 disabled:opacity-60">
        <section className={`${panelClass} grid gap-5 md:grid-cols-2`} aria-label="Product content">{textField("title", "Product name")}{textField("subtitle", "Short description")}{textField("description", "Overview")}{textField("included", "What's included")}{textField("capacity", "Size and capacity")}{textField("construction", "Construction")}
          <label className="block space-y-2 md:col-span-2"><span className="text-sm font-medium">How to use it — one step per line</span><textarea className={inputClass} rows={5} value={settings.instructions.join("\n")} onChange={e => change("instructions", e.target.value.split("\n"))} /></label>
        </section>
        <section className="grid gap-5 md:grid-cols-2" aria-label="Finish images">{(["slate", "marble"] as const).map(finish => <div className={`${panelClass} space-y-4`} key={finish}>
          <h2 className="text-lg font-semibold capitalize">{finish}</h2>
          <label className="block space-y-2"><span className="text-sm font-medium">Finish description</span><input className={inputClass} value={settings.finishes[finish].description} onChange={e => change("finishes", { ...settings.finishes, [finish]: { ...settings.finishes[finish], description: e.target.value } })} /></label>
          {(["image", "detail_image"] as const).map(key => <div key={key} className="space-y-2"><label className="block space-y-2"><span className="text-sm font-medium">{key === "image" ? "Main photograph" : "Detail photograph"}</span><input type="file" accept="image/jpeg,image/png,image/webp" className={`${inputClass} text-sm`} onChange={e => { void upload(e.target.files?.[0], finish, key); e.target.value = "" }} /></label><img src={settings.finishes[finish][key].startsWith("/") ? `https://thedabpal.com${settings.finishes[finish][key]}` : settings.finishes[finish][key]} alt={`${finish} ${key === "image" ? "main" : "detail"} photograph preview`} className="aspect-video w-full rounded-lg bg-ui-bg-subtle object-contain" /><details><summary className="min-h-11 cursor-pointer py-3 text-xs">Use an existing image address</summary><input aria-label={`${finish} ${key} address`} className={inputClass} value={settings.finishes[finish][key]} onChange={e => change("finishes", { ...settings.finishes, [finish]: { ...settings.finishes[finish], [key]: e.target.value } })} /></details></div>)}
          <p className="text-xs leading-5 text-ui-fg-subtle">JPG, PNG or WebP, up to 5 MB. Uploads are saved to your media library; publish when your changes are ready.</p>
        </div>)}</section>
        <section className={`${panelClass} space-y-5`}>
          <h2 className="text-lg font-semibold">Custom Dab Pal</h2>
          <label className="flex min-h-11 items-center gap-3"><input type="checkbox" checked={settings.custom.enabled} onChange={e => change("custom", { ...settings.custom, enabled: e.target.checked })} /><span>Accept custom orders</span></label>
          <p className="text-sm text-ui-fg-subtle">When off, customers can preview colors but cannot add a custom kit. Only list colors you can print. Each order saves its own color specification.</p>
          <div className="grid gap-6 lg:grid-cols-3">{(["body", "lid", "slider"] as const).map(part => <div key={part} className="space-y-3"><h3 className="font-semibold capitalize">{part} colors</h3>{settings.custom.palettes[part].map((color, index) => <div key={index} className="flex items-center gap-2">
            <input type="color" aria-label={`${part} color ${index + 1}`} value={color.value} className="h-11 w-11 shrink-0" onChange={e => change("custom", { ...settings.custom, palettes: { ...settings.custom.palettes, [part]: settings.custom.palettes[part].map((c, i) => i === index ? { ...c, value: e.target.value } : c) } })} />
            <input aria-label={`${part} color ${index + 1} name`} className={inputClass} value={color.name} onChange={e => change("custom", { ...settings.custom, palettes: { ...settings.custom.palettes, [part]: settings.custom.palettes[part].map((c, i) => i === index ? { ...c, name: e.target.value } : c) } })} />
            <button type="button" className="min-h-11 px-2 text-sm underline" aria-label={`Remove ${part} color ${color.name}`} disabled={settings.custom.palettes[part].length === 1} onClick={() => change("custom", { ...settings.custom, palettes: { ...settings.custom.palettes, [part]: settings.custom.palettes[part].filter((_, i) => i !== index) } })}>Remove</button>
          </div>)}<button type="button" className="min-h-11 text-sm underline" onClick={() => change("custom", { ...settings.custom, palettes: { ...settings.custom.palettes, [part]: [...settings.custom.palettes[part], { name: "New color", value: "#808080" }] } })}>Add {part} color</button></div>)}</div>
        </section>
        <section className={`${panelClass} space-y-2`} aria-label="Copy preview"><h2 className="text-sm font-semibold text-ui-fg-subtle">COPY PREVIEW</h2><h3 className="text-2xl font-semibold">{settings.title}</h3><p>{settings.subtitle}</p><p>{settings.description}</p><p className="text-sm">{settings.included}</p></section>
        <div className="sticky bottom-0 space-y-3 rounded-xl border border-ui-border-base bg-ui-bg-base p-4 shadow-elevation-card-rest">{error && <p role="alert" className="max-h-24 overflow-y-auto text-sm text-ui-fg-error">{error}</p>}{saved && <p role="status" className="text-sm">{saved}</p>}<div className="flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-ui-fg-subtle">Publishing updates the live product page and custom options.</p><button className={buttonClass} type="submit">{busy ? "Publishing…" : "Publish changes"}</button></div></div>
      </fieldset>
    </form>}
  </DabPalLayout>
}
