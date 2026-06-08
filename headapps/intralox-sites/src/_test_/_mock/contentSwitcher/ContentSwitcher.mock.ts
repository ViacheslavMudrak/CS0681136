import { vi } from 'vitest';
import type { ComponentRendering } from '@sitecore-content-sdk/nextjs';

import type { IContentSwitcherFields } from 'components/contentSwitcher/ContentSwitcher.type';
import { MediaType } from 'src/utils/enum';

const textField = (value: string) => ({ value, editable: false as const });

const videoFields = (brightcoveId: string) =>
  ({
    fields: {
      Autoplay: { value: false },
      BrightcoveId: { value: brightcoveId },
      Caption: { value: '' },
      CoverImage: { value: {} },
      Loop: { value: false },
      Title: { value: '' },
    },
  }) as IContentSwitcherFields['TabItems'][number]['fields']['Video'];

/**
 * Minimal Sitecore-like field payloads for ContentSwitcher / TabAccordion tests.
 */
export function createContentSwitcherFields(
  overrides?: Partial<IContentSwitcherFields>,
): IContentSwitcherFields {
  const base: IContentSwitcherFields = {
    Headline: textField('Switcher Headline'),
    Description: textField('Description body'),
    TabItems: [
      {
        id: 'item-1',
        fields: {
          Image: { value: { src: 'https://example.com/a.jpg', alt: 'A' } },
          MediaType: { fields: { Value: textField(MediaType.IMAGE) } },
          TabContent: textField('First panel body'),
          TabLabel: textField('alpha'),
          Video: videoFields('vid-1'),
        },
      },
      {
        id: 'item-2',
        fields: {
          Image: { value: { src: 'https://example.com/b.jpg', alt: 'B' } },
          MediaType: { fields: { Value: textField(MediaType.IMAGE) } },
          TabContent: textField('Second panel body'),
          TabLabel: textField('beta'),
          Video: videoFields('vid-2'),
        },
      },
    ],
  };
  return { ...base, ...overrides };
}

export const mockRendering: ComponentRendering = {
  uid: 'rendering-uid',
  componentName: 'ContentSwitcher',
  dataSource: '/sitecore/content/test',
  placeholders: {},
} as ComponentRendering;

/** Flat rendering params as used at runtime (see RowSplitter, Promo, etc.). */
export const mockParamsContentSwitcher = {
  RenderingIdentifier: 'cs-test',
  DynamicPlaceholderId: 'tab-placeholder',
  styles: '',
};

/** Desktop breakpoint for TabAccordion `isMobile` logic (matchMedia max-width 991px). */
export function mockMatchMediaDesktop() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}
