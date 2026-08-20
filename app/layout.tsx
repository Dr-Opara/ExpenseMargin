import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import "./brand.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://expensemargin.com";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "ExpenseMargin — Track expenses. Protect margins.",
    template: "%s | ExpenseMargin",
  },
  description: "Supplier cost intelligence for small businesses. Detect supplier price increases, new fees, and shrinkflation before they erode your margins.",
  applicationName: "ExpenseMargin",
  keywords: ["supplier cost intelligence", "invoice analysis", "small business", "cost monitoring", "margin protection", "procurement analytics"],
  icons: {
    icon: "/brand/expensemargin-icon.png",
    shortcut: "/brand/expensemargin-icon.png",
    apple: "/brand/expensemargin-icon.png",
  },
  openGraph: {
    type: "website",
    url: appUrl,
    siteName: "ExpenseMargin",
    title: "ExpenseMargin — Track expenses. Protect margins.",
    description: "Detect supplier cost increases before they quietly eat your profit.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ExpenseMargin — Track expenses. Protect margins.",
    description: "Supplier cost intelligence for small businesses.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
