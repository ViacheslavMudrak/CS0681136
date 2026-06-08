import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ComponentRendering, Page } from '@sitecore-content-sdk/nextjs';

import { Default } from 'components/text-aside/TextAndAside';
import type { TextAndAsideProps } from 'components/text-aside/TextAndAside.type';
import { TEXT_ASIDE_EMPTY_HINT } from 'components/text-aside/textAsideUtils';

vi.mock('.sitecore/component-map', () => ({
  default: new Map(),
}));

vi.mock('@sitecore-content-sdk/nextjs', () => ({
  AppPlaceholder: ({ name }: { name: string }) => (
    <div data-testid={`placeholder-${name}`}>ph:{name}</div>
  ),
  NextImage: ({ field }: { field?: { value?: { src?: string } } }) =>
    field?.value?.src ? (
      <img data-testid="sdk-image" src={field.value.src} alt="" />
    ) : null,
  RichText: ({ field }: { field?: { value?: string } }) =>
    field?.value != null ? <div data-testid="sdk-richtext">{field.value}</div> : null,
  Text: ({ field }: { field?: { value?: string }; tag?: string }) =>
    field?.value != null ? <span data-testid="sdk-text">{field.value}</span> : null,
}));

vi.mock('components/text-aside/partial/TextAsideVideoBlock', () => ({
  TextAsideVideoBlock: ({ video }: { video: { fields?: { BrightcoveId?: { value?: string } } } }) => (
    <div data-testid="aside-video">{video?.fields?.BrightcoveId?.value ?? ''}</div>
  ),
}));

const basePage = { mode: { isEditing: false } } as unknown as Page;
const baseRendering = { componentName: 'TextAndAside' } as unknown as ComponentRendering;

const baseParams = {
  styles: '',
  RenderingIdentifier: 'ta-1',
  DynamicPlaceholderId: '1',
  AsideWidth: { Value: { value: '50%' } },
  AlignColumns: { Value: { value: 'Center' } },
  AsidePosition: { Value: { value: 'Prefer Right' } },
} satisfies TextAndAsideProps['params'];

describe('TextAndAside Default', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty hint when fields are missing', () => {
    render(
      <Default
        fields={undefined}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    expect(screen.getByText(TEXT_ASIDE_EMPTY_HINT)).toBeInTheDocument();
  });

  it('applies background token from BackgroundColor param (e.g. Light Blue → teal)', () => {
    const { container } = render(
      <Default
        fields={{ Description: { value: '<p>x</p>' } }}
        params={{
          ...baseParams,
          BackgroundColor: { Value: { value: 'Light Blue' } },
        }}
        page={basePage}
        rendering={baseRendering}
      />,
    );
    expect(container.querySelector('section.text-aside')?.className).toContain('bg-accent-teal');
  });

  it('defaults section background to bg-surface when BackgroundColor is absent or unknown', () => {
    const { container } = render(
      <Default
        fields={undefined}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />,
    );
    expect(container.querySelector('section.text-aside')?.className).toContain('bg-surface');
    expect(container.querySelector('section.text-aside')?.className).not.toContain('bg-accent-teal');
  });

  it('renders empty hint when GraphQL envelope has no datasource', () => {
    render(
      <Default
        fields={{ data: {} }}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    expect(screen.getByText(TEXT_ASIDE_EMPTY_HINT)).toBeInTheDocument();
  });

  it('renders description from integrated GraphQL datasource', () => {
    render(
      <Default
        fields={{
          data: {
            datasource: {
              description: { jsonValue: { value: '<p>Integrated</p>' } },
              hasAsideContentPlaceholder: { jsonValue: { value: false } },
              hasTextContentPlaceholder: { jsonValue: { value: false } },
            },
          },
        }}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    expect(screen.getByTestId('sdk-richtext')).toHaveTextContent('<p>Integrated</p>');
  });

  it('renders description rich text when present', () => {
    render(
      <Default
        fields={{
          Description: { value: '<p>Hello aside</p>' },
          HasAsideContentPlaceholder: { value: false },
          HasTextContentPlaceholder: { value: false },
        }}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    expect(screen.getByTestId('sdk-richtext')).toHaveTextContent('<p>Hello aside</p>');
  });

  it('applies bg-accent-teal when BackgroundColor is Light Blue (Value.value shape)', () => {
    const { container } = render(
      <Default
        fields={{
          Description: { value: '<p>Body</p>' },
          HasAsideContentPlaceholder: { value: false },
          HasTextContentPlaceholder: { value: false },
        }}
        params={{ ...baseParams, BackgroundColor: { Value: { value: 'Light Blue' } } }}
        page={basePage}
        rendering={baseRendering}
      />
    );
    expect(container.querySelector('section.text-aside')).toHaveClass('bg-accent-teal');
  });

  it('uses default white background when BackgroundColor is omitted', () => {
    const { container } = render(
      <Default
        fields={{
          Description: { value: '<p>Body</p>' },
          HasAsideContentPlaceholder: { value: false },
          HasTextContentPlaceholder: { value: false },
        }}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    expect(container.querySelector('section.text-aside')).toHaveClass('bg-surface');
  });

  it('renders aside placeholder when HasAsideContentPlaceholder is true', () => {
    render(
      <Default
        fields={{
          Description: { value: '<p>Body</p>' },
          HasAsideContentPlaceholder: { value: true },
          HasTextContentPlaceholder: { value: false },
        }}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    expect(screen.getByTestId('placeholder-aside-content-{*}')).toBeInTheDocument();
  });

  it('renders main placeholder when HasTextContentPlaceholder is true', () => {
    render(
      <Default
        fields={{
          Description: { value: '<p>Body</p>' },
          HasAsideContentPlaceholder: { value: false },
          HasTextContentPlaceholder: { value: true },
        }}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    expect(screen.getByTestId('placeholder-text-content-{*}')).toBeInTheDocument();
  });

  it('in preview, hides main Title/Description when text placeholder is enabled', () => {
    render(
      <Default
        fields={{
          Title: { value: 'Hidden in preview' },
          Description: { value: '<p>Hidden body</p>' },
          HasAsideContentPlaceholder: { value: false },
          HasTextContentPlaceholder: { value: true },
        }}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    expect(screen.getByTestId('placeholder-text-content-{*}')).toBeInTheDocument();
    expect(screen.queryByTestId('sdk-richtext')).toBeNull();
    expect(screen.queryByText('Hidden in preview')).toBeNull();
  });

  it('in preview, hides aside image when aside placeholder is enabled', () => {
    render(
      <Default
        fields={{
          Description: { value: '<p>Main</p>' },
          Image: { value: { src: '/aside.jpg' } },
          MediaType: { value: 'Image' },
          HasAsideContentPlaceholder: { value: true },
          HasTextContentPlaceholder: { value: false },
        }}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    expect(screen.getByTestId('placeholder-aside-content-{*}')).toBeInTheDocument();
    expect(screen.queryByTestId('sdk-image')).toBeNull();
  });

  it('in editing mode, still shows datasource fields when placeholders are enabled', () => {
    const editingPage = { mode: { isEditing: true } } as unknown as Page;
    render(
      <Default
        fields={{
          Title: { value: 'Editable title' },
          Description: { value: '<p>Editable body</p>' },
          Image: { value: { src: '/e.jpg' } },
          MediaType: { value: 'Image' },
          HasAsideContentPlaceholder: { value: true },
          HasTextContentPlaceholder: { value: true },
        }}
        params={baseParams}
        page={editingPage}
        rendering={baseRendering}
      />
    );
    expect(screen.getByTestId('placeholder-text-content-{*}')).toBeInTheDocument();
    expect(screen.getByTestId('placeholder-aside-content-{*}')).toBeInTheDocument();
    expect(screen.getByTestId('sdk-richtext')).toHaveTextContent('<p>Editable body</p>');
    expect(screen.getByText('Editable title')).toBeInTheDocument();
    expect(screen.getByTestId('sdk-image')).toHaveAttribute('src', '/e.jpg');
  });

  it('renders null when no text, media, or placeholders for visitors', () => {
    const { container } = render(
      <Default
        fields={{
          HasAsideContentPlaceholder: { value: false },
          HasTextContentPlaceholder: { value: false },
        }}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders a 1px divider track and md insets when divider param is enabled', () => {
    const { container } = render(
      <Default
        fields={{
          Description: { value: '<p>x</p>' },
          Image: { value: { src: '/a.jpg' } },
          HasAsideContentPlaceholder: { value: false },
          HasTextContentPlaceholder: { value: false },
        }}
        params={{ ...baseParams, Divider: { Value: { value: 'Yes' } } }}
        page={basePage}
        rendering={baseRendering}
      />,
    );
    const grid = container.querySelector('section .grid');
    expect(grid?.className).toContain('1px');
    expect(grid?.className).not.toContain('md:gap-x-14');
    expect(container.querySelector('section [aria-hidden="true"]')).toBeTruthy();
  });

  it('uses 40% aside width grid ratio when AsideWidth is numeric 40', () => {
    const { container } = render(
      <Default
        fields={{
          Description: { value: '<p>x</p>' },
          Image: { value: { src: '/meat.jpg' } },
          HasAsideContentPlaceholder: { value: false },
          HasTextContentPlaceholder: { value: false },
        }}
        params={{ ...baseParams, AsideWidth: { Value: { value: '40' } } }}
        page={basePage}
        rendering={baseRendering}
      />,
    );
    const grid = container.querySelector('.grid');
    expect(grid?.className).toContain('3fr');
    expect(grid?.className).toContain('2fr');
  });

  it('renders optional title when populated', () => {
    render(
      <Default
        fields={{
          Title: { value: 'Section title' },
          Description: { value: '<p>x</p>' },
          HasAsideContentPlaceholder: { value: false },
          HasTextContentPlaceholder: { value: false },
        }}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    expect(screen.getByText('Section title')).toBeInTheDocument();
  });

  it('uses single-column shell (no CSS grid) when only rich text (no image or video)', () => {
    const { container } = render(
      <Default
        fields={{
          Title: { value: 'Food Safety' },
          Description: { value: '<p>Body only</p>' },
          HasAsideContentPlaceholder: { value: false },
          HasTextContentPlaceholder: { value: false },
        }}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    expect(container.querySelector('.text-and-aside .grid')).toBeNull();
    const shell = container.querySelector('.max-w-\\[1280px\\] > div');
    expect(shell?.className).toMatch(/w-full/);
    expect(shell?.className).toMatch(/min-w-0/);
  });

  it('text column returns null (line 62) when title, description, placeholder are all empty/false and not editing', () => {
    // Provide image so aside column renders, but no text content at all
    const { container } = render(
      <Default
        fields={{
          Title: { value: '' },
          Description: { value: '' },
          Image: { value: { src: '/img.jpg' } },
          HasAsideContentPlaceholder: { value: false },
          HasTextContentPlaceholder: { value: false },
        }}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />,
    );
    // Text column should be absent; only the aside (image) renders
    expect(screen.queryByTestId('sdk-richtext')).toBeFalsy();
    expect(screen.getByTestId('sdk-image')).toBeInTheDocument();
  });

  it('aside column returns null (line 148) when no image, video, placeholder and not editing', () => {
    // Provide title/description but no image or video in aside
    render(
      <Default
        fields={{
          Title: { value: 'Only Text' },
          Description: { value: '<p>Text only</p>' },
          HasAsideContentPlaceholder: { value: false },
          HasTextContentPlaceholder: { value: false },
        }}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />,
    );
    // Aside column returns null - no image or video
    expect(screen.queryByTestId('sdk-image')).toBeFalsy();
    expect(screen.queryByTestId('aside-video')).toBeFalsy();
    expect(screen.getByText('Only Text')).toBeInTheDocument();
  });
});
