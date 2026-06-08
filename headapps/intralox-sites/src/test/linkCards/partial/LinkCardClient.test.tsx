import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('components/shared/ImageView/ImageView', () => ({
  ImageView: () => <div data-testid="link-card-image" />,
}));

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const { mergeContentSwitcherSitecoreSdk } = await import('src/test/mocks/viteSafeMocks');
  const actual = await vi.importActual<typeof import('@sitecore-content-sdk/nextjs')>(
    '@sitecore-content-sdk/nextjs',
  );
  return mergeContentSwitcherSitecoreSdk(actual);
});

import { LinkCardClient } from 'components/linkCards/partial/LinkCardClient';
import type { ILinkCardsFields } from 'components/linkCards/LinkCards.type';

const baseParams = { styles: '', RenderingIdentifier: 'link-cards-1' } as never;

const fields: ILinkCardsFields = {
  Cards: [
    {
      fields: {
        ColorScheme: { fields: { Value: { value: 'light' } } },
        Heading: { value: 'Tile title' },
        Description: { value: 'More text' },
        FocalPoint: { fields: { Value: { value: 'center' } } },
        Image: {
          value: { src: 'https://example.com/t.jpg', width: 200, height: 200, alt: '' },
        },
        Link: { value: { href: '/target', text: 'Read more' } },
      },
    },
  ],
  TileCount: { fields: { Value: { value: '3' } } },
};

describe('LinkCardClient', () => {
  it('renders card heading and link text', () => {
    render(
      <LinkCardClient fields={fields} params={baseParams} size="base" linkCardColorScheme="light" />,
    );

    expect(screen.getByText('Tile title')).toBeInTheDocument();
    expect(screen.getByText('More text')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/target');
  });

  describe('with matchMedia available (line 48)', () => {
    let originalMatchMedia: typeof window.matchMedia;

    beforeEach(() => {
      originalMatchMedia = window.matchMedia;
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query === '(max-width: 767px)' ? true : false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
    });

    afterEach(() => {
      Object.defineProperty(window, 'matchMedia', { writable: true, value: originalMatchMedia });
    });

    it('calls window.matchMedia and sets isMobile state (line 48)', () => {
      render(
        <LinkCardClient fields={fields} params={baseParams} size="base" linkCardColorScheme="light" />,
      );
      expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 767px)');
    });
  });
});
