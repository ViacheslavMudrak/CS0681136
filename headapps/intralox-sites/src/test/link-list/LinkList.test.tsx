import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { LinkField } from '@sitecore-content-sdk/nextjs';

vi.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field, tag = 'span' }: { field?: { value?: string }; tag?: string }) => {
    const Tag = tag as keyof JSX.IntrinsicElements;
    return <Tag data-testid="sdk-text">{field?.value ?? ''}</Tag>;
  },
  Link: ({ field }: { field?: { value?: { href?: string; text?: string } } }) =>
    field?.value?.href ? (
      <a data-testid="sdk-link" href={field.value.href}>
        {field.value.text ?? field.value.href}
      </a>
    ) : null,
}));

import { Default } from 'components/link-list/LinkList';

const baseParams = { styles: '', RenderingIdentifier: '' } as never;

function makeLink(href: string, text: string): LinkField {
  return { value: { href, text } } as LinkField;
}

function makeFields(results: Array<{ link: LinkField }>) {
  return {
    data: {
      datasource: {
        children: { results: results.map((r) => ({ field: r })) },
        field: { title: { value: 'My List' } },
      },
    },
  };
}

describe('LinkList Default', () => {
  it('renders fallback heading when fields are missing', () => {
    render(<Default fields={undefined as never} params={baseParams} />);
    expect(screen.getByRole('heading', { name: /link list/i })).toBeInTheDocument();
  });

  it('renders fallback heading when datasource is missing', () => {
    const fields = { data: { datasource: null } } as never;
    render(<Default fields={fields} params={baseParams} />);
    expect(screen.getByRole('heading', { name: /link list/i })).toBeInTheDocument();
  });

  it('renders the title and a list of links when datasource is present', () => {
    const fields = makeFields([
      { link: makeLink('/page-1', 'Page One') },
      { link: makeLink('/page-2', 'Page Two') },
    ]);
    render(<Default fields={fields as never} params={baseParams} />);
    expect(screen.getByTestId('sdk-text')).toBeInTheDocument();
    expect(screen.getAllByTestId('sdk-link')).toHaveLength(2);
  });

  it('marks the first item with class "first"', () => {
    const fields = makeFields([
      { link: makeLink('/a', 'A') },
      { link: makeLink('/b', 'B') },
    ]);
    const { container } = render(<Default fields={fields as never} params={baseParams} />);
    const items = container.querySelectorAll('li');
    expect(items[0].className).toMatch(/\bfirst\b/);
    expect(items[1].className).not.toMatch(/\bfirst\b/);
  });

  it('marks the last item with class "last"', () => {
    const fields = makeFields([
      { link: makeLink('/a', 'A') },
      { link: makeLink('/b', 'B') },
      { link: makeLink('/c', 'C') },
    ]);
    const { container } = render(<Default fields={fields as never} params={baseParams} />);
    const items = container.querySelectorAll('li');
    expect(items[items.length - 1].className).toMatch(/\blast\b/);
    expect(items[0].className).not.toMatch(/\blast\b/);
  });

  it('marks even-indexed items with class "odd" (index % 2 === 0)', () => {
    const fields = makeFields([
      { link: makeLink('/a', 'A') },
      { link: makeLink('/b', 'B') },
    ]);
    const { container } = render(<Default fields={fields as never} params={baseParams} />);
    const items = container.querySelectorAll('li');
    expect(items[0].className).toMatch(/\bodd\b/);
    expect(items[1].className).toMatch(/\beven\b/);
  });

  it('when only one item exists it is both first and last', () => {
    const fields = makeFields([{ link: makeLink('/a', 'A') }]);
    const { container } = render(<Default fields={fields as never} params={baseParams} />);
    const item = container.querySelector('li');
    expect(item?.className).toMatch(/\bfirst\b/);
    expect(item?.className).toMatch(/\blast\b/);
  });

  it('applies params.styles to wrapper and params.RenderingIdentifier as id', () => {
    const fields = makeFields([{ link: makeLink('/a', 'A') }]);
    const params = { styles: 'custom-style', RenderingIdentifier: 'test-id' } as never;
    const { container } = render(<Default fields={fields as never} params={params} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('custom-style');
    expect(wrapper.id).toBe('test-id');
  });

  it('filters out items without a link field', () => {
    const fields = {
      data: {
        datasource: {
          children: {
            results: [
              { field: { link: makeLink('/valid', 'Valid') } },
              { field: { link: null } },
            ],
          },
          field: { title: { value: 'My List' } },
        },
      },
    };
    render(<Default fields={fields as never} params={baseParams} />);
    expect(screen.getAllByTestId('sdk-link')).toHaveLength(1);
  });
});
