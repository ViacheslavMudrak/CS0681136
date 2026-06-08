import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import type { ComponentRendering, Page } from '@sitecore-content-sdk/nextjs';

import { Default } from 'components/event-list/EventList';
import type { EventListProps } from 'components/event-list/EventList.type';
import { EVENT_LIST_EMPTY_DATASOURCE } from 'components/event-list/eventListUtils';

vi.mock('.sitecore/component-map', () => ({
  default: new Map(),
}));

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const React = await import('react');
  return {
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
        data-target={field?.value?.target}
        className={className}
        rel={rel}
        aria-label={ariaLabel}
      >
        {field?.value?.text}
      </a>
    ),
  };
});

const basePage = { mode: { isEditing: false } } as unknown as Page;
const editingPage = { mode: { isEditing: true } } as unknown as Page;
const baseRendering = { componentName: 'EventList' } as unknown as ComponentRendering;

const baseParams = {
  styles: '',
  RenderingIdentifier: 'el-1',
  ColorScheme: { Value: { value: 'Light' } },
  EventListCardSize: { Value: { value: 'base' } },
} satisfies EventListProps['params'] & Record<string, unknown>;

const sampleFields: EventListProps['fields'] = {
  EventListings: {
    value: [
      {
        Year: '2026',
        EventItems: [
          {
            EventName: 'The Logistics World Summit & Expo 2026',
            Location: 'Mexico City, Mexico',
            Region: 'Latin America',
            StartDate: 'April 27, 2026',
            EndDate: 'April 29, 2026',
            EventUrl: {
              id: '',
              url: 'https://expo.thelogisticsworld.com/',
              name: '',
              displayName: '',
              target: '',
            },
            EventStartDate: '2026-04-27T00:00:00Z',
            EventEndDate: '2026-04-29T00:00:00Z',
            EventYear: '2026',
          },
        ],
      },
    ],
  },
};

describe('EventList Default', () => {
  it('renders year, title link, dates, and location', () => {
    render(
      <Default
        fields={sampleFields}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />,
    );

    const root = screen.getByTestId('event-list');
    expect(root).toHaveAttribute('data-event-list-card-size', 'base');
    expect(within(root).getByRole('heading', { level: 2, name: '2026' })).toBeInTheDocument();

    const link = within(root).getByRole('link', {
      name: 'The Logistics World Summit & Expo 2026',
    });
    expect(link).toHaveAttribute('href', 'https://expo.thelogisticsworld.com/');
    expect(within(root).getByText('Apr 27 - 29')).toBeInTheDocument();
    expect(within(root).getByText('April 27 - 29, 2026')).toBeInTheDocument();
    expect(within(root).getByText('Latin America, Mexico City, Mexico')).toBeInTheDocument();
  });

  it.each([
    ['dark', 'bg-surface-inverse text-ink-inverse'],
    ['Dark', 'bg-surface-inverse text-ink-inverse'],
    ['gray', 'bg-surface-muted text-ink-primary'],
    ['grey', 'bg-surface-muted text-ink-primary'],
    ['light', 'bg-surface text-ink-primary'],
  ] as const)('applies %s color scheme surface classes on the root section', (scheme, expectedClasses) => {
    render(
      <Default
        fields={sampleFields}
        params={{
          ...baseParams,
          ColorScheme: { Value: { value: scheme } },
        }}
        page={basePage}
        rendering={baseRendering}
      />,
    );

    const root = screen.getByTestId('event-list');
    expectedClasses.split(' ').forEach((cls) => {
      expect(root.className).toContain(cls);
    });
  });

  it('renders editing placeholder when fields are missing', () => {
    render(
      <Default
        fields={undefined}
        params={baseParams}
        page={editingPage}
        rendering={baseRendering}
      />,
    );
    expect(screen.getByText(EVENT_LIST_EMPTY_DATASOURCE)).toBeInTheDocument();
  });

  it('returns null when no fields and not editing', () => {
    const { container } = render(
      <Default
        fields={undefined}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('returns null for main component when EventListings has groups with no visitor content and not editing (line 193)', () => {
    const fieldsNoContent: EventListProps['fields'] = {
      EventListings: {
        value: [
          {
            Year: '2026',
            EventItems: [
              // Empty item - no EventName, no location, no dates, no link
              {},
            ],
          },
        ],
      },
    };
    const { container } = render(
      <Default
        fields={fieldsNoContent}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('year group returns null when all items have no visitor content and not editing (line 83)', () => {
    // The year group renders null but the section renders the editing placeholder for
    // the overall component — we exercise line 83 by having a group with empty items and not editing.
    // When the main component sees no visitor content it also returns null (line 193).
    const fieldsEmptyGroup: EventListProps['fields'] = {
      EventListings: {
        value: [
          { Year: '2025', EventItems: [{}] },
          {
            Year: '2026',
            EventItems: [
              {
                EventName: 'Real Event',
                StartDate: 'April 1, 2026',
                EventStartDate: '2026-04-01T00:00:00Z',
              },
            ],
          },
        ],
      },
    };
    render(
      <Default
        fields={fieldsEmptyGroup}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />,
    );
    // Only the year with valid content renders
    expect(screen.getByRole('heading', { level: 2, name: '2026' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: '2025' })).not.toBeInTheDocument();
  });
});
