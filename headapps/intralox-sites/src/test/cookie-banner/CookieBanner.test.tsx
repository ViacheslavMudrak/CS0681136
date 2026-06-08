import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Link from 'next/link';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('@sitecore-content-sdk/nextjs', () => ({
  RichText: ({ field }: { field?: { value?: string } }) => (
    <div data-testid="sdk-richtext">{field?.value ?? ''}</div>
  ),
}));

vi.mock('components/rich-text/richTextUtils', () => ({
  getRichTextRegionAriaLabel: () => 'Cookie consent',
}));

import { Default } from 'components/cookie-banner/CookieBanner';
import type { CookieBannerProps } from 'components/cookie-banner/CookieBanner.type';
import {
  COOKIE_BANNER_CONSENT_COOKIE_NAME,
  COOKIE_BANNER_CTA_ARIA_FALLBACK,
  COOKIE_BANNER_EMPTY_HINT,
  COOKIE_BANNER_STORAGE_KEY,
  formatCookieBannerConsentDocumentCookie,
  getCookieBannerCtaAriaLabel,
  getCookieBannerPageScrollY,
  hasMeaningfulRichTextValue,
  isCookieBannerConsentGranted,
  hasCookieBannerScrolledEnoughForConsent,
  readCookieBannerDismissedFromBrowser,
  resolveBannerTextField,
  resolveButtonLinkField,
} from 'components/cookie-banner/cookieBannerUtils';

const baseRendering = { componentName: 'CookieBanner', displayName: 'Cookie Banner' } as never;

const baseParams = { styles: '', RenderingIdentifier: 'cookie-1' } as CookieBannerProps['params'];

const basePageVisitor = {
  mode: { isEditing: false },
  layout: { sitecore: { route: { fields: {} } } },
} as CookieBannerProps['page'];

describe('CookieBanner Default', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    document.cookie = `${COOKIE_BANNER_CONSENT_COOKIE_NAME}=; Path=/; Max-Age=0`;
  });

  it('renders authoring hint when fields are missing', () => {
    render(
      <Default
        fields={undefined as never}
        params={baseParams}
        page={basePageVisitor}
        rendering={baseRendering}
      />,
    );
    expect(screen.getByText(COOKIE_BANNER_EMPTY_HINT)).toBeInTheDocument();
  });

  it('does not render on editor pages', () => {
    const { container } = render(
      <Default
        fields={{
          BannerText: { value: '<p>We use cookies.</p>' },
          ButtonTextWithLink: { value: { href: '#', text: 'Continue' } },
        }}
        params={baseParams}
        page={{
          mode: { isEditing: true },
          layout: { sitecore: { route: { fields: {} } } },
        } as CookieBannerProps['page']}
        rendering={baseRendering}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('returns null for visitors when both fields are empty', () => {
    const { container } = render(
      <Default
        fields={{
          BannerText: { value: '' },
          Link: { value: { href: '', text: '' } },
        }}
        params={baseParams}
        page={basePageVisitor}
        rendering={baseRendering}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders rich text for visitors when banner copy is present', () => {
    render(
      <Default
        fields={{
          BannerText: { value: '<p>We use cookies.</p>' },
        }}
        params={baseParams}
        page={basePageVisitor}
        rendering={baseRendering}
      />,
    );
    expect(screen.getByTestId('sdk-richtext')).toHaveTextContent('<p>We use cookies.</p>');
    expect(screen.getByRole('region', { name: 'Cookie consent' })).toBeInTheDocument();
  });

  it('omits rich text block for visitors when only the CTA is configured', () => {
    render(
      <Default
        fields={{
          ButtonTextWithLink: { value: { href: '/privacy', text: 'Continue' } },
        }}
        params={baseParams}
        page={basePageVisitor}
        rendering={baseRendering}
      />,
    );
    expect(screen.queryByTestId('sdk-richtext')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continue' })).toHaveTextContent('Continue');
  });

  it('hides the live region after consent is stored for visitors', async () => {
    const user = userEvent.setup();
    render(
      <Default
        fields={{
          BannerText: { value: '<p>Consent copy</p>' },
          ButtonTextWithLink: { value: { href: '#', text: 'Continue' } },
        }}
        params={baseParams}
        page={basePageVisitor}
        rendering={baseRendering}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => {
      expect(screen.queryByRole('region', { name: 'Cookie consent' })).not.toBeInTheDocument();
    });
    expect(isCookieBannerConsentGranted(document.cookie)).toBe(true);
  });

  it('does not render the region when consent was already granted', async () => {
    document.cookie = formatCookieBannerConsentDocumentCookie(false);
    render(
      <Default
        fields={{
          BannerText: { value: '<p>Consent copy</p>' },
          ButtonTextWithLink: { value: { href: '#', text: 'Continue' } },
        }}
        params={baseParams}
        page={basePageVisitor}
        rendering={baseRendering}
      />,
    );
    await waitFor(() => {
      expect(screen.queryByRole('region', { name: 'Cookie consent' })).not.toBeInTheDocument();
    });
  });

  it('shows the banner again after the consent cookie is cleared while the page is open', async () => {
    document.cookie = formatCookieBannerConsentDocumentCookie(false);
    render(
      <Default
        fields={{
          BannerText: { value: '<p>Consent copy</p>' },
        }}
        params={baseParams}
        page={basePageVisitor}
        rendering={baseRendering}
      />,
    );
    await waitFor(() => {
      expect(screen.queryByRole('region', { name: 'Cookie consent' })).not.toBeInTheDocument();
    });
    document.cookie = `${COOKIE_BANNER_CONSENT_COOKIE_NAME}=; Path=/; Max-Age=0`;
    fireEvent(window, new Event('focus'));
    await waitFor(() => {
      expect(screen.getByRole('region', { name: 'Cookie consent' })).toBeInTheDocument();
    });
    expect(readCookieBannerDismissedFromBrowser(false)).toBe(false);
  });

  it('shows the banner when only legacy localStorage consent exists (cookies were cleared)', async () => {
    localStorage.setItem(COOKIE_BANNER_STORAGE_KEY, '1');
    render(
      <Default
        fields={{
          BannerText: { value: '<p>Consent copy</p>' },
          ButtonTextWithLink: { value: { href: '#', text: 'Continue' } },
        }}
        params={baseParams}
        page={basePageVisitor}
        rendering={baseRendering}
      />,
    );
    await waitFor(() => {
      expect(screen.getByRole('region', { name: 'Cookie consent' })).toBeInTheDocument();
    });
  });

  it('hides after the visitor scrolls past the implicit-consent threshold', async () => {
    const scrollYDescriptor = Object.getOwnPropertyDescriptor(window, 'scrollY');
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 0,
    });
    render(
      <Default
        fields={{
          BannerText: { value: '<p>Scroll to accept</p>' },
        }}
        params={baseParams}
        page={basePageVisitor}
        rendering={baseRendering}
      />,
    );
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 100,
    });
    fireEvent.scroll(window);
    await waitFor(() => {
      expect(screen.queryByRole('region', { name: 'Cookie consent' })).not.toBeInTheDocument();
    });
    expect(isCookieBannerConsentGranted(document.cookie)).toBe(true);
    if (scrollYDescriptor) {
      Object.defineProperty(window, 'scrollY', scrollYDescriptor);
    } else {
      Reflect.deleteProperty(window, 'scrollY');
    }
  });

  it('hides when documentElement scrollTop passes the threshold while window.scrollY stays 0', async () => {
    const scrollYDescriptor = Object.getOwnPropertyDescriptor(window, 'scrollY');
    const docScrollDescriptor = Object.getOwnPropertyDescriptor(
      document.documentElement,
      'scrollTop',
    );
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 0,
    });
    Object.defineProperty(document.documentElement, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 0,
    });
    render(
      <Default
        fields={{
          BannerText: { value: '<p>Scroll to accept</p>' },
        }}
        params={baseParams}
        page={basePageVisitor}
        rendering={baseRendering}
      />,
    );
    Object.defineProperty(document.documentElement, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 100,
    });
    fireEvent.scroll(document);
    await waitFor(() => {
      expect(screen.queryByRole('region', { name: 'Cookie consent' })).not.toBeInTheDocument();
    });
    expect(isCookieBannerConsentGranted(document.cookie)).toBe(true);
    if (scrollYDescriptor) {
      Object.defineProperty(window, 'scrollY', scrollYDescriptor);
    } else {
      Reflect.deleteProperty(window, 'scrollY');
    }
    if (docScrollDescriptor) {
      Object.defineProperty(document.documentElement, 'scrollTop', docScrollDescriptor);
    } else {
      Reflect.deleteProperty(document.documentElement, 'scrollTop');
    }
  });

  it('does not hide on wheel alone before the page has scrolled', async () => {
    render(
      <Default
        fields={{
          BannerText: { value: '<p>Wheel only</p>' },
        }}
        params={baseParams}
        page={basePageVisitor}
        rendering={baseRendering}
      />,
    );
    fireEvent.wheel(window, { deltaY: 120 });
    expect(screen.getByRole('region', { name: 'Cookie consent' })).toBeInTheDocument();
    expect(isCookieBannerConsentGranted(document.cookie)).toBe(false);
  });

  it('does not hide when the visitor clicks non-link page chrome', async () => {
    const user = userEvent.setup();
    render(
      <Default
        fields={{
          BannerText: { value: '<p>Click to accept</p>' },
        }}
        params={baseParams}
        page={basePageVisitor}
        rendering={baseRendering}
      />,
    );
    await user.click(document.body);
    expect(screen.getByRole('region', { name: 'Cookie consent' })).toBeInTheDocument();
    expect(isCookieBannerConsentGranted(document.cookie)).toBe(false);
  });

  it('hides when the visitor follows a link outside the banner', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Default
          fields={{
            BannerText: { value: '<p>Browse to accept</p>' },
          }}
          params={baseParams}
          page={basePageVisitor}
          rendering={baseRendering}
        />
        <Link href="/privacy" data-testid="browse-link">
          Privacy
        </Link>
      </>,
    );
    await user.click(screen.getByTestId('browse-link'));
    await waitFor(() => {
      expect(screen.queryByRole('region', { name: 'Cookie consent' })).not.toBeInTheDocument();
    });
    expect(isCookieBannerConsentGranted(document.cookie)).toBe(true);
  });

  it('resolves CTA from flat `Link` when `ButtonTextWithLink` is absent', () => {
    const linkField = { value: { href: '/x', text: 'Continue' } } as never;
    expect(resolveButtonLinkField({ Link: linkField })).toBe(linkField);
    expect(resolveButtonLinkField({ ButtonTextWithLink: linkField })).toBe(linkField);
    expect(
      resolveButtonLinkField({
        Link: { value: { href: '/a', text: 'A' } } as never,
        ButtonTextWithLink: { value: { href: '/b', text: 'B' } } as never,
      }),
    ).toEqual({ value: { href: '/a', text: 'A' } });
  });

  it('renders layout JSON shape with `Link` and rich banner copy', () => {
    render(
      <Default
        fields={{
          BannerText: {
            value:
              '<p>Cookie message with <a href="/cookie-policy">policy</a>.</p>',
          },
          Link: {
            value: {
              href: 'javascript:void(0);return false;',
              text: 'Continue',
              linktype: 'javascript',
            },
          },
        }}
        params={baseParams}
        page={basePageVisitor}
        rendering={baseRendering}
      />,
    );
    expect(screen.getByTestId('sdk-richtext')).toHaveTextContent(/Cookie message/);
    expect(screen.getByRole('button', { name: 'Continue' })).toHaveTextContent('Continue');
    expect(screen.getByRole('region', { name: 'Cookie consent' })).toBeInTheDocument();
  });

  it('dismisses from keyboard Space on the dismiss-only CTA', async () => {
    const user = userEvent.setup();
    render(
      <Default
        fields={{
          Link: {
            value: { href: 'javascript:void(0);', text: 'Continue' },
          },
        }}
        params={baseParams}
        page={basePageVisitor}
        rendering={baseRendering}
      />,
    );
    screen.getByRole('button', { name: 'Continue' }).focus();
    await user.keyboard(' ');
    await waitFor(() => {
      expect(screen.queryByRole('region', { name: 'Cookie consent' })).not.toBeInTheDocument();
    });
  });

  it('dismisses from keyboard Enter on javascript CTA links', async () => {
    const user = userEvent.setup();
    render(
      <Default
        fields={{
          Link: {
            value: { href: 'javascript:void(0);', text: 'Continue' },
          },
        }}
        params={baseParams}
        page={basePageVisitor}
        rendering={baseRendering}
      />,
    );
    screen.getByRole('button', { name: 'Continue' }).focus();
    await user.keyboard('{Enter}');
    await waitFor(() => {
      expect(screen.queryByRole('region', { name: 'Cookie consent' })).not.toBeInTheDocument();
    });
    expect(isCookieBannerConsentGranted(document.cookie)).toBe(true);
  });

  it('resolves CTA from integrated GraphQL `link` / `buttonTextWithLink` shapes', () => {
    const linkField = { value: { href: '/go', text: 'Go' } } as never;
    expect(
      resolveButtonLinkField({
        data: { datasource: { link: { jsonValue: linkField } } },
      }),
    ).toBe(linkField);
    expect(
      resolveButtonLinkField({
        data: { datasource: { buttonTextWithLink: { jsonValue: linkField } } },
      }),
    ).toBe(linkField);
  });

  it('resolves banner text from integrated GraphQL datasource shape', () => {
    const fields = {
      data: {
        datasource: {
          bannerText: { jsonValue: { value: '<p>GraphQL</p>' } },
        },
      },
    };
    expect(resolveBannerTextField(fields)?.value).toBe('<p>GraphQL</p>');
    expect(hasMeaningfulRichTextValue(resolveBannerTextField(fields)?.value)).toBe(true);
  });
});

describe('readCookieBannerDismissedFromBrowser', () => {
  it('returns false in editing mode and when the consent cookie is absent', () => {
    expect(readCookieBannerDismissedFromBrowser(true)).toBe(false);
    expect(readCookieBannerDismissedFromBrowser(false)).toBe(false);
    document.cookie = formatCookieBannerConsentDocumentCookie(false);
    expect(readCookieBannerDismissedFromBrowser(false)).toBe(true);
    document.cookie = `${COOKIE_BANNER_CONSENT_COOKIE_NAME}=; Path=/; Max-Age=0`;
    expect(readCookieBannerDismissedFromBrowser(false)).toBe(false);
  });
});

describe('cookie banner scroll helpers', () => {
  it('reads the greatest scroll offset across window and document roots', () => {
    const scrollYDescriptor = Object.getOwnPropertyDescriptor(window, 'scrollY');
    const docScrollDescriptor = Object.getOwnPropertyDescriptor(
      document.documentElement,
      'scrollTop',
    );
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 10,
    });
    Object.defineProperty(document.documentElement, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 80,
    });
    expect(getCookieBannerPageScrollY()).toBe(80);
    expect(hasCookieBannerScrolledEnoughForConsent(0, 80)).toBe(true);
    expect(hasCookieBannerScrolledEnoughForConsent(80, 100)).toBe(false);
    if (scrollYDescriptor) {
      Object.defineProperty(window, 'scrollY', scrollYDescriptor);
    } else {
      Reflect.deleteProperty(window, 'scrollY');
    }
    if (docScrollDescriptor) {
      Object.defineProperty(document.documentElement, 'scrollTop', docScrollDescriptor);
    } else {
      Reflect.deleteProperty(document.documentElement, 'scrollTop');
    }
  });
});

describe('getCookieBannerCtaAriaLabel', () => {
  it('prefers link text, then title, then the static fallback', () => {
    expect(
      getCookieBannerCtaAriaLabel({ value: { text: '  Go  ', href: '#' } } as never, 'fallback'),
    ).toBe('Go');
    expect(
      getCookieBannerCtaAriaLabel({ value: { title: '  T  ', href: '#' } } as never, 'fallback'),
    ).toBe('T');
    expect(getCookieBannerCtaAriaLabel(undefined, COOKIE_BANNER_CTA_ARIA_FALLBACK)).toBe(
      COOKIE_BANNER_CTA_ARIA_FALLBACK,
    );
  });
});
