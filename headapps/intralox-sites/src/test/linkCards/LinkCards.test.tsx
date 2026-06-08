import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const { linkCardSpy } = vi.hoisted(() => ({
  linkCardSpy: vi.fn(
    ({
      size,
      linkCardColorScheme,
    }: {
      size?: string;
      linkCardColorScheme?: string;
      fields: { Cards: unknown[] };
    }) => (
      <div
        data-testid="link-card-stub"
        data-size={size ?? ''}
        data-scheme={linkCardColorScheme ?? ''}
      />
    ),
  ),
}));

vi.mock('components/linkCards/partial/LinkCardClient', () => ({
  LinkCardClient: (props: {
    fields: { Cards: unknown[] };
    params: unknown;
    className?: string;
    size?: string;
    linkCardColorScheme?: string;
  }) => linkCardSpy(props),
}));

import { Default } from 'components/linkCards/LinkCards';
import type { ILinkCardsFields } from 'components/linkCards/LinkCards.type';

const card = {
  fields: {
    ColorScheme: { fields: { Value: { value: 'light' } } },
    Heading: { value: 'Card' },
    Description: { value: '' },
    FocalPoint: { fields: { Value: { value: 'center' } } },
    Image: { value: { src: 'https://example.com/c.jpg', width: 100, height: 100, alt: '' } },
    Link: { value: { href: '/', text: 'Go' } },
  },
};

const fields: ILinkCardsFields = {
  Cards: [card],
  TileCount: { fields: { Value: { value: '3' } } },
};

describe('LinkCards Default', () => {
  it('passes derived size and color scheme to LinkCardClient', () => {
    const params = {
      styles: '',
      RenderingIdentifier: 'lc-1',
      CardSize: { Value: { value: 'Compact' } },
      ColorScheme: { Value: { value: 'Dark' } },
    } as never;

    render(<Default fields={fields} params={params} />);

    expect(screen.getByTestId('link-card-stub')).toHaveAttribute('data-size', 'compact');
    expect(screen.getByTestId('link-card-stub')).toHaveAttribute('data-scheme', 'dark');
    expect(linkCardSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        fields,
        size: 'compact',
        linkCardColorScheme: 'dark',
        className: 'w-full',
      }),
    );
  });
});
