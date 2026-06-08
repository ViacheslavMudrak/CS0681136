import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const React = await import('react');
  return {
    Text: ({ field }: { field?: { value?: string } }) => (
      <span data-testid="sdk-text">{field?.value ?? ''}</span>
    ),
    Link: ({
      field,
      children,
    }: {
      field?: { value?: { href?: string; title?: string } };
      children?: React.ReactNode;
    }) => (
      <a href={field?.value?.href} data-testid="sdk-link">
        {children}
      </a>
    ),
  };
});

import { Default } from 'components/title/Title';

const baseParams = { styles: ' title-style ', RenderingIdentifier: 'title-1' } as never;

describe('Title Default', () => {
  it('renders Text only in editing mode (no link wrapper)', () => {
    render(
      <Default
        params={baseParams}
        fields={{
          data: {
            datasource: {
              url: { path: '/page', siteName: 'corp' },
              field: { jsonValue: { value: 'Page Title' } },
            },
          },
        }}
        page={{
          mode: { isEditing: true },
          layout: { sitecore: { route: { fields: {} } } },
        } as never}
      />,
    );
    expect(screen.getByTestId('sdk-text')).toHaveTextContent('Page Title');
    expect(screen.queryByTestId('sdk-link')).toBeFalsy();
    expect(document.querySelector('.component.title')).toHaveClass('title-style');
  });

  it('wraps title in Link for visitors using datasource path', () => {
    render(
      <Default
        params={baseParams}
        fields={{
          data: {
            datasource: {
              url: { path: '/products', siteName: 'corp' },
              field: { jsonValue: { value: 'Products' } },
            },
          },
        }}
        page={{
          mode: { isEditing: false },
          layout: { sitecore: { route: { fields: {} } } },
        } as never}
      />,
    );
    const link = screen.getByTestId('sdk-link');
    expect(link).toHaveAttribute('href', '/products');
    expect(screen.getByTestId('sdk-text')).toHaveTextContent('Products');
  });

  it('falls back to contextItem when datasource is absent', () => {
    render(
      <Default
        params={baseParams}
        fields={{
          data: {
            contextItem: {
              url: { path: '/ctx', siteName: 'corp' },
              field: { jsonValue: { value: 'Context Title' } },
            },
          },
        }}
        page={{
          mode: { isEditing: false },
          layout: { sitecore: { route: { fields: {} } } },
        } as never}
      />,
    );
    expect(screen.getByTestId('sdk-link')).toHaveAttribute('href', '/ctx');
    expect(screen.getByTestId('sdk-text')).toHaveTextContent('Context Title');
  });

  it('falls back to route Title when no datasource/context field', () => {
    render(
      <Default
        params={baseParams}
        fields={{ data: {} }}
        page={{
          mode: { isEditing: false },
          layout: {
            sitecore: {
              route: { fields: { Title: { value: 'Route Title' } } },
            },
          },
        } as never}
      />,
    );
    expect(screen.getByTestId('sdk-text')).toHaveTextContent('Route Title');
  });
});
