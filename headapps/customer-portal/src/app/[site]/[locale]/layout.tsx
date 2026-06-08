import { NextIntlClientProvider } from "next-intl";
import AuthShellProviders from "src/AuthShellProviders";

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider>
      <AuthShellProviders>{children}</AuthShellProviders>
    </NextIntlClientProvider>
  );
}
