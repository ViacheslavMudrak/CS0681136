import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@sitecore-content-sdk/nextjs', () => ({
  NextImage: ({
    field,
    unoptimized,
  }: {
    field?: { value?: { src?: string; alt?: string } };
    unoptimized?: boolean;
  }) =>
    field?.value?.src ? (
      <img
        data-testid="next-image-brandline"
        data-unoptimized={unoptimized ? 'true' : 'false'}
        src={field.value.src}
        alt={field.value.alt ?? ''}
      />
    ) : null,
}));

import { Default, SlantBottom } from 'components/branding-line/BrandingLine';
import type { IBrandLineFields } from 'components/branding-line/BrandingLine.type';

const pngFields: IBrandLineFields = {
  BrandingLineImage: {
    value: { src: 'https://example.com/brand.png', width: 400, height: 40, alt: 'Brand' },
  },
  BrandingLineType: { fields: { Value: { value: 'Default' } } },
};

describe('BrandingLine', () => {
  it('Default renders NextImage for non-SVG sources', () => {
    render(<Default fields={pngFields} params={{}} />);
    const img = screen.getByTestId('next-image-brandline');
    expect(img).toHaveAttribute('src', 'https://example.com/brand.png');
  });

  it('SlantBottom matches Default markup for the same fields', () => {
    const { container: a } = render(<Default fields={pngFields} params={{}} />);
    const { container: b } = render(<SlantBottom fields={pngFields} params={{}} />);
    expect(a.querySelector('.w-full')).toBeTruthy();
    expect(b.querySelector('.w-full')).toBeTruthy();
  });

  it('sets root id from params.RenderingIdentifier lowercased for in-page anchors', () => {
    const { container } = render(
      <Default
        fields={pngFields}
        params={{ RenderingIdentifier: 'Branding_Line' }}
      />,
    );

    expect(container.querySelector('.w-full')).toHaveAttribute('id', 'branding_line');
  });

  it('renders NextImage with unoptimized for SVG sources', () => {
    const svgFields: IBrandLineFields = {
      ...pngFields,
      BrandingLineImage: {
        value: { src: 'https://example.com/line.svg', width: 1200, height: 120, alt: 'Brand line' },
      },
    };
    render(<Default fields={svgFields} params={{}} />);
    const img = screen.getByTestId('next-image-brandline');
    expect(img).toHaveAttribute('src', 'https://example.com/line.svg');
    expect(img).toHaveAttribute('data-unoptimized', 'true');
  });

  it('renders NextImage without unoptimized for raster sources', () => {
    render(<Default fields={pngFields} params={{}} />);
    expect(screen.getByTestId('next-image-brandline')).toHaveAttribute('data-unoptimized', 'false');
  });
});
