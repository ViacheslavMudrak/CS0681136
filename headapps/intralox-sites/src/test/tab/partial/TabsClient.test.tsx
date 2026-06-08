import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const { mediaTileSitecoreSdkMock } = await import('src/test/mocks/viteSafeMocks');
  return mediaTileSitecoreSdkMock();
});

vi.mock('@laitram-l-l-c/intralox-ui-components', async () => {
  const actual = await vi.importActual<typeof import('@laitram-l-l-c/intralox-ui-components')>(
    '@laitram-l-l-c/intralox-ui-components',
  );
  return {
    ...actual,
    Tabs: React.forwardRef(function TabsStub(
      {
        children,
        selectedKey,
      }: {
        children: React.ReactNode;
        selectedKey?: string;
      },
      ref: React.Ref<HTMLDivElement | null>,
    ) {
      return (
        <div data-testid="tabs-shell" data-selected-key={selectedKey} ref={ref}>
          {children}
        </div>
      );
    }),
    TabList: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div className={className} role="tablist">
        {children}
      </div>
    ),
    Tab: ({
      children,
      id,
      className,
    }: {
      children: React.ReactNode;
      id?: string;
      className?: string;
    }) => (
      <div role="tab" id={id} className={className}>
        {children}
      </div>
    ),
    TabPanel: ({
      children,
      id,
      className,
    }: {
      children: React.ReactNode;
      id?: string;
      className?: string;
    }) => (
      <div role="tabpanel" id={id} className={className}>
        {children}
      </div>
    ),
  };
});

import { TabsClient } from 'components/tab/partial/TabsClient';
import type { ITabFields } from 'components/tab/Tabs.type';

const baseParams = {
  styles: '',
  RenderingIdentifier: 'tabs-block',
  renderingId: 'tabs-block',
} as never;

describe('TabsClient', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'getComputedStyle',
      vi.fn(() => ({
        getPropertyValue: vi.fn(() => ''),
      })) as unknown as typeof getComputedStyle,
    );
    vi.stubGlobal('scrollTo', vi.fn());
  });

  it('renders tab titles and panel copy', () => {
    const fields: ITabFields = {
      TabItems: [
        {
          fields: {
            ComponentId: { value: '' },
            Title: { value: 'First' },
            Description: { value: '<p>Panel one</p>' },
          },
        },
        {
          fields: {
            ComponentId: { value: '' },
            Title: { value: 'Second' },
            Description: { value: '<p>Panel two</p>' },
          },
        },
      ],
    };

    render(<TabsClient fields={fields} params={baseParams} />);

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    const panels = screen.getAllByRole('tabpanel').map((p) => p.textContent ?? '');
    expect(panels.some((t) => t.includes('Panel one'))).toBe(true);
    expect(panels.some((t) => t.includes('Panel two'))).toBe(true);
  });

  it('anchor tabs do not nest links inside tab controls (WCAG 4.1.2)', () => {
    const fields: ITabFields = {
      TabItems: [
        {
          fields: {
            ComponentId: { value: 'section-one' },
            Title: { value: 'Section One' },
            Description: { value: '<p>Copy</p>' },
          },
        },
        {
          fields: {
            ComponentId: { value: 'faq' },
            Title: { value: 'FAQ' },
            Description: { value: '' },
          },
        },
      ],
    };

    render(<TabsClient fields={fields} params={baseParams} />);

    expect(screen.getByRole('tab', { name: 'Section One' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'FAQ' })).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders sticky class on Section when any ComponentId is set', () => {
    const fields: ITabFields = {
      TabItems: [
        {
          fields: {
            ComponentId: { value: 'anchor' },
            Title: { value: 'Anchor Tab' },
            Description: { value: '' },
          },
        },
      ],
    };

    const { container } = render(<TabsClient fields={fields} params={baseParams} />);
    expect(container.querySelector('.sticky')).toBeTruthy();
  });

  it('does not render sticky class when no ComponentId', () => {
    const fields: ITabFields = {
      TabItems: [
        {
          fields: {
            ComponentId: { value: '' },
            Title: { value: 'Normal' },
            Description: { value: '' },
          },
        },
      ],
    };

    const { container } = render(<TabsClient fields={fields} params={baseParams} />);
    expect(container.querySelector('.sticky')).toBeFalsy();
  });

  it('renders in editing mode with top-0 sticky class', () => {
    const fields: ITabFields = {
      TabItems: [
        {
          fields: {
            ComponentId: { value: 'anchor' },
            Title: { value: 'Editing Tab' },
            Description: { value: '' },
          },
        },
      ],
    };

    const { container } = render(
      <TabsClient fields={fields} params={baseParams} isEditing={true} />,
    );
    expect(container.querySelector('.top-0')).toBeTruthy();
  });

  it('renders mixed tabs: anchor tab (no panel) and non-anchor tab (with panel)', () => {
    const fields: ITabFields = {
      TabItems: [
        {
          fields: {
            ComponentId: { value: 'anchor' },
            Title: { value: 'Anchor' },
            Description: { value: '<p>Not shown</p>' },
          },
        },
        {
          fields: {
            ComponentId: { value: '' },
            Title: { value: 'Content' },
            Description: { value: '<p>Shown in panel</p>' },
          },
        },
      ],
    };

    render(<TabsClient fields={fields} params={baseParams} />);
    const panels = screen.getAllByRole('tabpanel');
    // A11y: keep a tabpanel mounted for every tab so each tab's `aria-controls` resolves.
    expect(panels.length).toBe(2);
    expect(panels[0].textContent).not.toContain('Shown in panel');
    expect(panels[1].textContent).toContain('Shown in panel');
  });
});
