export const getBaseURL = () => {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:8000"

  if (baseURL === "https://www.thedabpal.com") {
    return "https://thedabpal.com"
  }

  return baseURL
}
