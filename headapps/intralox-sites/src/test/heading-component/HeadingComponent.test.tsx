import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ComponentRendering, Page } from '@sitecore-content-sdk/nextjs';

import { Default } from 'components/heading-component/HeadingComponent';
import type { HeadingComponentProps } from 'components/heading-component/HeadingComponent.type';
import { HEADING_COMPONENT_EMPTY_HINT } from 'components/heading-component/headingComponentUtils';

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const React = await import('react');
  return {
    Text: ({
      field,
      tag: Tag = 'span',
      className,
      ...rest
    }: {
      field?: { value?: string };
      tag?: keyof JSX.IntrinsicElements;
      className?: string;
    }) =>
      React.createElement(
        Tag,
        { ...rest, className },
        field?.value ?? '',
      ),
  };
});

const baseRendering = { componentName: 'HeadingComponent' } as unknown as ComponentRendering;

const baseParams = {
  styles: '',
  RenderingIdentifier: 'hc-1',
  Color: { Value: { value: 'Black' } },
  Width: { Value: { value: 'Full' } },
} satisfies HeadingComponentProps['params'];

const sampleFields = {
  HeadingLevel: { fields: { Value: { value: 'H2' } } },
  Text: { value: 'Main headline' },
  IncludeDivider: { value: false },
  Eyebrow: { value: '' },
  UpperCase: { value: false },
} satisfies HeadingComponentProps['fields'];

describe('HeadingComponent Default', () => {
  it('renders empty hint when fields are missing', () => {
    const page = { mode: { isEditing: false } } as unknown as Page;
    render(
      <Default
        fields={undefined}
        params={baseParams}
        page={page}
        rendering={baseRendering}
      />,
    );
    expect(screen.getByText(HEADING_COMPONENT_EMPTY_HINT)).toBeInTheDocument();
  });

  it('returns null in preview when Text is empty', () => {
    const page = { mode: { isEditing: false } } as unknown as Page;
    const { container } = render(
      <Default
        fields={{ ...sampleFields, Text: { value: '' } }}
        params={baseParams}
        page={page}
        rendering={baseRendering}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders main text and default h2 tag from HeadingLevel', () => {
    const page = { mode: { isEditing: false } } as unknown as Page;
    render(
      <Default
        fields={sampleFields}
        params={baseParams}
        page={page}
        rendering={baseRendering}
      />,
    );
    expect(document.querySelector('.heading-component-outer')).toBeInTheDocument();
    expect(document.querySelector('.font-media-tile')).toBeInTheDocument();
    expect(document.querySelector('.text-left')).toBeInTheDocument();
    expect(document.querySelector('.items-start')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Main headline');
  });

  it('applies center alignment when TextAlign is Center', () => {
    const page = { mode: { isEditing: false } } as unknown as Page;
    render(
      <Default
        fields={sampleFields}
        params={{
          ...baseParams,
          TextAlign: { Value: { value: 'Center' } },
        }}
        page={page}
        rendering={baseRendering}
      />,
    );
    expect(document.querySelector('.text-center')).toBeInTheDocument();
    expect(document.querySelector('.items-center')).toBeInTheDocument();
  });

  it('uses HeadingLevel for semantic tag', () => {
    const page = { mode: { isEditing: false } } as unknown as Page;
    render(
      <Default
        fields={{
          ...sampleFields,
          HeadingLevel: { fields: { Value: { value: 'H3' } } },
        }}
        params={baseParams}
        page={page}
        rendering={baseRendering}
      />,
    );
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('supports h6 via design-system Heading level 6', () => {
    const page = { mode: { isEditing: false } } as unknown as Page;
    render(
      <Default
        fields={{
          ...sampleFields,
          HeadingLevel: { fields: { Value: { value: 'H6' } } },
        }}
        params={baseParams}
        page={page}
        rendering={baseRendering}
      />,
    );
    const heading = screen.getByRole('heading', { level: 6 });
    expect(heading).toHaveTextContent('Main headline');
    expect(heading.className).toMatch(/text-sm/);
  });

  it('renders decorative hr when IncludeDivider is true', () => {
    const page = { mode: { isEditing: false } } as unknown as Page;
    render(
      <Default
        fields={{ ...sampleFields, IncludeDivider: { value: true } }}
        params={baseParams}
        page={page}
        rendering={baseRendering}
      />,
    );
    const hr = document.querySelector('hr[aria-hidden="true"]');
    expect(hr).toBeInTheDocument();
  });

  it('does not render hr when IncludeDivider is false', () => {
    const page = { mode: { isEditing: false } } as unknown as Page;
    render(
      <Default
        fields={{ ...sampleFields, IncludeDivider: { value: false } }}
        params={baseParams}
        page={page}
        rendering={baseRendering}
      />,
    );
    expect(document.querySelector('hr')).toBeNull();
  });

  it('applies uppercase class when UpperCase is true', () => {
    const page = { mode: { isEditing: false } } as unknown as Page;
    render(
      <Default
        fields={{ ...sampleFields, UpperCase: { value: true } }}
        params={baseParams}
        page={page}
        rendering={baseRendering}
      />,
    );
    const h = screen.getByRole('heading', { level: 2 });
    expect(h.className).toMatch(/uppercase/);
  });

  it('renders Eyebrow in preview when non-empty', () => {
    const page = { mode: { isEditing: false } } as unknown as Page;
    render(
      <Default
        fields={{ ...sampleFields, Eyebrow: { value: 'Eyebrow' } }}
        params={baseParams}
        page={page}
        rendering={baseRendering}
      />,
    );
    expect(screen.getByText('Eyebrow')).toBeInTheDocument();
  });

  it('omits Eyebrow in preview when blank', () => {
    const page = { mode: { isEditing: false } } as unknown as Page;
    render(
      <Default
        fields={{ ...sampleFields, Eyebrow: { value: '   ' } }}
        params={baseParams}
        page={page}
        rendering={baseRendering}
      />,
    );
    const paragraphs = screen.queryAllByRole('paragraph');
    expect(paragraphs).toHaveLength(0);
  });

  it('shows Eyebrow row in editing when Eyebrow is blank', () => {
    const page = { mode: { isEditing: true } } as unknown as Page;
    render(
      <Default
        fields={{ ...sampleFields, Eyebrow: { value: '' } }}
        params={baseParams}
        page={page}
        rendering={baseRendering}
      />,
    );
    expect(screen.getByRole('paragraph')).toBeInTheDocument();
  });

  it('applies color class from params to the heading only', () => {
    const page = { mode: { isEditing: false } } as unknown as Page;
    render(
      <Default
        fields={{ ...sampleFields, Eyebrow: { value: 'Eyebrow line' } }}
        params={{
          ...baseParams,
          Color: { Value: { value: 'Cyan' } },
        }}
        page={page}
        rendering={baseRendering}
      />,
    );
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.className).toMatch(/text-nav-link-hover/);
    const eyebrow = screen.getByText('Eyebrow line');
    expect(eyebrow.className).toMatch(/text-ink-muted/);
    expect(eyebrow.className).not.toMatch(/text-nav-link-hover/);
  });

  it('applies black surface when Color is White', () => {
    const page = { mode: { isEditing: false } } as unknown as Page;
    render(
      <Default
        fields={sampleFields}
        params={{
          ...baseParams,
          Color: { Value: { value: 'White' } },
        }}
        page={page}
        rendering={baseRendering}
      />,
    );
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.className).toMatch(/text-ink-inverse/);
    const surface = heading.closest('.bg-surface-strong');
    expect(surface).toBeTruthy();
  });

  it('applies width constraint class from params', () => {
    const page = { mode: { isEditing: false } } as unknown as Page;
    render(
      <Default
        fields={sampleFields}
        params={{
          ...baseParams,
          Width: { Value: { value: '1/2' } },
        }}
        page={page}
        rendering={baseRendering}
      />,
    );
    const col = document.querySelector('.md\\:max-w-\\[50\\%\\]');
    expect(col).toBeInTheDocument();
    expect(col?.className).toMatch(/me-auto/);
    expect(col?.className).toMatch(/self-start/);
  });
});
