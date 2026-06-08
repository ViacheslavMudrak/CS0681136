import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@sitecore-content-sdk/nextjs', () => ({
  RichText: ({ field }: { field?: { value?: string } }) => (
    <div data-testid="richtext">{field?.value}</div>
  ),
}));

import { Default } from 'components/page-content/PageContent';

describe('PageContent Default', () => {
  it('renders fields.Content when present', () => {
    render(
      <Default
        params={{ styles: 'pc', RenderingIdentifier: 'pc-1' } as never}
        fields={{ Content: { value: '<p>From fields</p>' } }}
        page={{ layout: { sitecore: { route: { fields: {} } } } } as never}
      />,
    );
    expect(screen.getByTestId('richtext')).toHaveTextContent('<p>From fields</p>');
  });

  it('falls back to route Content when fields.Content is missing', () => {
    render(
      <Default
        params={{ styles: 'pc', RenderingIdentifier: 'pc-1' } as never}
        fields={{ Content: undefined as never }}
        page={{
          layout: {
            sitecore: { route: { fields: { Content: { value: '<p>From route</p>' } } } },
          },
        } as never}
      />,
    );
    expect(screen.getByTestId('richtext')).toHaveTextContent('<p>From route</p>');
  });

  it('shows placeholder text when no content field exists', () => {
    render(
      <Default
        params={{ styles: 'pc', RenderingIdentifier: 'pc-1' } as never}
        fields={{} as never}
        page={{ layout: { sitecore: { route: { fields: {} } } } } as never}
      />,
    );
    expect(screen.getByText('[Content]')).toBeInTheDocument();
  });
});
