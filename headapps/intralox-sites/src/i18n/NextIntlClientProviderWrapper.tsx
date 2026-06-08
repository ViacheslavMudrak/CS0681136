'use client';

import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import type { AbstractIntlMessages } from 'next-intl';

type NextIntlClientProviderWrapperProps = {
  locale: string;
  messages: AbstractIntlMessages;
  children: ReactNode;
};

/**
 * Wraps children with next-intl's client provider. Must live in a file with
 * `'use client'` so Next.js registers the module in the client manifest
 * (avoids RSC bundler errors when used from Server Components).
 */
export function NextIntlClientProviderWrapper({
  locale,
  messages,
  children,
}: NextIntlClientProviderWrapperProps): ReactNode {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
