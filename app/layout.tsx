import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

const body = DM_Sans({ variable: "--font-body", subsets: ["latin"] });
const heading = Playfair_Display({ variable: "--font-heading", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} | Bridal, Hair & Skincare in Satellite Town, Rawalpindi`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    title: SITE.name,
    description: SITE.tagline,
    siteName: SITE.name,
    locale: "en_PK",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${body.variable} ${heading.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
