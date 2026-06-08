import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import type { Page } from '@sitecore-content-sdk/nextjs';

import { ContentSwitcherClient } from 'components/contentSwitcher/partial/ContentSwitcherClient';

import {
  createContentSwitcherFields,
  mockMatchMediaDesktop,
  mockParamsContentSwitcher,
  mockRendering,
} from '../../../_mock/contentSwitcher/ContentSwitcherClient.mock';

const mockPage = { mode: { isEditing: false } } as Page;

const nav = vi.hoisted(() => {
  let search = '';
  return {
    mockReplace: vi.fn(),
    getSearch: () => search,
    setSearch: (s: string) => {
      search = s;
    },
  };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: nav.mockReplace }),
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams(nav.getSearch()),
}));

vi.mock('src/hooks/useWindowSize', () => ({
  useWindowSize: () => ({ width: 1200 }),
}));

vi.mock('components/contentSwitcher/partial/TabAccordionTabPlaceholder', async () => {
  const { tabAccordionTabPlaceholderMock } = await import('src/test/mocks/viteSafeMocks');
  return tabAccordionTabPlaceholderMock();
});

vi.mock('components/shared/ImageView/ImageView', async () => {
  const { imageViewPlaceholderMock } = await import('src/test/mocks/viteSafeMocks');
  return imageViewPlaceholderMock();
});

vi.mock('src/components/shared/video/Video', async () => {
  const { brightcoveVideoIdOnlyMock } = await import('src/test/mocks/viteSafeMocks');
  return brightcoveVideoIdOnlyMock();
});

vi.mock('@sitecore-content-sdk/nextjs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sitecore-content-sdk/nextjs')>();
  const { mergeContentSwitcherSitecoreSdk } = await import('src/test/mocks/viteSafeMocks');
  return mergeContentSwitcherSitecoreSdk(actual);
});

describe('ContentSwitcherClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    nav.setSearch('');
    mockMatchMediaDesktop();
  });

  it('renders headline and description', () => {
    const fields = createContentSwitcherFields();
    render(
      <ContentSwitcherClient
        fields={fields}
        params={mockParamsContentSwitcher as never}
        rendering={mockRendering}
        page={mockPage}
      />,
    );

    expect(screen.getByText('Switcher Headline')).toBeInTheDocument();
    expect(screen.getByText('Description body')).toBeInTheDocument();
  });

  it('sets root id and analytics region when RenderingIdentifier is present', () => {
    const fields = createContentSwitcherFields();
    const { container } = render(
      <ContentSwitcherClient
        fields={fields}
        params={mockParamsContentSwitcher as never}
        rendering={mockRendering}
        page={mockPage}
      />,
    );

    const root = container.querySelector('#cs-test');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('data-analytics-region', 'cs-test');
  });

  it('renders TabAccordion with desktop tablist and labels from TabItems', () => {
    const fields = createContentSwitcherFields();
    render(
      <ContentSwitcherClient
        fields={fields}
        params={mockParamsContentSwitcher as never}
        rendering={mockRendering}
        page={mockPage}
      />,
    );

    const region = screen.getByRole('region', { name: /content switcher/i });
    expect(region).toHaveAttribute('data-analytics-region', 'Content Switcher');
    const tablist = within(region).getByRole('tablist');
    expect(tablist.tagName).toBe('UL');
    expect(within(tablist).getByRole('tab', { name: 'alpha' })).toBeInTheDocument();
    expect(within(tablist).getByRole('tab', { name: 'beta' })).toBeInTheDocument();
  });

  it('does not set root id when RenderingIdentifier is absent', () => {
    const fields = createContentSwitcherFields();
    const { container } = render(
      <ContentSwitcherClient
        fields={fields}
        params={{ ...mockParamsContentSwitcher, RenderingIdentifier: undefined } as never}
        rendering={mockRendering}
        page={mockPage}
      />,
    );

    const root = container.querySelector('.relative.w-full.bg-surface-muted');
    expect(root).toBeTruthy();
    expect(root).not.toHaveAttribute('id');
  });
});
