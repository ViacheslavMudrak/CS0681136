import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const replaceMock = vi.fn();

function createSearchParams(initial: string) {
  return new URLSearchParams(initial);
}

let searchParamsRef = createSearchParams('');

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => '/solutions',
  useSearchParams: () => searchParamsRef,
}));

vi.mock('src/hooks/useWindowSize', () => ({
  useWindowSize: () => ({ width: 1200, height: 800 }),
}));

vi.mock('components/shared/ImageView/ImageView', () => ({
  ImageView: () => <div data-testid="image-view-mock" />,
}));

vi.mock('src/components/shared/video/Video', () => ({
  default: ({ videoId }: { videoId?: string }) => (
    <div data-testid="video-mock" data-video-id={videoId ?? ''} />
  ),
}));

vi.mock('components/contentSwitcher/partial/TabAccordionTabPlaceholder', async () => {
  const { tabAccordionTabPlaceholderMock } = await import('src/test/mocks/viteSafeMocks');
  return tabAccordionTabPlaceholderMock();
});

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const actual = await vi.importActual<typeof import('@sitecore-content-sdk/nextjs')>(
    '@sitecore-content-sdk/nextjs',
  );
  const { mergeContentSwitcherSitecoreSdk } = await import('src/test/mocks/viteSafeMocks');
  return mergeContentSwitcherSitecoreSdk(actual);
});

import { TabAccordion } from 'components/contentSwitcher/partial/TabAccordion';
import type { ITabItemsFields } from 'components/contentSwitcher/ContentSwitcher.type';
import { MediaType } from 'src/utils/enum';
import type { IContentSwitcherProps } from 'components/contentSwitcher/ContentSwitcher';

const basePage = {
  mode: { isEditing: false, isPreview: false },
} as IContentSwitcherProps['page'];

const baseRendering = {
  uid: 'r-tabs',
  componentName: 'ContentSwitcher',
} as IContentSwitcherProps['rendering'];

const baseParams = {
  styles: '',
  RenderingIdentifier: 'cs-tabs',
} as IContentSwitcherProps['params'];

function tabItem(
  id: string,
  label: string,
  contentHtml: string,
  media: MediaType,
): ITabItemsFields {
  return {
    id,
    fields: {
      TabLabel: { value: label },
      TabContent: { value: contentHtml },
      MediaType: { fields: { Value: { value: media } } },
      Image: {
        value: {
          src: 'https://example.com/tab.jpg',
          width: 400,
          height: 300,
          alt: '',
        },
      },
      Video: {
        fields: {
          BrightcoveId: { value: 'bc-1' },
          Autoplay: { value: false },
          Loop: { value: false },
          Caption: { value: '' },
          CoverImage: { value: { src: '', width: 1, height: 1, alt: '' } },
          Title: { value: 'Clip' },
        },
      },
    },
  };
}

describe('TabAccordion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParamsRef = createSearchParams('');
    replaceMock.mockClear();

    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: !query.includes('max-width: 767px'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
  });

  it('renders a tablist and tab labels', () => {
    const items = [
      tabItem('1', 'Alpha', '<p>First body</p>', MediaType.IMAGE),
      tabItem('2', 'Beta', '<p>Second body</p>', MediaType.IMAGE),
    ];

    render(
      <TabAccordion
        tabItems={items}
        params={baseParams}
        rendering={baseRendering}
        page={basePage}
      />,
    );

    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab', { name: 'Alpha' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('tab', { name: 'Beta' }).length).toBeGreaterThan(0);
  });

  it('shows image media when tab uses Image media type', () => {
    const items = [tabItem('1', 'Pic', '<p>Text</p>', MediaType.IMAGE)];

    render(
      <TabAccordion
        tabItems={items}
        params={baseParams}
        rendering={baseRendering}
        page={basePage}
      />,
    );

    expect(screen.getByTestId('image-view-mock')).toBeInTheDocument();
    expect(screen.queryByTestId('video-mock')).not.toBeInTheDocument();
  });

  it('shows video when tab media type is Video', () => {
    const items = [tabItem('1', 'Clip tab', '<p>Vid</p>', MediaType.VIDEO)];

    render(
      <TabAccordion
        tabItems={items}
        params={baseParams}
        rendering={baseRendering}
        page={basePage}
      />,
    );

    const video = screen.getByTestId('video-mock');
    expect(video).toHaveAttribute('data-video-id', 'bc-1');
  });

  it('exposes placeholder names for each tab panel while editing (empty placeholders still mount)', () => {
    const items = [
      tabItem('1', 'One', '<p>a</p>', MediaType.IMAGE),
      tabItem('2', 'Two', '<p>b</p>', MediaType.IMAGE),
    ];

    render(
      <TabAccordion
        tabItems={items}
        params={baseParams}
        rendering={baseRendering}
        page={{ mode: { isEditing: true, isPreview: false } } as IContentSwitcherProps['page']}
      />,
    );

    const placeholders = screen.getAllByTestId('sitecore-placeholder');
    expect(placeholders.map((el) => el.getAttribute('data-placeholder-name'))).toEqual([
      'content-switcher-tab-1-{*}',
      'content-switcher-tab-2-{*}',
    ]);
  });

  it('does not render tab placeholder shell when not editing and placeholder has no renderings', () => {
    const items = [
      tabItem('1', 'One', '<p>a</p>', MediaType.IMAGE),
      tabItem('2', 'Two', '<p>b</p>', MediaType.IMAGE),
    ];

    render(
      <TabAccordion
        tabItems={items}
        params={baseParams}
        rendering={{
          ...baseRendering,
          placeholders: {
            'content-switcher-tab-1-{*}': [],
            'content-switcher-tab-2-{*}': [],
          },
        }}
        page={basePage}
      />,
    );

    expect(screen.queryAllByTestId('sitecore-placeholder')).toHaveLength(0);
  });

  it('renders tab placeholder when layout includes child renderings for that tab', () => {
    const items = [
      tabItem('1', 'One', '<p>a</p>', MediaType.IMAGE),
      tabItem('2', 'Two', '<p>b</p>', MediaType.IMAGE),
    ];

    render(
      <TabAccordion
        tabItems={items}
        params={baseParams}
        rendering={{
          ...baseRendering,
          placeholders: {
            'content-switcher-tab-1-{*}': [],
            'content-switcher-tab-2-{*}': [
              { componentName: 'Callout', uid: 'child-1' } as never,
            ],
          },
        }}
        page={basePage}
      />,
    );

    const placeholders = screen.getAllByTestId('sitecore-placeholder');
    expect(placeholders).toHaveLength(1);
    expect(placeholders[0]).toHaveAttribute(
      'data-placeholder-name',
      'content-switcher-tab-2-{*}',
    );
  });

  it('marks the tab from ?solution= as selected when it matches a label', () => {
    searchParamsRef = createSearchParams('solution=Beta');
    const items = [
      tabItem('1', 'Alpha', '<p>a</p>', MediaType.IMAGE),
      tabItem('2', 'Beta', '<p>b</p>', MediaType.IMAGE),
    ];

    render(
      <TabAccordion
        tabItems={items}
        params={baseParams}
        rendering={baseRendering}
        page={basePage}
      />,
    );

    const betaTabs = screen.getAllByRole('tab', { name: 'Beta' });
    expect(betaTabs.some((t) => t.getAttribute('aria-selected') === 'true')).toBe(true);
  });

  it('does not call router.replace while editing', async () => {
    const items = [
      tabItem('1', 'Alpha', '<p>a</p>', MediaType.IMAGE),
      tabItem('2', 'Beta', '<p>b</p>', MediaType.IMAGE),
    ];

    render(
      <TabAccordion
        tabItems={items}
        params={baseParams}
        rendering={baseRendering}
        page={{ mode: { isEditing: true, isPreview: false } } as IContentSwitcherProps['page']}
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getAllByRole('tab', { name: 'Beta' })[0]!);

    expect(replaceMock).not.toHaveBeenCalled();
  });
});
