import type { ElementType } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import type { ComponentRendering, Page } from '@sitecore-content-sdk/nextjs';

import { Default } from 'components/related-case-studies/RelatedCaseStudies';
import type { RelatedCaseStudiesProps } from 'components/related-case-studies/RelatedCaseStudies.type';
import {
  RELATED_CASE_STUDIES_EMPTY_DATASOURCE,
  parseRelatedCaseStudiesColumnCount,
  resolveRelatedCaseStudiesBaseImageSizes,
} from 'components/related-case-studies/relatedCaseStudiesUtils';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => (key === 'CASESTUDY' ? 'Case Study' : key),
}));

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const React = await import('react');
  return {
    Text: ({
      field,
      tag = 'span',
      ...rest
    }: {
      field?: { value?: string };
      tag?: string;
      className?: string;
    }) => React.createElement((tag ?? 'span') as ElementType, { ...rest }, field?.value ?? ''),
    RichText: ({ field, className }: { field?: { value?: string }; className?: string }) =>
      React.createElement('div', { 'data-testid': 'richtext', className }, field?.value ?? ''),
    Link: ({
      field,
      className,
      rel,
      'aria-label': ariaLabel,
    }: {
      field?: { value?: { href?: string; text?: string; target?: string } };
      className?: string;
      rel?: string;
      'aria-label'?: string;
    }) => (
      <a
        href={field?.value?.href}
        className={className}
        aria-label={ariaLabel}
        rel={rel}
        target={field?.value?.target}
      >
        {field?.value?.text}
      </a>
    ),
  };
});

const basePage = { mode: { isEditing: false } } as unknown as Page;
const editingPage = { mode: { isEditing: true } } as unknown as Page;
const baseRendering = { componentName: 'RelatedCaseStudies' } as unknown as ComponentRendering;

const baseParams = {
  styles: '',
  RenderingIdentifier: 'rcs-1',
} satisfies RelatedCaseStudiesProps['params'];

const sampleFields = {
  Headline: { value: 'Case Studies' },
  CaseStudyListings: {
    value: [
      { Headline: 'First study', Summary: 'First <b>summary</b>', PostDate: 'April 1, 2026', HideDate: false, Url: '/case/first' },
      { Headline: 'Second', Summary: 'S2', PostDate: 'April 2, 2026', HideDate: false, url: '/case/second' },
      { Headline: 'Third', Summary: 'S3', Url: '/case/third' },
      { Headline: 'Fourth', Summary: 'Hidden by cap', Url: '/case/fourth' },
    ],
  },
  ItemCount: { Value: '3' },
} satisfies RelatedCaseStudiesProps['fields'];

describe('RelatedCaseStudies Default', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when fields missing and not editing', () => {
    const { container } = render(
      <Default fields={undefined} params={baseParams} page={basePage} rendering={baseRendering} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows empty datasource hint when editing without fields', () => {
    render(<Default fields={undefined} params={baseParams} page={editingPage} rendering={baseRendering} />);
    expect(screen.getByText(RELATED_CASE_STUDIES_EMPTY_DATASOURCE)).toBeInTheDocument();
  });

  it('compact rail outer wrapper is present and summary / post date are not rendered', () => {
    render(<Default fields={sampleFields} params={baseParams} page={basePage} rendering={baseRendering} />);

    expect(screen.getByTestId('related-case-studies-outer')).toBeInTheDocument();
    const root = screen.getByTestId('related-case-studies');
    expect(within(root).queryByText(/First summary/i)).not.toBeInTheDocument();
    expect(screen.queryByText('April 1, 2026')).not.toBeInTheDocument();
  });

  it('renders compact rail headlines as 14px body copy on p (not scaled h3)', () => {
    const fields = {
      Headline: { value: 'Case Studies' },
      CaseStudyListings: {
        value: [
          {
            Company: {
              Name: 'GPOD of Idaho | Verbruggen',
              Link: { value: { href: '/companies/gpod', text: 'GPOD of Idaho | Verbruggen' } },
            },
            Headline: 'GPOD of Idaho Saves $320k Annually with Intralox ARB Solutions',
            Url: '/case-studies/gpod',
          },
        ],
      },
    } satisfies RelatedCaseStudiesProps['fields'];
    render(<Default fields={fields} params={baseParams} page={basePage} rendering={baseRendering} />);
    const headline = screen.getByText(/GPOD of Idaho Saves \$320k/);
    expect(headline.tagName).toBe('P');
    expect(headline.className).toContain('text-font-media-tile-eyebrow');
    expect(headline.className).toContain('leading-[19.25px]');
  });

  it('applies ColorScheme Article to the compact rail section headline', () => {
    render(
      <Default
        fields={sampleFields}
        params={{
          ...baseParams,
          ColorScheme: { Value: { value: 'Article' } },
        }}
        page={basePage}
        rendering={baseRendering}
      />,
    );
    const heading = screen.getByRole('heading', { level: 2, name: 'Case Studies' });
    expect(heading.className).toContain('text-accent-cyan');
  });

  it('uses row url when Company.Link is empty object and path is on listing row', () => {
    const fields = {
      Headline: { value: 'Case studies' },
      CaseStudyListings: {
        value: [
          {
            Company: {
              Name: 'Kurose Suisan',
              Logo: '',
              Link: {},
            },
            Headline: 'Merge-to-sort system optimizes space and labor',
            HideDate: true,
            url: '/media/case-studies/kurose-suisan',
          },
        ],
      },
      ItemCount: { Value: '3' },
    } satisfies RelatedCaseStudiesProps['fields'];

    render(<Default fields={fields} params={baseParams} page={basePage} rendering={baseRendering} />);
    expect(screen.getByRole('link', { name: 'Kurose Suisan' })).toHaveAttribute(
      'href',
      '/media/case-studies/kurose-suisan',
    );
  });

  it('uses Company.url for company name navigation when Link is absent', () => {
    const fields = {
      Headline: { value: 'Related' },
      CaseStudyListings: {
        value: [
          {
            Company: {
              Name: 'Kurose Suisan',
              url: '/media/case-studies/kurose-suisan',
            },
            Headline: 'Study title',
            Url: '/case/one',
          },
        ],
      },
      ItemCount: { Value: '3' },
    } satisfies RelatedCaseStudiesProps['fields'];

    render(<Default fields={fields} params={baseParams} page={basePage} rendering={baseRendering} />);
    expect(screen.getByRole('link', { name: 'Kurose Suisan' })).toHaveAttribute(
      'href',
      '/media/case-studies/kurose-suisan',
    );
  });

  it('parses Company.Link when it is a JSON string containing url', () => {
    const fields = {
      Headline: { value: 'Related' },
      CaseStudyListings: {
        value: [
          {
            Company: {
              Name: 'From JSON',
              Link: '{"url":"/media/case-studies/json-co","target":"_blank"}',
            },
            Headline: 'H',
            Url: '/case/x',
          },
        ],
      },
      ItemCount: { Value: '3' },
    } satisfies RelatedCaseStudiesProps['fields'];

    render(<Default fields={fields} params={baseParams} page={basePage} rendering={baseRendering} />);
    const companyLink = screen.getByRole('link', { name: 'From JSON' });
    expect(companyLink).toHaveAttribute('href', '/media/case-studies/json-co');
    expect(companyLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders company name link from Company and plain headline (headline is not a second link)', () => {
    const fields = {
      Headline: { value: 'Related' },
      CaseStudyListings: {
        value: [
          {
            Company: {
              Name: 'Acme Corp',
              Link: { url: 'https://example.com/acme', target: '_blank' },
            },
            Headline: 'Study title',
            Url: '/case/one',
          },
        ],
      },
      ItemCount: { Value: '3' },
    } satisfies RelatedCaseStudiesProps['fields'];

    render(<Default fields={fields} params={baseParams} page={basePage} rendering={baseRendering} />);
    const root = screen.getByTestId('related-case-studies');
    const links = within(root).getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Acme Corp' })).toHaveAttribute('href', 'https://example.com/acme');
    expect(within(root).queryByRole('link', { name: 'Study title' })).not.toBeInTheDocument();
    expect(within(root).getByText('Study title')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Acme Corp' })).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders plain title when URL missing', () => {
    const fields = {
      Headline: { value: 'Studies' },
      CaseStudyListings: {
        value: [{ Headline: 'No link row' }],
      },
      ItemCount: { Value: '3' },
    } satisfies RelatedCaseStudiesProps['fields'];

    render(<Default fields={fields} params={baseParams} page={basePage} rendering={baseRendering} />);
    const root = screen.getByTestId('related-case-studies');
    expect(within(root).queryByRole('link', { name: 'No link row' })).not.toBeInTheDocument();
    expect(within(root).getByText('No link row')).toBeInTheDocument();
  });

  it('renders base card grid when CardSize is Base and not editing', () => {
    const params = {
      ...baseParams,
      CardSize: { Value: { value: 'Base' } },
    } as RelatedCaseStudiesProps['params'];

    // Base variant shows ALL available listings; ItemCount controls columns, not item cap.
    render(<Default fields={sampleFields} params={params} page={basePage} rendering={baseRendering} />);
    const root = screen.getByTestId('related-case-studies');
    expect(root).toHaveAttribute('data-card-size', 'base');
    expect(root.className).toContain('w-screen');
    expect(root.className).toContain('ml-[calc(50%-50vw)]');
    expect(root.querySelector('.two-column-container-outer')).toBeTruthy();
    expect(within(root).getAllByRole('article')).toHaveLength(4);
    expect(screen.getByRole('heading', { level: 2, name: 'Case Studies' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'First study' })).toHaveAttribute('href', '/case/first');
    expect(screen.getAllByText('Case Study').length).toBeGreaterThanOrEqual(4);
    // Fourth listing (previously hidden by item cap) is now visible
    expect(screen.getAllByText('Fourth').length).toBeGreaterThanOrEqual(1);
    const baseGridItems = root.querySelectorAll('ul[role="list"] > li');
    expect(baseGridItems.length).toBeGreaterThan(0);
    baseGridItems.forEach((item) => {
      expect(item.className).toContain('!ml-0');
      expect(item.className).toContain('list-none');
    });
  });

  it('applies indent-top and indent paddings on the base outer container from Styles flags', () => {
    const params = {
      ...baseParams,
      CardSize: { Value: { value: 'Base' } },
      Styles: 'indent-top indent',
    } as RelatedCaseStudiesProps['params'];

    render(<Default fields={sampleFields} params={params} page={basePage} rendering={baseRendering} />);
    const root = screen.getByTestId('related-case-studies');
    const baseOuter = root.querySelector('.two-column-container-outer');
    expect(baseOuter).toBeTruthy();
    expect(baseOuter?.className).toContain('!pt-[48px]');
    expect(baseOuter?.className).toContain('!px-[32px]');
    expect(baseOuter?.className).toContain('md:!px-[80px]');
  });

  it('compact rail still caps visible rows at ItemCount (base variant no longer caps)', () => {
    render(<Default fields={sampleFields} params={baseParams} page={basePage} rendering={baseRendering} />);
    const root = screen.getByTestId('related-case-studies');
    const links = within(root).getAllByRole('link');
    expect(links).toHaveLength(3);
    expect(screen.queryByText(/Fourth/)).not.toBeInTheDocument();
  });

  describe('base grid layout classes', () => {
    it('applies 3-column lg grid when ItemCount is 3', () => {
      const params = {
        ...baseParams,
        CardSize: { Value: { value: 'Base' } },
      } as RelatedCaseStudiesProps['params'];
      const fields = {
        Headline: { value: 'Studies' },
        CaseStudyListings: {
          value: [{ Headline: 'One', Url: '/case/one' }],
        },
        ItemCount: { Value: '3' },
      } satisfies RelatedCaseStudiesProps['fields'];

      render(<Default fields={fields} params={params} page={basePage} rendering={baseRendering} />);
      const grid = screen.getByTestId('related-case-studies').querySelector('ul[role="list"]');
      expect(grid?.className).toContain('lg:grid-cols-3');
      expect(grid?.className).toContain('gap-[16px]');
      expect(grid?.className).toContain('md:gap-[24px]');
    });

    it('omits lg column override when ItemCount is 2', () => {
      const params = {
        ...baseParams,
        CardSize: { Value: { value: 'Base' } },
      } as RelatedCaseStudiesProps['params'];
      const fields = {
        Headline: { value: 'Studies' },
        CaseStudyListings: {
          value: [{ Headline: 'One', Url: '/case/one' }],
        },
        ItemCount: { Value: '2' },
      } satisfies RelatedCaseStudiesProps['fields'];

      render(<Default fields={fields} params={params} page={basePage} rendering={baseRendering} />);
      const grid = screen.getByTestId('related-case-studies').querySelector('ul[role="list"]');
      expect(grid?.className).not.toMatch(/\blg:grid-cols-/);
      expect(grid?.className).toContain('min-[600px]:grid-cols-2');
    });
  });

  it('uses default light surface for Article ColorScheme on compact rail', () => {
    render(
      <Default
        fields={sampleFields}
        params={{
          ...baseParams,
          ColorScheme: { Value: { value: 'Article' } },
        }}
        page={basePage}
        rendering={baseRendering}
      />,
    );
    const root = screen.getByTestId('related-case-studies');
    expect(root.className).toContain('bg-surface');
    expect(root.className).toContain('text-ink-primary');
  });

  it('delegates dark ColorScheme to inverse surface band', () => {
    render(
      <Default
        fields={sampleFields}
        params={{
          ...baseParams,
          ColorScheme: { Value: { value: 'dark' } },
        }}
        page={basePage}
        rendering={baseRendering}
      />,
    );
    expect(screen.getByTestId('related-case-studies').className).toContain('bg-surface-inverse');
  });

  it('delegates gray ColorScheme to muted surface band', () => {
    render(
      <Default
        fields={sampleFields}
        params={{
          ...baseParams,
          ColorScheme: { Value: { value: 'grey' } },
        }}
        page={basePage}
        rendering={baseRendering}
      />,
    );
    const root = screen.getByTestId('related-case-studies');
    expect(root.className).toContain('bg-surface-muted');
    expect(root.className).toContain('text-ink-primary');
  });

  it('uses legacy tertiary rail headline when ColorScheme absent', () => {
    render(<Default fields={sampleFields} params={baseParams} page={basePage} rendering={baseRendering} />);
    const heading = screen.getByRole('heading', { level: 2, name: 'Case Studies' });
    expect(heading.className).toContain('text-ink-tertiary');
    expect(heading.className).toContain('uppercase');
  });

  it('adds bold description links for Landing page ColorScheme', () => {
    render(
      <Default
        fields={{
          ...sampleFields,
          Description: { value: '<p>Intro</p>' },
        }}
        params={{
          ...baseParams,
          ColorScheme: { Value: { value: 'Landing page' } },
        }}
        page={basePage}
        rendering={baseRendering}
      />,
    );
    const rte = screen.getByTestId('richtext');
    expect(rte.className).toContain('[&_a]:!font-bold');
  });

  it('applies article uppercase headline on base grid when ColorScheme is Article', () => {
    const params = {
      ...baseParams,
      CardSize: { Value: { value: 'Base' } },
      ColorScheme: { Value: { value: 'Article' } },
    } as RelatedCaseStudiesProps['params'];
    const fields = {
      Headline: { value: 'Studies' },
      CaseStudyListings: {
        value: [{ Headline: 'One', Url: '/case/one' }],
      },
      ItemCount: { Value: '3' },
    } satisfies RelatedCaseStudiesProps['fields'];

    render(<Default fields={fields} params={params} page={basePage} rendering={baseRendering} />);
    const heading = screen.getByRole('heading', { level: 2, name: 'Studies' });
    expect(heading.className).toContain('text-accent-cyan');
    expect(heading.className).toContain('uppercase');
  });

  describe('resolveRelatedCaseStudiesBaseImageSizes', () => {
    it('returns correct sizes for 2 columns', () => {
      expect(resolveRelatedCaseStudiesBaseImageSizes(2)).toBe('(max-width: 599px) 100vw, 50vw');
    });

    it('returns correct sizes for 3 columns', () => {
      expect(resolveRelatedCaseStudiesBaseImageSizes(3)).toBe(
        '(max-width: 599px) 100vw, (max-width: 1023px) 50vw, 33vw',
      );
    });

    it('returns correct sizes for 4 columns', () => {
      expect(resolveRelatedCaseStudiesBaseImageSizes(4)).toBe(
        '(max-width: 599px) 100vw, (max-width: 1023px) 50vw, 25vw',
      );
    });

    it('returns correct sizes for 5 columns', () => {
      expect(resolveRelatedCaseStudiesBaseImageSizes(5)).toBe(
        '(max-width: 599px) 100vw, (max-width: 1023px) 50vw, 20vw',
      );
    });
  });

  describe('parseRelatedCaseStudiesColumnCount', () => {
    it('returns 3 for undefined input', () => {
      expect(parseRelatedCaseStudiesColumnCount(undefined)).toBe(3);
    });

    it('returns 3 for non-numeric input', () => {
      expect(parseRelatedCaseStudiesColumnCount('abc')).toBe(3);
    });

    it('returns 3 for out-of-range value 1', () => {
      expect(parseRelatedCaseStudiesColumnCount('1')).toBe(3);
    });

    it('returns 3 for out-of-range value 6', () => {
      expect(parseRelatedCaseStudiesColumnCount('6')).toBe(3);
    });

    it.each([2, 3, 4, 5])('returns %i for valid input "%i"', (n) => {
      expect(parseRelatedCaseStudiesColumnCount(String(n))).toBe(n);
    });
  });

  it('base cards show company name in footer when ShowCompany is true', () => {
    const params = {
      ...baseParams,
      CardSize: { Value: { value: 'Base' } },
    } as RelatedCaseStudiesProps['params'];

    const fields = {
      Headline: { value: 'Studies' },
      ShowCompany: { value: true },
      CaseStudyListings: {
        value: [
          {
            Company: { Name: 'Acme Corp' },
            Headline: 'Tile one',
            Summary: 'S1',
            Url: '/case/one',
          },
          {
            Company: { Name: 'Beta LLC' },
            Headline: 'Tile two',
            Summary: 'S2',
            Url: '/case/two',
          },
        ],
      },
      ItemCount: { Value: '3' },
    } satisfies RelatedCaseStudiesProps['fields'];

    render(<Default fields={fields} params={params} page={basePage} rendering={baseRendering} />);
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Beta LLC')).toBeInTheDocument();
    expect(screen.queryByText('Case Study')).not.toBeInTheDocument();
  });

  it('renders base layout when CardSize is Base and editing', () => {
    const params = {
      ...baseParams,
      CardSize: { Value: { value: 'Base' } },
    } as RelatedCaseStudiesProps['params'];

    render(<Default fields={sampleFields} params={params} page={editingPage} rendering={baseRendering} />);
    expect(screen.getByTestId('related-case-studies')).toHaveAttribute('data-card-size', 'base');
    expect(screen.getByRole('heading', { level: 2, name: 'Case Studies' })).toBeInTheDocument();
  });

  it('marks compact layout with data-card-size when CardSize is compact', () => {
    const params = {
      ...baseParams,
      CardSize: { Value: { value: 'compact' } },
    } as RelatedCaseStudiesProps['params'];

    render(<Default fields={sampleFields} params={params} page={basePage} rendering={baseRendering} />);
    expect(screen.getByTestId('related-case-studies')).toHaveAttribute('data-card-size', 'compact');
  });

  it('returns null for base card layout when no visitor content and not editing (line 149)', () => {
    const params = {
      ...baseParams,
      CardSize: { Value: { value: 'Base' } },
    } as RelatedCaseStudiesProps['params'];

    const emptyFields = {
      Headline: { value: 'Studies' },
      CaseStudyListings: {
        value: [{ Headline: '', Summary: '', Url: '' }],
      },
      ItemCount: { Value: '3' },
    } satisfies RelatedCaseStudiesProps['fields'];

    const { container } = render(
      <Default fields={emptyFields} params={params} page={basePage} rendering={baseRendering} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('returns null for compact layout when no visitor content and not editing (line 328)', () => {
    const params = {
      ...baseParams,
      CardSize: { Value: { value: 'compact' } },
    } as RelatedCaseStudiesProps['params'];

    const emptyFields = {
      Headline: { value: 'Studies' },
      CaseStudyListings: {
        value: [{ Headline: '', Summary: '', Url: '' }],
      },
      ItemCount: { Value: '3' },
    } satisfies RelatedCaseStudiesProps['fields'];

    const { container } = render(
      <Default fields={emptyFields} params={params} page={basePage} rendering={baseRendering} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('skips base card rows with no showable content when not editing (line 209)', () => {
    const params = {
      ...baseParams,
      CardSize: { Value: { value: 'Base' } },
    } as RelatedCaseStudiesProps['params'];

    const fields = {
      Headline: { value: 'Studies' },
      CaseStudyListings: {
        value: [
          // First row: valid
          { Headline: 'Valid study', Url: '/case/valid' },
          // Second row: no visible content (skipped via line 209 return null)
          { Headline: '', Summary: '', Url: '' },
        ],
      },
      ItemCount: { Value: '3' },
    } satisfies RelatedCaseStudiesProps['fields'];

    render(<Default fields={fields} params={params} page={basePage} rendering={baseRendering} />);
    expect(screen.getAllByText('Valid study').length).toBeGreaterThan(0);
    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(1);
  });

  it('skips compact card rows with no showable content when not editing (line 390)', () => {
    const params = {
      ...baseParams,
      CardSize: { Value: { value: 'compact' } },
    } as RelatedCaseStudiesProps['params'];

    const fields = {
      Headline: { value: 'Studies' },
      CaseStudyListings: {
        value: [
          { Headline: 'Valid', Url: '/case/valid' },
          // Empty row - should be skipped
          { Headline: '', Summary: '', Url: '' },
        ],
      },
      ItemCount: { Value: '3' },
    } satisfies RelatedCaseStudiesProps['fields'];

    render(<Default fields={fields} params={params} page={basePage} rendering={baseRendering} />);
    expect(screen.getByText('Valid')).toBeInTheDocument();
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(1);
  });

  it('renders RTE from params.Description when datasource Description is empty', () => {
    const fields = {
      Headline: { value: 'Related' },
      Description: { value: '' },
      CaseStudyListings: {
        value: [{ Headline: 'Study', Url: '/case/one' }],
      },
      ItemCount: { Value: '3' },
    } satisfies RelatedCaseStudiesProps['fields'];

    const params = {
      ...baseParams,
      Description: { value: '<p>Placeholder RTE body</p>' },
    } as RelatedCaseStudiesProps['params'];

    render(<Default fields={fields} params={params} page={basePage} rendering={baseRendering} />);
    expect(screen.getByTestId('richtext').textContent).toContain('<p>Placeholder RTE body</p>');
  });
});
