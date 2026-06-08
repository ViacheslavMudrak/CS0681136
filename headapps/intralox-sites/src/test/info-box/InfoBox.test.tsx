import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ComponentRendering, Page } from '@sitecore-content-sdk/nextjs';

import { Default } from 'components/info-box/InfoBox';
import type { InfoBoxProps } from 'components/info-box/InfoBox.type';
import { INFOBOX_EMPTY_HINT } from 'components/info-box/infoBoxUtils';

vi.mock('.sitecore/component-map', () => ({
  default: new Map(),
}));

vi.mock('@sitecore-content-sdk/nextjs', () => ({
  RichText: ({ field }: { field?: { value?: string } }) =>
    field?.value != null && field.value !== '' ? (
      <div data-testid="sdk-richtext">{field.value}</div>
    ) : (
      <div data-testid="sdk-richtext-empty" />
    ),
}));

const basePage = { mode: { isEditing: false } } as unknown as Page;
const editingPage = { mode: { isEditing: true } } as unknown as Page;
const baseRendering = { componentName: 'InfoBox' } as unknown as ComponentRendering;

const baseParams = {
  styles: '',
  RenderingIdentifier: 'ib-1',
} satisfies InfoBoxProps['params'];

const contextItem = (value: string) => ({
  id: 'x',
  name: value,
  displayName: value,
  fields: { Value: { value } },
});

describe('InfoBox Default', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when fields are missing and not editing', () => {
    const { container } = render(
      <Default
        fields={undefined}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows empty hint when fields are missing and editing', () => {
    render(
      <Default
        fields={undefined}
        params={baseParams}
        page={editingPage}
        rendering={baseRendering}
      />
    );
    expect(screen.getByText(INFOBOX_EMPTY_HINT)).toBeInTheDocument();
    expect(screen.getByTestId('info-box')).toHaveAttribute('data-context', 'none');
  });

  it('returns null when text is empty and not editing', () => {
    const { container } = render(
      <Default
        fields={{ Text: { value: '' }, Context: contextItem('Info'), HideIcon: { value: false } }}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders Info context with lightbulb icon and info border class', () => {
    render(
      <Default
        fields={{
          Text: { value: '<strong>Tip</strong>: Hello' },
          Context: contextItem('Info'),
          HideIcon: { value: false },
        }}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    const box = screen.getByTestId('info-box');
    expect(box).toHaveAttribute('data-context', 'info');
    expect(box).toHaveAttribute('aria-label', 'Information');
    expect(screen.getByTestId('info-box-icon-info')).toBeInTheDocument();
    const shell = screen.getByTestId('info-box-shell');
    expect(shell.className).toContain('border-l-[var(--color-accent-warning)]');
    expect(shell.className).not.toMatch(/\bborder-t\b|\bborder-r\b|\bborder-b\b/);
    expect(screen.getByTestId('sdk-richtext')).toHaveTextContent('<strong>Tip</strong>: Hello');
  });

  it('renders Success context with check icon and success border class', () => {
    render(
      <Default
        fields={{
          Text: { value: '<p>Done</p>' },
          Context: contextItem('Success'),
          HideIcon: { value: false },
        }}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    const box = screen.getByTestId('info-box');
    expect(box).toHaveAttribute('data-context', 'success');
    expect(box).toHaveAttribute('aria-label', 'Success');
    expect(screen.getByTestId('info-box-icon-success')).toBeInTheDocument();
    expect(screen.getByTestId('info-box-shell').className).toContain('border-l-[var(--color-link)]');
    expect(screen.getByTestId('sdk-richtext')).toBeInTheDocument();
  });

  it('renders None context without icon and neutral border class', () => {
    render(
      <Default
        fields={{
          Text: { value: 'Plain' },
          Context: contextItem('None'),
          HideIcon: { value: false },
        }}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    expect(screen.getByTestId('info-box')).toHaveAttribute('data-context', 'none');
    expect(screen.queryByTestId('info-box-icon-info')).not.toBeInTheDocument();
    expect(screen.queryByTestId('info-box-icon-success')).not.toBeInTheDocument();
    expect(screen.getByTestId('info-box-shell').className).toContain('border-l-stroke-default');
  });

  it('hides icon when HideIcon is true but keeps Success border', () => {
    render(
      <Default
        fields={{
          Text: { value: 'Body' },
          Context: contextItem('Success'),
          HideIcon: { value: true },
        }}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    expect(screen.queryByTestId('info-box-icon-success')).not.toBeInTheDocument();
    expect(screen.getByTestId('info-box-shell').className).toContain('border-l-[var(--color-link)]');
  });

  it('renders empty rich text surface when editing and text is empty', () => {
    render(
      <Default
        fields={{ Text: { value: '' }, Context: contextItem('Info'), HideIcon: { value: false } }}
        params={baseParams}
        page={editingPage}
        rendering={baseRendering}
      />
    );
    expect(screen.getByTestId('sdk-richtext-empty')).toBeInTheDocument();
  });

  it('reads Text and Context from GraphQL-shaped datasource', () => {
    render(
      <Default
        fields={{
          data: {
            datasource: {
              Text: { jsonValue: { value: '<p>GQL</p>' } },
              Context: { jsonValue: contextItem('Info') },
              HideIcon: { jsonValue: { value: false } },
            },
          },
        }}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    expect(screen.getByTestId('sdk-richtext')).toHaveTextContent('<p>GQL</p>');
    expect(screen.getByTestId('info-box-icon-info')).toBeInTheDocument();
  });
});
