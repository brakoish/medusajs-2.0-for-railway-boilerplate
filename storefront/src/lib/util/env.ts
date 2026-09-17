export const getBaseURL = () => {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL || (process.env.NODE_ENV === "production" ? "https://thedabpal.com" : "http://localhost:8000")

  if (baseURL === "https://www.thedabpal.com") {
    return "https://thedabpal.com"
  }

  return baseURL
}
