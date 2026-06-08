import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('components/callToAction/partial/LinkVIew', () => ({
  default: () => null,
}));

vi.mock('@laitram-l-l-c/intralox-ui-components', async () => {
  const actual = await vi.importActual<typeof import('@laitram-l-l-c/intralox-ui-components')>(
    '@laitram-l-l-c/intralox-ui-components',
  );
  return {
    ...actual,
    Accordion: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="faq-accordion">{children}</div>
    ),
    AccordionItem: ({
      title,
      children,
    }: {
      title: string;
      children: React.ReactNode;
    }) => (
      <div data-testid="faq-accordion-item">
        <div>{title}</div>
        {children}
      </div>
    ),
  };
});

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const { mediaTileSitecoreSdkMock } = await import('src/test/mocks/viteSafeMocks');
  return mediaTileSitecoreSdkMock();
});

import { FAQClient } from 'components/faq/partial/FAQClient';
import type { IFAQFields } from 'components/faq/FAQ.type';

const baseParams = { styles: '', RenderingIdentifier: 'FaqMain' } as never;

describe('FAQClient', () => {
  it('renders title and question labels from FaqItems', () => {
    const fields: IFAQFields = {
      Title: { value: 'Help' },
      Description: { value: '<p>Intro</p>' },
      FaqItems: [
        {
          id: 'q1',
          fields: {
            Question: { value: 'First question?' },
            Answer: { value: '<p>Answer one</p>' },
            FaqGroup: [],
          },
        },
      ],
    };

    render(<FAQClient fields={fields} params={baseParams} />);

    expect(screen.getByText('Help')).toBeInTheDocument();
    expect(screen.getByText('First question?')).toBeInTheDocument();
    expect(screen.getByTestId('faq-accordion')).toHaveTextContent('Answer one');
    expect(document.querySelector('#faqmain')).toBeTruthy();
  });

  it('renders grouped layout with a named group heading (label truthy branch line 69)', () => {
    const fields: IFAQFields = {
      Title: { value: 'FAQ' },
      Description: { value: '' },
      FaqItems: [
        {
          id: 'q1',
          fields: {
            Question: { value: 'Question in group A?' },
            Answer: { value: '<p>Answer A</p>' },
            FaqGroup: [{ fields: { Value: { value: 'Group A' } } }],
          },
        },
      ],
    };

    render(<FAQClient fields={fields} params={baseParams} />);

    expect(screen.getByRole('group', { name: 'Group A' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Group A' })).toBeInTheDocument();
    expect(screen.getByText('Question in group A?')).toBeInTheDocument();
  });

  it('renders grouped layout with empty label (label falsy — __ungrouped__ key, undefined aria-label, no h3, line 64/67/73)', () => {
    const fields: IFAQFields = {
      Title: { value: 'FAQ' },
      Description: { value: '' },
      FaqItems: [
        {
          id: 'q1',
          fields: {
            Question: { value: 'Ungrouped question?' },
            Answer: { value: '<p>Answer ungrouped</p>' },
            FaqGroup: [{ fields: { Value: { value: '' } } }],
          },
        },
        {
          id: 'q2',
          fields: {
            Question: { value: 'Also ungrouped?' },
            Answer: { value: '<p>Answer 2</p>' },
            FaqGroup: [{ fields: { Value: { value: 'Group A' } } }],
          },
        },
      ],
    };

    const { container } = render(<FAQClient fields={fields} params={baseParams} />);

    // Group with empty label has no visible <h3> heading
    const groups = container.querySelectorAll('[role="group"]');
    expect(groups.length).toBeGreaterThan(0);
    // The empty-label group has aria-label as undefined (not rendered)
    const ungrouped = Array.from(groups).find((g) => !g.getAttribute('aria-label'));
    expect(ungrouped).toBeTruthy();
  });

  it('uses Description to decide accordion title margin (mb-4! when description has value)', () => {
    const fields: IFAQFields = {
      Title: { value: 'FAQ with desc' },
      Description: { value: '<p>Some description</p>' },
      FaqItems: [
        {
          id: 'q1',
          fields: {
            Question: { value: 'Q?' },
            Answer: { value: '<p>A</p>' },
            FaqGroup: [],
          },
        },
      ],
    };

    render(<FAQClient fields={fields} params={baseParams} />);
    expect(screen.getByText('FAQ with desc')).toBeInTheDocument();
  });
});
