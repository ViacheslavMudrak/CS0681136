import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const { mediaTileSitecoreSdkMock } = await import('src/test/mocks/viteSafeMocks');
  return mediaTileSitecoreSdkMock();
});

import { BreadcrumbsClient } from 'components/breadcrumbs/partial/BreadcrumbsClient';
import type { IBreadcrumbsFields } from 'components/breadcrumbs/Breadcrumbs.type';

const baseParams = { styles: '', RenderingIdentifier: 'breadcrumbs-1' } as never;

describe('BreadcrumbsClient', () => {
  it('sets anchor id from RenderingIdentifier lowercased on the breadcrumbs wrapper', () => {
    const fields: IBreadcrumbsFields = {
      data: {
        currentPage: {
          Title: { data: { value: 'Page' } },
          BreadcrumbData: [],
        },
      },
    };

    const { container } = render(
      <BreadcrumbsClient
        fields={fields}
        params={{ RenderingIdentifier: 'Bread_Crumbs' } as never}
      />,
    );

    expect(container.querySelector('[data-analytics-title="Breadcrumbs"]')).toHaveAttribute(
      'id',
      'bread_crumbs',
    );
  });

  it('renders searchable trail items and current page title', () => {
    const fields: IBreadcrumbsFields = {
      data: {
        currentPage: {
          Title: { data: { value: 'Current Page' } },
          BreadcrumbData: [
            {
              Title: { data: { value: 'Parent' } },
              Link: { url: '/parent' },
              IsPageSearchable: { value: true },
            },
            {
              Title: { data: { value: 'Hidden crumb' } },
              Link: { url: '/hidden' },
              IsPageSearchable: { value: false },
            },
          ],
        },
      },
    };

    render(<BreadcrumbsClient fields={fields} params={baseParams} />);

    expect(screen.getByRole('link', { name: 'Parent' })).toHaveAttribute('href', '/parent');
    expect(screen.getByText('Current Page')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Hidden crumb' })).not.toBeInTheDocument();
  });

  it('applies border and dark colorScheme classes when HasBorder is set and ColorScheme is dark (lines 32-45)', () => {
    const fields: IBreadcrumbsFields = {
      data: {
        currentPage: {
          Title: { data: { value: 'Page' } },
          BreadcrumbData: [
            { Title: { data: { value: 'Home' } }, Link: { url: '/' }, IsPageSearchable: { value: true } },
          ],
        },
      },
    };
    const { container } = render(
      <BreadcrumbsClient
        fields={fields}
        params={{
          ...baseParams,
          HasBorder: 'border-left',
          ColorScheme: { Value: { value: 'dark' } },
        } as never}
      />,
    );
    const wrapper = container.querySelector('[data-analytics-title="Breadcrumbs"]');
    expect(wrapper?.className).toMatch(/border-l-4/);
    expect(wrapper?.className).toMatch(/border-orange/);
  });

  it('applies contrast text-ink-inverse class on breadcrumb links when HasContrast is true (lines 60-68, 85)', () => {
    const fields: IBreadcrumbsFields = {
      data: {
        currentPage: {
          Title: { data: { value: 'Current' } },
          BreadcrumbData: [
            { Title: { data: { value: 'Home' } }, Link: { url: '/' }, IsPageSearchable: { value: true } },
          ],
        },
      },
    };
    render(
      <BreadcrumbsClient
        fields={fields}
        params={{ ...baseParams, HasContrast: true } as never}
      />,
    );
    const link = screen.getByRole('link', { name: 'Home' });
    expect(link.className).toContain('text-ink-inverse');
  });
});
