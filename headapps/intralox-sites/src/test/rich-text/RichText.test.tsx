import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('lib/rich-text-i18n', () => ({
  RICH_TEXT_LABEL_FALLBACKS: {
    emptyHint: 'Rich text',
  },
  getRichTextLabels: vi.fn(async () => ({
    emptyHint: 'Rich text',
  })),
}));

import { Default } from 'components/rich-text/RichText';
import type { RichTextProps } from 'components/rich-text/RichText.type';

vi.mock('@sitecore-content-sdk/nextjs', () => ({
  RichText: ({
    field,
    className,
  }: {
    field?: { value?: string };
    className?: string;
  }) => (
    <div
      data-testid="rich-text"
      className={className}
      dangerouslySetInnerHTML={{ __html: field?.value ?? '' }}
    />
  ),
}));

const defaultPageLayout = {
  sitecore: {
    route: {} as { fields?: unknown },
  },
};

function createProps(overrides: Partial<RichTextProps> = {}): RichTextProps {
  const isEditing = overrides.page?.mode?.isEditing ?? false;
  const pageOverrides = overrides.page;
  const page = {
    ...(pageOverrides ?? {}),
    mode: pageOverrides?.mode ?? { isEditing },
    layout: pageOverrides?.layout ?? defaultPageLayout,
  } as RichTextProps['page'];
  return {
    rendering: overrides.rendering ?? ({ componentName: 'RichText' } as never),
    params: {
      styles: '',
      RenderingIdentifier: 'rich-text-test',
      ...overrides.params,
    },
    page,
    fields: overrides.fields,
  } as RichTextProps;
}

describe('RichText Default', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders product notes bullet points and embedded links from RTE content', async () => {
    const ui = await Default(
      createProps({
        fields: {
          Text: {
            value:
              '<ul><li><strong>Contact Intralox</strong></li><li>See <a href="/docs">Manual</a></li></ul>',
          },
        },
      }),
    );
    render(ui);

    expect(screen.getByTestId('rich-text').querySelectorAll('li').length).toBe(2);
    expect(screen.getByRole('link', { name: 'Manual' })).toHaveAttribute('href', '/docs');
  });

  it('supports GraphQL datasource rich text shape', async () => {
    const ui = await Default(
      createProps({
        fields: {
          data: {
            datasource: {
              Text: {
                jsonValue: {
                  value: '<ul><li>GraphQL item</li></ul>',
                },
              },
            },
          },
        },
      }),
    );
    render(ui);

    expect(screen.getByText('GraphQL item')).toBeInTheDocument();
  });

  it('supports lowercase GraphQL datasource rich text key', async () => {
    const ui = await Default(
      createProps({
        fields: {
          data: {
            datasource: {
              text: {
                jsonValue: {
                  value: '<ul><li>Lowercase graphql item</li></ul>',
                },
              },
            },
          },
        },
      }),
    );
    render(ui);

    expect(screen.getByText('Lowercase graphql item')).toBeInTheDocument();
  });

  it('does not render for visitors when rich text is empty HTML', async () => {
    const ui = await Default(
      createProps({
        fields: {
          Text: { value: '<p>&nbsp;</p>' },
        },
      }),
    );
    const { container } = render(ui);

    expect(container.firstChild).toBeNull();
  });

  it('shows empty hint for editors when fields are missing', async () => {
    const ui = await Default(
      createProps({
        fields: undefined,
        page: { mode: { isEditing: true } } as RichTextProps['page'],
      }),
    );
    render(ui);

    expect(screen.getByText(/rich text/i)).toBeInTheDocument();
  });

  it('exposes region aria-label from rendering displayName when content exists', async () => {
    const ui = await Default(
      createProps({
        rendering: { componentName: 'RichText', displayName: 'Product notes' } as never,
        fields: { Text: { value: '<p>Visible</p>' } },
      }),
    );
    render(ui);

    expect(screen.getByRole('region', { name: 'Product notes' })).toBeInTheDocument();
  });

  it('uses componentName for region aria-label when displayName is absent', async () => {
    const ui = await Default(
      createProps({
        rendering: { componentName: 'RichText' } as never,
        fields: { Text: { value: '<p>Visible</p>' } },
      }),
    );
    render(ui);

    expect(screen.getByRole('region', { name: 'RichText' })).toBeInTheDocument();
  });

  it('applies patents table field classes when RTE contains a responsive-table', async () => {
    const ui = await Default(
      createProps({
        fields: {
          Text: {
            value:
              '<div class="responsive-table"><table><thead><tr><th>Series</th><th>Style</th><th>US Patent Number(s)</th></tr></thead><tbody><tr><td>Series 400</td><td>Flat Top</td><td>US123</td></tr></tbody></table></div>',
          },
        },
      }),
    );
    render(ui);

    expect(screen.getByRole('region').className).toContain('!pt-12');
    const field = screen.getByTestId('rich-text');
    expect(field.className).toContain('prose');
    expect(field.className).toContain('patents-table');
    expect(field.querySelector('table td:nth-child(3)')).toBeTruthy();
  });

  it('applies page-title scale to leading h1 when patents RTE includes heading and table', async () => {
    const ui = await Default(
      createProps({
        fields: {
          Text: {
            value:
              '<h1>Intralox Patents</h1><div class="responsive-table"><table><thead><tr><th>Series</th><th>Style</th><th>US Patent Number(s)</th></tr></thead><tbody><tr><td>Series 400</td><td>Flat Top</td><td>US123</td></tr></tbody></table></div>',
          },
        },
      }),
    );
    render(ui);

    expect(screen.getByRole('heading', { level: 1, name: 'Intralox Patents' })).toBeInTheDocument();
    expect(screen.getByTestId('rich-text').className).toContain('prose');
  });

  it('tags trademark logo grid for horizontal layout when not editing', async () => {
    const ui = await Default(
      createProps({
        fields: {
          Text: {
            value:
              '<div class="responsive-table"><table><tbody>' +
              '<tr><td><strong>Registered Marks</strong></td></tr></tbody></table></div>' +
              '<div>' +
              '<div><div><div><img src="/logo-a.png" alt="Logo A" /></div></div></div>' +
              '<div><div><div><img src="/logo-b.png" alt="Logo B" /></div></div></div>' +
              '</div>',
          },
        },
      }),
    );
    render(ui);

    const field = screen.getByTestId('rich-text');
    expect(field.innerHTML).toContain('rte-image-grid');
    expect(field.className).toContain('prose');
    expect(field.className).toContain('patents-table');
  });

  it('marks patents spacer rows for compact spacing when not editing', async () => {
    const ui = await Default(
      createProps({
        fields: {
          Text: {
            value:
              '<div class="responsive-table"><figure class="table" style="height:2662px"><table><tbody>' +
              '<tr><td><strong>Series</strong></td><td><strong>Style</strong></td><td><strong>Patent</strong></td></tr>' +
              '<tr><td>Series 400</td><td>Dual Angled Roller</td><td>7360641</td></tr>' +
              '<tr><td>&nbsp;</td><td><br/></td><td><br/></td></tr>' +
              '<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>' +
              '<tr><td>Series 800</td><td>OHFT</td><td>11807461</td></tr>' +
              '</tbody></table></figure></div>',
          },
        },
      }),
    );
    render(ui);

    const field = screen.getByTestId('rich-text');
    expect(field.innerHTML).toContain('patents-table-spacer-row--divider');
    expect(field.innerHTML).toContain('patents-table-spacer-row--tight');
    expect(field.innerHTML).not.toContain('<br');
    expect(field.innerHTML).not.toContain('height:32px');
    expect(field.innerHTML).not.toContain('height:0!important');
    expect(field.innerHTML).toContain('patents-table');
    expect(field.innerHTML).toContain('Series 400');
    expect(field.innerHTML).toContain('Series 800');
  });

  it('keeps spacer rows in editing mode for authors', async () => {
    const spacerRow = '<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>';
    const ui = await Default(
      createProps({
        fields: {
          Text: {
            value: `<table><tbody><tr><td>A</td><td>B</td><td>C</td></tr>${spacerRow}</tbody></table>`,
          },
        },
        page: { mode: { isEditing: true } } as RichTextProps['page'],
      }),
    );
    render(ui);

    expect(screen.getByTestId('rich-text').innerHTML).toContain(spacerRow);
  });

  it('applies CKEditor figure and tbody header classes for patents-style table markup', async () => {
    const ui = await Default(
      createProps({
        fields: {
          Text: {
            value:
              '<div class="responsive-table"><figure class="table" style="height:2662px;width:1154px"><table style="top:0.37px"><tbody>' +
              '<tr><td><strong>Series</strong></td><td><strong>Style</strong></td><td><strong>US Patent Number(s)</strong></td></tr>' +
              '<tr><td>Series 400</td><td>Flat Top</td><td>US123</td></tr></tbody></table></figure></div>',
          },
        },
      }),
    );
    render(ui);

    const field = screen.getByTestId('rich-text');
    expect(field.className).toContain('prose');
    expect(field.className).toContain('patents-table');
    expect(field.querySelector('figure.table')).toBeTruthy();
  });

  it('keeps rich text editable when empty field exists in editing mode', async () => {
    const ui = await Default(
      createProps({
        fields: { Text: { value: '' } },
        page: { mode: { isEditing: true } } as RichTextProps['page'],
      }),
    );
    render(ui);

    expect(screen.getByTestId('rich-text')).toBeInTheDocument();
    expect(screen.queryByText(/rich text/i)).not.toBeInTheDocument();
  });
});
