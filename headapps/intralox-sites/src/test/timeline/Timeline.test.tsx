import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ComponentRendering, Page } from '@sitecore-content-sdk/nextjs';

import { Default } from 'components/timeline/Timeline';
import type { TimelineProps } from 'components/timeline/Timeline.type';

vi.mock('components/timeline/partial/TimelineClient', () => ({
  TimelineYearNavigatorClient: () => null,
  TimelineVideoClient: () => null,
}));

vi.mock('components/timeline/partial/TimelineImageModal.client', () => ({
  TimelineImageModalProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TimelineImageModalTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field, tag: Tag = 'span' }: { field?: { value?: string }; tag?: string }) =>
    field?.value ? <Tag>{field.value}</Tag> : null,
  RichText: ({ field }: { field?: { value?: string } }) =>
    field?.value ? <div data-testid="sdk-richtext">{field.value}</div> : null,
  NextImage: () => <img alt="" data-testid="sdk-next-image" src="/mock.jpg" />,
}));

const basePage = { mode: { isEditing: false } } as unknown as Page;
const baseRendering = { componentName: 'Timeline' } as unknown as ComponentRendering;

const baseParams = {
  styles: 'theme-shell',
  RenderingIdentifier: 'timeline-1',
} as unknown as TimelineProps['params'];

describe('Timeline Default', () => {
  it('renders empty hint when fields are missing', () => {
    const { container } = render(
      <Default fields={undefined} params={baseParams} page={basePage} rendering={baseRendering} />,
    );
    expect(screen.getByText('Timeline')).toBeInTheDocument();
    const root = container.querySelector('section.component.timeline');
    expect(root).toBeTruthy();
    expect(root).toHaveClass('theme-shell');
    expect(container.querySelector('.timeline-outer')).toBeTruthy();
    expect(container.querySelector('.component-content')).toHaveClass('p-0!');
  });

  it('renders headline inside banded outer shell when configured', () => {
    const { container } = render(
      <Default
        fields={{
          Headline: { value: 'Our History' },
          TimelineGroup: [
            {
              id: 'g1',
              fields: {
                TimelineEvents: [{ id: 'e1', fields: { Year: { value: '1990' } } }],
              },
            },
          ],
        }}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Our History' })).toBeInTheDocument();
    const outer = container.querySelector('.timeline-outer');
    expect(outer).toHaveClass('min-[1200px]:max-w-[1200px]');
    const bandsShell = container.querySelector('[class*="pt-20"][class*="md:max-w-[1400px]"]');
    expect(bandsShell).toBeTruthy();
    const bandsInner = container.querySelector('[class*="md:px-4"]');
    expect(bandsInner).toBeTruthy();
  });
});
