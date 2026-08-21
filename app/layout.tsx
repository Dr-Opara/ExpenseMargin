import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import "./brand.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://expensemargin.com";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "ExpenseMargin | Supplier Price Tracking & Invoice Cost Intelligence",
    template: "%s | ExpenseMargin",
  },
  description:
    "Track supplier price increases, invoice cost changes, fees, surcharges, and margin impact. ExpenseMargin gives small businesses supplier cost intelligence without spreadsheets.",
  applicationName: "ExpenseMargin",
  keywords: [
    "supplier price tracking",
    "supplier cost monitoring",
    "invoice cost analysis",
    "invoice price comparison",
    "small business expense tracking",
    "margin protection software",
    "supplier price increase alerts",
    "procurement cost analytics",
    "invoice analysis software",
    "cost intelligence software",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/brand/expensemargin-icon.png",
    shortcut: "/brand/expensemargin-icon.png",
    apple: "/brand/expensemargin-icon.png",
  },
  openGraph: {
    type: "website",
    url: appUrl,
    siteName: "ExpenseMargin",
    title: "ExpenseMargin | Supplier Price Tracking & Invoice Cost Intelligence",
    description:
      "Detect supplier price increases, fees, surcharges, and margin erosion from recurring invoices.",
    images: [
      {
        url: "/brand/expensemargin-icon.png",
        width: 512,
        height: 512,
        alt: "ExpenseMargin supplier cost intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ExpenseMargin | Supplier Price Tracking",
    description:
      "Track supplier cost changes and understand their impact on your margins.",
    images: ["/brand/expensemargin-icon.png"],
  },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ExpenseMargin",
    url: appUrl,
    description:
      "Supplier price tracking and invoice cost intelligence software for small businesses.",
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ExpenseMargin",
    url: appUrl,
    logo: `${appUrl}/brand/expensemargin-icon.png`,
    sameAs: [
      "https://x.com/expensemargin",
      "https://www.linkedin.com/company/expensemargin",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: "sales@expensemargin.com",
      },
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "support@expensemargin.com",
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ExpenseMargin",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: appUrl,
    description:
      "Supplier cost intelligence software that compares recurring invoices, identifies price changes, fees and surcharges, and estimates margin impact.",
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "19",
      highPrice: "99",
      priceCurrency: "USD",
      offerCount: "4",
      url: `${appUrl}/pricing`,
    },
  },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
