import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('.sitecore/component-map', () => ({ default: new Map() }));

vi.mock('@sitecore-content-sdk/nextjs', () => ({
  AppPlaceholder: ({ name }: { name: string }) => <div data-testid={`ph-${name}`} />,
}));

import { Default } from 'components/row-splitter/RowSplitter';

const baseRendering = { uid: 'rs1', componentName: 'RowSplitter' } as never;
const basePage = { mode: { isEditing: false } } as never;

describe('RowSplitter Default', () => {
  it('renders a placeholder per EnabledPlaceholders entry', () => {
    const { container } = render(
      <Default
        params={
          {
            styles: 'rs-style',
            RenderingIdentifier: 'rs-rid',
            EnabledPlaceholders: '1,2',
            Styles1: 'a-style',
            Styles2: 'b-style',
          } as never
        }
        rendering={baseRendering}
        page={basePage}
      />,
    );
    expect(screen.getByTestId('ph-row-1-{*}')).toBeInTheDocument();
    expect(screen.getByTestId('ph-row-2-{*}')).toBeInTheDocument();
    const rows = container.querySelectorAll('.container-fluid');
    expect(rows[0].className).toContain('a-style');
    expect(rows[1].className).toContain('b-style');
  });

  it('renders nothing inside map when EnabledPlaceholders is missing', () => {
    const { container } = render(
      <Default
        params={{ styles: 'rs', RenderingIdentifier: 'x' } as never}
        rendering={baseRendering}
        page={basePage}
      />,
    );
    expect(container.querySelectorAll('[data-testid^="ph-"]').length).toBe(0);
  });
});
