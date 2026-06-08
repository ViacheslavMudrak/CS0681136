import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ComponentRendering, Page } from '@sitecore-content-sdk/nextjs';

import { Default } from 'components/two-column-container/TwoColumnContainer';
import type { TwoColumnContainerProps } from 'components/two-column-container/TwoColumnContainer.type';

const placeholders: { name: string }[] = [];

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const React = await import('react');
  return {
    AppPlaceholder: ({ name }: { name?: string }) => {
      placeholders.push({ name: String(name) });
      return React.createElement('div', { 'data-testid': `ph-${name}` });
    },
  };
});

vi.mock('.sitecore/component-map', () => ({
  default: new Map(),
}));

const basePage = { mode: { isEditing: false } } as unknown as Page;
const baseRendering = { componentName: 'TwoColumnContainer' } as unknown as ComponentRendering;

describe('TwoColumnContainer Default', () => {
  beforeEach(() => {
    placeholders.length = 0;
    vi.clearAllMocks();
  });

  it('renders left and right placeholders with dynamic keys', () => {
    const params = {
      styles: '',
      RenderingIdentifier: 'tcc-1',
      Size: { Value: { value: '70X30' } },
    } as unknown as TwoColumnContainerProps['params'];

    render(<Default params={params} rendering={baseRendering} page={basePage} />);

    expect(screen.getByTestId('two-column-container')).toHaveAttribute('data-layout', '70X30');
    expect(screen.getByTestId('two-column-container-outer')).toBeInTheDocument();
    expect(placeholders.map((p) => p.name)).toEqual(['left-column-{*}', 'right-column-{*}']);

    const rightPh = screen.getByTestId('ph-right-column-{*}');
    expect(rightPh.parentElement).toHaveClass('two-column-right-column');
    expect(rightPh.parentElement?.className).toMatch(/\bflex-col\b/);
    expect(rightPh.parentElement?.className).toMatch(/gap-\[16px\]/);
  });

  it('treats missing styles as empty string (params.styles ?? branch)', () => {
    const params = {
      RenderingIdentifier: 'tcc-2',
      Size: { Value: { value: '50X50' } },
    } as unknown as TwoColumnContainerProps['params'];

    const { container } = render(<Default params={params} rendering={baseRendering} page={basePage} />);

    const section = container.querySelector('section');
    expect(section?.className).toMatch(/two-column-container/);
    expect(section?.className).not.toMatch(/\sundefined/);
  });

  it('uses viewport full-bleed shell tokens on section root', () => {
    const params = {
      styles: '',
      RenderingIdentifier: 'tcc-shell',
      Size: { Value: { value: '50X50' } },
    } as unknown as TwoColumnContainerProps['params'];

    render(<Default params={params} rendering={baseRendering} page={basePage} />);

    const section = screen.getByTestId('two-column-container');
    expect(section.className).toContain('calc(50%-50vw)');
    expect(section.className).toContain('two-column-container');
  });

  it('uses derived layout tokens for tablet banded shell and column gap (70/30 grid)', () => {
    const params = {
      styles: '',
      RenderingIdentifier: 'tcc-band',
      Size: { Value: { value: '70X30' } },
    } as unknown as TwoColumnContainerProps['params'];

    render(<Default params={params} rendering={baseRendering} page={basePage} />);

    const outer = screen.getByTestId('two-column-container-outer');
    expect(outer.className).toContain(
      'min-[768px]:max-[991px]:max-w-[length:var(--width-banded-section-max-tablet)]',
    );

    const grid = outer.querySelector('.grid');
    expect(grid?.className).toContain('md:gap-x-[length:var(--two-column-column-gap)]');
    expect(grid?.className).toContain('md:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]');
  });

  it('applies responsive outer band padding (matches dev featured-news.scss band)', () => {
    const params = {
      styles: '',
      RenderingIdentifier: 'tcc-outer',
      Size: { Value: { value: '50X50' } },
    } as unknown as TwoColumnContainerProps['params'];

    render(<Default params={params} rendering={baseRendering} page={basePage} />);

    const outer = screen.getByTestId('two-column-container-outer');
    expect(outer.className).toContain('py-12');
    expect(outer.className).toContain('px-4');
    expect(outer.className).toContain('mx-auto');
    expect(outer.className).not.toContain('[.two-column-container_&]:p-0');
  });
});
