import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const { tabAccordionSpy } = vi.hoisted(() => ({
  tabAccordionSpy: vi.fn(
    (props: { tabItems: unknown[]; rendering: unknown; page: unknown }) => (
      <div data-testid="tab-accordion-stub" data-tab-count={props.tabItems.length} />
    ),
  ),
}));

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const { mediaTileSitecoreSdkMock } = await import('src/test/mocks/viteSafeMocks');
  return mediaTileSitecoreSdkMock();
});

vi.mock('components/contentSwitcher/partial/TabAccordion', () => ({
  TabAccordion: (props: {
    tabItems: unknown[];
    rendering: unknown;
    page: unknown;
  }) => tabAccordionSpy(props),
}));

import { ContentSwitcherClient } from 'components/contentSwitcher/partial/ContentSwitcherClient';
import type { IContentSwitcherFields } from 'components/contentSwitcher/ContentSwitcher.type';
import type { IContentSwitcherProps } from 'components/contentSwitcher/ContentSwitcher';

const basePage = {
  mode: { isEditing: false, isPreview: false },
} as IContentSwitcherProps['page'];
const baseParams = {
  styles: '',
  RenderingIdentifier: 'cs-client-1',
} as IContentSwitcherProps['params'];
const baseRendering = {
  uid: 'r-cs',
  componentName: 'ContentSwitcher',
} as IContentSwitcherProps['rendering'];

describe('ContentSwitcherClient', () => {
  it('renders headline and description via RichText', () => {
    const fields: IContentSwitcherFields = {
      Headline: { value: 'Main title' },
      Description: { value: 'Support text' },
      TabItems: [
        {
          id: 't1',
          fields: {
            TabLabel: { value: 'A' },
            TabContent: { value: '' },
            MediaType: { fields: { Value: { value: 'Image' } } },
            Image: { value: { src: '', width: 1, height: 1, alt: '' } },
            Video: {
              fields: {
                BrightcoveId: { value: '' },
                Autoplay: { value: false },
                Loop: { value: false },
                Caption: { value: '' },
                CoverImage: { value: { src: '', width: 1, height: 1, alt: '' } },
                Title: { value: '' },
              },
            },
          },
        },
      ],
    };

    render(
      <ContentSwitcherClient
        fields={fields}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />,
    );

    const rich = screen.getAllByTestId('rich-text');
    expect(rich.some((el) => el.textContent === 'Main title')).toBe(true);
    expect(rich.some((el) => el.textContent === 'Support text')).toBe(true);
  });

  it('sets wrapper id from RenderingIdentifier and passes tab data to TabAccordion', () => {
    const fields: IContentSwitcherFields = {
      Headline: { value: 'H' },
      Description: { value: '' },
      TabItems: [
        {
          id: 'a',
          fields: {
            TabLabel: { value: 'One' },
            TabContent: { value: '' },
            MediaType: { fields: { Value: { value: 'Image' } } },
            Image: { value: { src: '', width: 1, height: 1, alt: '' } },
            Video: {
              fields: {
                BrightcoveId: { value: '' },
                Autoplay: { value: false },
                Loop: { value: false },
                Caption: { value: '' },
                CoverImage: { value: { src: '', width: 1, height: 1, alt: '' } },
                Title: { value: '' },
              },
            },
          },
        },
        {
          id: 'b',
          fields: {
            TabLabel: { value: 'Two' },
            TabContent: { value: '' },
            MediaType: { fields: { Value: { value: 'Image' } } },
            Image: { value: { src: '', width: 1, height: 1, alt: '' } },
            Video: {
              fields: {
                BrightcoveId: { value: '' },
                Autoplay: { value: false },
                Loop: { value: false },
                Caption: { value: '' },
                CoverImage: { value: { src: '', width: 1, height: 1, alt: '' } },
                Title: { value: '' },
              },
            },
          },
        },
      ],
    };

    const { container } = render(
      <ContentSwitcherClient
        fields={fields}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />,
    );

    expect(container.querySelector('#cs-client-1')).toBeTruthy();
    expect(container.querySelector('[data-analytics-region="cs-client-1"]')).toBeTruthy();

    expect(screen.getByTestId('tab-accordion-stub')).toHaveAttribute('data-tab-count', '2');
    expect(tabAccordionSpy).toHaveBeenCalled();
    const call = tabAccordionSpy.mock.calls[tabAccordionSpy.mock.calls.length - 1]![0];
    expect(call.tabItems).toHaveLength(2);
    expect(call.rendering).toBe(baseRendering);
    expect(call.page).toBe(basePage);
  });

  it('applies default surface background when BackgroundColor is unset', () => {
    const fields: IContentSwitcherFields = {
      Headline: { value: 'H' },
      Description: { value: '' },
      TabItems: [],
    };

    const { container } = render(
      <ContentSwitcherClient
        fields={fields}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />,
    );

    const root = container.querySelector('[data-analytics-region="cs-client-1"]');
    expect(root).toHaveClass('bg-surface');
    expect(root).not.toHaveClass('bg-white');
  });

  it('resolves BackgroundColor param from Sitecore droplist shape', () => {
    const fields: IContentSwitcherFields = {
      Headline: { value: 'H' },
      Description: { value: '' },
      TabItems: [],
    };

    const { container } = render(
      <ContentSwitcherClient
        fields={fields}
        params={{
          ...baseParams,
          BackgroundColor: { Value: { value: 'Light Blue' } },
        }}
        page={basePage}
        rendering={baseRendering}
      />,
    );

    const root = container.querySelector('[data-analytics-region="cs-client-1"]');
    expect(root).toHaveClass('bg-accent-teal');
  });
});
