import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import type { ComponentRendering, Page } from '@sitecore-content-sdk/nextjs';

import { Default } from 'components/featured-news/FeaturedNews';
import type { FeaturedNewsProps } from 'components/featured-news/FeaturedNews.type';
import {
  FEATURED_NEWS_EMPTY_DATASOURCE,
  FEATURED_NEWS_EMPTY_LISTINGS_EDITING_HINT,
} from 'components/featured-news/featuredNewsUtils';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => (key === 'READMORE' ? 'Read More' : key),
}));

vi.mock('.sitecore/component-map', () => ({
  default: new Map(),
}));

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const React = await import('react');
  return {
    Text: ({
      field,
      tag: Tag = 'span',
      ...rest
    }: {
      field?: { value?: string };
      tag?: keyof JSX.IntrinsicElements;
      id?: string;
      className?: string;
    }) =>
      React.createElement(Tag, { ...rest }, field?.value ?? ''),
    RichText: ({ field }: { field?: { value?: string } }) =>
      React.createElement('div', { 'data-testid': 'richtext' }, field?.value ?? ''),
    Link: ({
      field,
      className,
      children,
      'aria-label': ariaLabel,
    }: {
      field?: { value?: { href?: string; text?: string; target?: string } };
      className?: string;
      children?: React.ReactNode;
      'aria-label'?: string;
    }) => (
      <a
        href={field?.value?.href}
        data-target={field?.value?.target}
        className={className}
        aria-label={ariaLabel}
      >
        {children ?? field?.value?.text}
      </a>
    ),
    NextImage: ({ field }: { field?: { value?: { src?: string; alt?: string } } }) => (
      <img alt={field?.value?.alt ?? ''} src={field?.value?.src} data-testid="next-image" />
    ),
  };
});

const basePage = { mode: { isEditing: false } } as unknown as Page;
const editingPage = { mode: { isEditing: true } } as unknown as Page;
const baseRendering = { componentName: 'FeaturedNews' } as unknown as ComponentRendering;

const baseParams = {
  styles: '',
  RenderingIdentifier: 'fn-1',
} satisfies FeaturedNewsProps['params'];

const viewAllJson =
  '{"id":"24b91b56-40a5-424e-bed1-bda0f73b01a5","url":"/media/news","name":"View All","displayName":"News","target":"_blank","querystring":""}';

const sampleFields = {
  Headline: { value: 'More News' },
  ViewAllLink: { value: viewAllJson },
  ArticleListings: {
    value: [
      {
        Title: 'Featured title',
        Summary: 'Featured <b>summary</b> plain',
        PostDate: 'April 06, 2026',
        HideDate: false,
        Image: 'https://example.com/hero.jpg',
        ArticleType: 'News',
        Url: '/news/featured',
      },
      {
        Title: 'Second story',
        PostDate: 'March 12, 2026',
        HideDate: true,
        Image: '',
        ArticleType: 'News',
        Url: '/news/second',
      },
    ],
  },
} satisfies FeaturedNewsProps['fields'];

describe('FeaturedNews Default', () => {
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
    expect(screen.getByText(FEATURED_NEWS_EMPTY_DATASOURCE)).toBeInTheDocument();
  });

  it('parses ViewAllLink and renders href and label', () => {
    render(
      <Default
        fields={sampleFields}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    const viewAll = screen.getByRole('link', { name: /View All/i });
    expect(viewAll).toHaveAttribute('href', '/media/news');
  });

  it('renders featured title and secondary list item', () => {
    render(
      <Default
        fields={sampleFields}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    expect(screen.getByTestId('featured-news-outer')).toBeInTheDocument();
    expect(screen.getByTestId('featured-news-outer').className).toContain(
      '[.two-column-left-column_&]:pt-0',
    );
    expect(screen.getByRole('heading', { name: 'Featured title' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Second story' })).toHaveAttribute('href', '/news/second');
  });

  it('applies legacy live aside headline when Theme is omitted', () => {
    render(
      <Default
        fields={sampleFields}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    const asideHeading = screen.getByRole('heading', { name: 'More News' });
    expect(asideHeading.className).toContain('text-font-medium');
    expect(asideHeading.className).toContain('leading-6');
    expect(asideHeading.className).toContain('uppercase');
    expect(asideHeading.className).toContain('text-ink-muted');
  });

  it('applies base theme aside headline when Theme is explicitly Base', () => {
    render(
      <Default
        fields={sampleFields}
        params={{ ...baseParams, Theme: { Value: { value: 'Base' } } }}
        page={basePage}
        rendering={baseRendering}
      />
    );
    const asideHeading = screen.getByRole('heading', { name: 'More News' });
    expect(asideHeading.className).toContain('text-font-big');
    expect(asideHeading.className).toContain('leading-[27.5px]');
    expect(asideHeading.className).toContain('text-ink-primary');
    expect(asideHeading.className).not.toContain('uppercase');
  });

  it('applies article theme to aside headline when Theme is Article', () => {
    render(
      <Default
        fields={sampleFields}
        params={{ ...baseParams, Theme: { Value: { value: 'Article' } } }}
        page={basePage}
        rendering={baseRendering}
      />
    );
    const asideHeading = screen.getByRole('heading', { name: 'More News' });
    expect(asideHeading.className).toContain('uppercase');
    expect(asideHeading.className).toContain('text-accent-cyan');
  });

  it('applies compact theme to aside headline when Theme is Compact', () => {
    render(
      <Default
        fields={sampleFields}
        params={{ ...baseParams, Theme: { Value: { value: 'Compact' } } }}
        page={basePage}
        rendering={baseRendering}
      />
    );
    const asideHeading = screen.getByRole('heading', { name: 'More News' });
    expect(asideHeading.className).toContain('text-font-large');
    expect(asideHeading.className).toContain('leading-[24.75px]');
  });

  it('uses white aside headline on dark ColorScheme when Theme is explicit (themed)', () => {
    render(
      <Default
        fields={sampleFields}
        params={{
          ...baseParams,
          ColorScheme: { Value: { value: 'Dark' } },
          Theme: { Value: { value: 'Article' } },
        }}
        page={basePage}
        rendering={baseRendering}
      />
    );
    const asideHeading = screen.getByRole('heading', { name: 'More News' });
    expect(asideHeading.className).toContain('text-ink-inverse');
    expect(asideHeading.className).not.toContain('text-accent-cyan');
  });

  it('uses white legacy-scale aside headline on dark ColorScheme when Theme is omitted', () => {
    render(
      <Default
        fields={sampleFields}
        params={{
          ...baseParams,
          ColorScheme: { Value: { value: 'Dark' } },
        }}
        page={basePage}
        rendering={baseRendering}
      />
    );
    const asideHeading = screen.getByRole('heading', { name: 'More News' });
    expect(asideHeading.className).toContain('text-ink-inverse');
    expect(asideHeading.className).toContain('text-font-medium');
    expect(asideHeading.className).toContain('uppercase');
  });

  it('hides secondary date when HideDate is true', () => {
    render(
      <Default
        fields={sampleFields}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    const secondary = screen.getByRole('link', { name: 'Second story' }).closest('li');
    expect(secondary).not.toHaveTextContent('March 12, 2026');
  });

  it('strips HTML from featured summary for display', () => {
    render(
      <Default
        fields={sampleFields}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    const article = screen.getByRole('article');
    expect(within(article).getByText(/Featured summary plain/)).toBeInTheDocument();
  });

  it('renders Read More when article Url is present', () => {
    render(
      <Default
        fields={sampleFields}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    expect(screen.getByRole('link', { name: 'Read More' })).toHaveAttribute('href', '/news/featured');
  });

  it('wraps hero thumbnail in link to primary article URL when not editing', () => {
    render(
      <Default
        fields={sampleFields}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    const article = screen.getByRole('article');
    const heroImage = within(article).getByTestId('next-image');
    const thumbAnchor = heroImage.closest('a');
    expect(thumbAnchor).not.toBeNull();
    expect(thumbAnchor).toHaveAttribute('href', '/news/featured');
    expect(heroImage).toHaveAttribute('src', 'https://example.com/hero.jpg');
  });

  it('does not wrap hero thumbnail in link when editing', () => {
    render(
      <Default
        fields={sampleFields}
        params={baseParams}
        page={editingPage}
        rendering={baseRendering}
      />
    );
    const article = screen.getByRole('article');
    const images = within(article).queryAllByTestId('next-image');
    expect(images.length).toBe(1);
    expect(images[0]?.closest('a')).toBeNull();
  });

  it('renders Read More when article URL is only provided as camelCase url', () => {
    const fieldsCamelUrl = {
      Headline: { value: 'More News' },
      ViewAllLink: { value: viewAllJson },
      ArticleListings: {
        value: [
          {
            Title: 'Camel URL title',
            Summary: 'Summary text',
            PostDate: 'April 1, 2026',
            HideDate: false,
            Image: '',
            ArticleType: 'News',
            url: '/news/camel-url',
          },
          {
            Title: 'Second',
            PostDate: 'March 1, 2026',
            HideDate: true,
            Image: '',
            ArticleType: 'News',
            Url: '/news/second',
          },
        ],
      },
    } satisfies FeaturedNewsProps['fields'];

    render(
      <Default
        fields={fieldsCamelUrl}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    expect(screen.getByRole('link', { name: 'Read More' })).toHaveAttribute('href', '/news/camel-url');
  });

  it('returns null when fields are present but no visitor content and not editing (line 79)', () => {
    const emptyListingsFields = {
      ArticleListings: [
        { Title: '', PostDate: '', HideDate: false, Image: '', ArticleType: '', Url: '' },
      ],
    } as unknown as FeaturedNewsProps['fields'];
    const { container } = render(
      <Default
        fields={emptyListingsFields}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders empty hero hint in editing when there are no article listings (lines 119-122)', () => {
    const noListingsFields = {
      Headline: { value: 'News' },
      ArticleListings: { value: [] },
    } as unknown as FeaturedNewsProps['fields'];
    render(
      <Default
        fields={noListingsFields}
        params={baseParams}
        page={editingPage}
        rendering={baseRendering}
      />
    );
    expect(screen.getByText(FEATURED_NEWS_EMPTY_LISTINGS_EDITING_HINT)).toBeInTheDocument();
  });

  it('renders with styles undefined without crashing (line 35 styles ?? "" branch)', () => {
    const { container } = render(
      <Default
        fields={sampleFields}
        params={{ ...baseParams, styles: undefined }}
        page={basePage}
        rendering={baseRendering}
      />
    );
    const section = container.querySelector('section.featured-news');
    expect(section).toBeTruthy();
    expect(section?.className).not.toContain('undefined');
  });

  it('skips secondary aside row when both date and title are empty (FeaturedNewsPartials line 226)', () => {
    const fieldsWithEmptySecondary = {
      Headline: { value: 'News' },
      ArticleListings: {
        value: [
          {
            Title: 'Featured',
            PostDate: 'April 1, 2026',
            HideDate: false,
            Image: 'https://example.com/img.jpg',
            ArticleType: 'News',
            Url: '/news/featured',
          },
          // Secondary row with no title and hidden date → should be skipped (line 226)
          { Title: '', PostDate: 'April 2, 2026', HideDate: true, Image: '', ArticleType: '', Url: '' },
        ],
      },
    } as unknown as FeaturedNewsProps['fields'];
    render(
      <Default
        fields={fieldsWithEmptySecondary}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    // The secondary row should not appear in the aside list (it was skipped)
    const listItems = document.querySelectorAll('[role="listitem"]');
    expect(listItems).toHaveLength(0);
  });

  it('renders secondary row as plain text (no link) when title exists but URL is empty (FeaturedNewsPartials lines 231-242)', () => {
    const fieldsWithTitleNoUrl = {
      Headline: { value: 'News' },
      ArticleListings: {
        value: [
          {
            Title: 'Featured',
            PostDate: 'April 1, 2026',
            HideDate: false,
            Image: 'https://example.com/img.jpg',
            ArticleType: 'News',
            Url: '/news/featured',
          },
          // Secondary row: has title but NO url → hasTitleLink=false → <div> branch
          { Title: 'Plain Title', PostDate: 'April 2, 2026', HideDate: false, Image: '', ArticleType: '', Url: '' },
        ],
      },
    } as unknown as FeaturedNewsProps['fields'];
    render(
      <Default
        fields={fieldsWithTitleNoUrl}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    // The secondary row should render as a plain div, not a link
    expect(screen.getByText('Plain Title')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Plain Title' })).not.toBeInTheDocument();
  });

  it('renders secondary row date-only (no title, has date) as plain div (lines 241-244)', () => {
    const fieldsDateNoTitle = {
      Headline: { value: 'News' },
      ArticleListings: {
        value: [
          {
            Title: 'Featured',
            PostDate: 'April 1, 2026',
            HideDate: false,
            Image: 'https://example.com/img.jpg',
            ArticleType: 'News',
            Url: '/news/featured',
          },
          // Secondary row: has date but no title → plain div with date
          { Title: '', PostDate: 'April 2, 2026', HideDate: false, Image: '', ArticleType: '', Url: '' },
        ],
      },
    } as unknown as FeaturedNewsProps['fields'];
    render(
      <Default
        fields={fieldsDateNoTitle}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />
    );
    expect(screen.getByText('April 2, 2026')).toBeInTheDocument();
  });

  it('renders Eyebrow and Description datasource chrome in editing mode (lines 100-110)', () => {
    const fieldsWithEyebrow = {
      ...sampleFields,
      Eyebrow: { value: 'Breaking News' },
      Description: { value: '<p>Some description</p>' },
    } as unknown as FeaturedNewsProps['fields'];
    render(
      <Default
        fields={fieldsWithEyebrow}
        params={baseParams}
        page={editingPage}
        rendering={baseRendering}
      />
    );
    expect(screen.getByText('Breaking News')).toBeInTheDocument();
  });
});
