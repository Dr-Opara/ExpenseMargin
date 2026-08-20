import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_APP_URL || "https://expensemargin.vercel.app").replace(/\/$/, "");
  return {
    rules: [{ userAgent: "*", allow: ["/", "/pricing", "/security", "/privacy", "/terms", "/login", "/signup"], disallow: ["/api/", "/dashboard", "/invoices", "/suppliers", "/products", "/alerts", "/review", "/activity", "/billing", "/settings", "/onboarding"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
