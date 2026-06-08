import type { Metadata } from "next";
import { headers } from "next/headers";
import { parseRewriteHeader } from "@sitecore-content-sdk/nextjs/utils";
import "@laitram-l-l-c/intralox-tailwind-config/css/fonts.css";
import "swiper/css";
import "./globals.css";
import scConfig from "sitecore.config";

/* Root layout keeps icons unset; each Sitecore route sets favicon via
   `generateMetadata` from route field `FaviconIcon`. If you add public/app favicon
   files, avoid also setting metadata.icons here (Next.js 15 can warn on duplicate). */
export const metadata: Metadata = {};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const resolvedHeaders = await headers();
  const { locale } = parseRewriteHeader(resolvedHeaders);
  const htmlLang = locale || scConfig.defaultLanguage || "en";

  return (
    <html lang={htmlLang}>
      <body>{children}</body>
    </html>
  );
}
