"use client"

export default function PrivacyChoice() {
  return <button className="studio-button mt-6" onClick={() => window.dispatchEvent(new Event("dabpal-analytics-preferences"))}>Change analytics choice</button>
}
