import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Page } from '@sitecore-content-sdk/nextjs';

import { TabAccordion } from 'components/contentSwitcher/partial/TabAccordion';
import { MediaType } from 'src/utils/enum';

import {
  createContentSwitcherFields,
  mockMatchMediaDesktop,
  mockParamsContentSwitcher,
  mockRendering,
} from '../../../_mock/contentSwitcher/TabAccordion.mock';

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

describe('TabAccordion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    nav.setSearch('');
    mockMatchMediaDesktop();
  });

  it('renders desktop tab labels for each tab item', () => {
    const fields = createContentSwitcherFields();
    render(
      <TabAccordion
        tabItems={fields.TabItems}
        params={mockParamsContentSwitcher as never}
        rendering={mockRendering}
        page={mockPage}
      />,
    );

    expect(document.getElementById('tab-0')).toHaveTextContent('alpha');
    expect(document.getElementById('tab-1')).toHaveTextContent('beta');
  });

  it('shows the first tab panel on desktop when no solution query is set', () => {
    const fields = createContentSwitcherFields();
    render(
      <TabAccordion
        tabItems={fields.TabItems}
        params={mockParamsContentSwitcher as never}
        rendering={mockRendering}
        page={mockPage}
      />,
    );

    const firstPanel = document.getElementById('content-switcher-panel-0');
    const secondPanel = document.getElementById('content-switcher-panel-1');
    expect(firstPanel).toHaveAttribute('role', 'tabpanel');
    expect(firstPanel).toHaveAttribute('aria-labelledby', 'tab-0');
    expect(document.getElementById('tab-0')).toHaveAttribute(
      'aria-controls',
      'content-switcher-panel-0',
    );
    expect(secondPanel).toHaveClass('hidden');
    expect(firstPanel).not.toHaveClass('hidden');
  });

  it('selects the tab that matches the solution query param on load', () => {
    nav.setSearch('solution=beta');
    const fields = createContentSwitcherFields();
    render(
      <TabAccordion
        tabItems={fields.TabItems}
        params={mockParamsContentSwitcher as never}
        rendering={mockRendering}
        page={mockPage}
      />,
    );

    expect(document.getElementById('tab-1')).toHaveAttribute('aria-selected', 'true');
    const secondPanel = screen.getByText('Second panel body').closest('[data-rich-text]');
    expect(secondPanel).toBeVisible();
  });

  it('switches visible panel when a desktop tab is clicked', async () => {
    const user = userEvent.setup();
    const fields = createContentSwitcherFields();
    render(
      <TabAccordion
        tabItems={fields.TabItems}
        params={mockParamsContentSwitcher as never}
        rendering={mockRendering}
        page={mockPage}
      />,
    );

    await user.click(document.getElementById('tab-1') as HTMLElement);

    expect(document.getElementById('tab-1')).toHaveAttribute('aria-selected', 'true');
    const secondPanel = screen.getByText('Second panel body').closest('[data-rich-text]');
    expect(secondPanel).toBeVisible();
  });

  it('renders ImageView for image media type', () => {
    const fields = createContentSwitcherFields();
    render(
      <TabAccordion
        tabItems={fields.TabItems}
        params={mockParamsContentSwitcher as never}
        rendering={mockRendering}
        page={mockPage}
      />,
    );

    expect(screen.getAllByTestId('image-view').length).toBeGreaterThan(0);
  });

  it('renders Video when a tab uses video media type', () => {
    const fields = createContentSwitcherFields({
      TabItems: [
        {
          id: 'vid-1',
          fields: {
            Image: { value: { src: 'https://example.com/x.jpg', alt: 'X' } },
            MediaType: { fields: { Value: { value: MediaType.VIDEO } } },
            TabContent: { value: 'Video tab copy' },
            TabLabel: { value: 'video-tab' },
            Video: {
              fields: {
                Autoplay: { value: false },
                BrightcoveId: { value: 'bc-999' },
                Caption: { value: '' },
                CoverImage: { value: {} },
                Loop: { value: false },
                Title: { value: '' },
              },
            },
          },
        },
      ],
    });

    render(
      <TabAccordion
        tabItems={fields.TabItems}
        params={mockParamsContentSwitcher as never}
        rendering={mockRendering}
        page={mockPage}
      />,
    );

    expect(screen.getByTestId('brightcove-video')).toHaveTextContent('bc-999');
    expect(screen.queryByTestId('image-view')).not.toBeInTheDocument();
  });

  it('exposes a tablist for the desktop switcher region', () => {
    const fields = createContentSwitcherFields();
    render(
      <TabAccordion
        tabItems={fields.TabItems}
        params={mockParamsContentSwitcher as never}
        rendering={mockRendering}
        page={mockPage}
      />,
    );

    const region = screen.getByRole('region', { name: /content switcher/i });
    expect(region).toHaveAttribute('data-analytics-region', 'Content Switcher');
    const desktopTablist = within(region).getByRole('tablist');
    expect(desktopTablist).toHaveAttribute('role', 'tablist');
    expect(
      within(desktopTablist).getAllByRole('tab', { hidden: true }).length,
    ).toBeGreaterThanOrEqual(2);
  });
});
