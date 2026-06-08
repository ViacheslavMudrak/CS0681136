import type { Metadata } from "next";
import "./globals.css";

import { LanguageProvider } from "lib/language-context";
import { helveticaNeue } from "@/lib/fonts";
import "../assets/okta-widget.css";

/* Root layout does not set favicon icons. Sitecore pages set them in
   `[site]/[locale]/[[...path]]/page.tsx` via `generateMetadata` from the Image `FavIcon` variant.
   Avoid `app/favicon.ico` and `metadata.icons` here to prevent a default icon flash before CMS data loads. */
export const metadata: Metadata = {
  robots:
    process.env.NEXT_PUBLIC_DISABLE_CRAWLING === "true"
      ? {
          index: false,
          follow: false,
          nocache: true,
        }
      : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={helveticaNeue.className}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
