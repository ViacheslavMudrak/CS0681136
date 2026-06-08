import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('.sitecore/component-map', () => ({ default: new Map() }));

vi.mock('@sitecore-content-sdk/nextjs', () => ({
  AppPlaceholder: ({ name }: { name: string }) => <div data-testid={`ph-${name}`} />,
}));

import { Default } from 'components/column-splitter/ColumnSplitter';

const baseRendering = { uid: 'cs1', componentName: 'ColumnSplitter' } as never;
const basePage = { mode: { isEditing: false } } as never;

describe('ColumnSplitter Default', () => {
  it('renders left and right panels with placeholders', () => {
    const { container } = render(
      <Default
        params={
          {
            styles: 'cs-style',
            RenderingIdentifier: 'cs-rid',
            EnabledPlaceholders: '1,2',
            ColumnWidth1: 'w-a',
            Styles1: 's-a',
            ColumnWidth2: 'w-b',
            Styles2: 's-b',
          } as never
        }
        rendering={baseRendering}
        page={basePage}
      />,
    );
    expect(screen.getByTestId('ph-column-1-{*}')).toBeInTheDocument();
    expect(screen.getByTestId('ph-column-2-{*}')).toBeInTheDocument();
    const cols = container.querySelectorAll('.lg\\:w-1\\/2');
    expect(cols.length).toBe(2);
    expect(cols[1].className).toContain('lg:flex');
  });

  it('maps a third column to RightPanel shell', () => {
    render(
      <Default
        params={
          {
            styles: '',
            RenderingIdentifier: 'x',
            EnabledPlaceholders: '1,2,3',
          } as never
        }
        rendering={baseRendering}
        page={basePage}
      />,
    );
    expect(screen.getByTestId('ph-column-3-{*}')).toBeInTheDocument();
  });
});
