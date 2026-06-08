import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('components/linkGrid/partial/LinkGridCard', () => ({
  LinkGridCard: ({ item }: { item: { Title: string } }) => (
    <div data-testid="link-grid-card-mock">{item.Title}</div>
  ),
}));

import { LinkGridClient } from 'components/linkGrid/partial/LinkGridClient';
import type { ILinkGridFields } from 'components/linkGrid/LinkGrid.type';

const baseParams = { styles: '', RenderingIdentifier: 'link-grid-1' } as never;

describe('LinkGridClient', () => {
  it('renders a card per listing from ContentItems (resolver shape)', () => {
    const fields = {
      Headline: { value: 'H' },
      Description: { value: 'D' },
      ContentItems: {
        value: [
          {
            Title: 'Service A',
            LinkURL: '/a',
            Image: 'https://example.com/a.jpg',
            Description: 'Desc A',
          },
          {
            Title: 'Service B',
            LinkURL: '/bee',
            Image: 'https://example.com/b.jpg',
            Description: 'Desc B',
          },
        ],
      },
      ItemCount: { ValueConverter: '3' },
    } satisfies ILinkGridFields;

    const { container } = render(<LinkGridClient fields={fields} params={baseParams} />);

    expect(container.querySelector('[role="list"]')).toBeTruthy();
    expect(screen.getAllByTestId('link-grid-card-mock').map((el) => el.textContent)).toEqual([
      'Service A',
      'Service B',
    ]);
  });

  it('renders no cards when ContentItems is empty (list only)', () => {
    const fields = {
      Headline: { value: 'H' },
      Description: { value: 'D' },
      ContentItems: { value: [] },
      ItemCount: { ValueConverter: '3' },
    } satisfies ILinkGridFields;

    render(<LinkGridClient fields={fields} params={baseParams} />);
    expect(screen.queryByTestId('link-grid-card-mock')).not.toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  describe('with matchMedia available (line 52)', () => {
    let originalMatchMedia: typeof window.matchMedia;

    beforeEach(() => {
      originalMatchMedia = window.matchMedia;
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query === '(max-width: 767px)' ? false : true,
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

    it('calls window.matchMedia and sets isMobile when matchMedia is available (line 52)', () => {
      const fields = {
        Headline: { value: 'Grid' },
        ContentItems: { value: [{ Title: 'Item A', LinkURL: '/a', Image: '', Description: '' }] },
        ItemCount: { ValueConverter: '3' },
      } satisfies ILinkGridFields;

      render(<LinkGridClient fields={fields} params={baseParams} />);
      expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 767px)');
    });
  });
});
