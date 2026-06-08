import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Page } from '@sitecore-content-sdk/nextjs';

const { tabsClientSpy } = vi.hoisted(() => ({
  tabsClientSpy: vi.fn(
    ({
      fields,
      isEditing,
    }: {
      fields: { TabItems: { fields: { Title: { value: string } } }[] };
      isEditing: boolean;
    }) => (
      <div data-testid="tabs-client-stub" data-editing={String(isEditing)}>
        {fields.TabItems[0]?.fields.Title.value}
      </div>
    ),
  ),
}));

vi.mock('components/tab/partial/TabsClient', () => ({
  TabsClient: (props: {
    fields: { TabItems: { fields: { Title: { value: string } } }[] };
    params: unknown;
    isEditing: boolean;
  }) => tabsClientSpy(props),
}));

import { Default } from 'components/tab/Tabs';
import type { ITabFields } from 'components/tab/Tabs.type';

const baseParams = { styles: '', renderingId: 'tabs-1' } as never;

const basePage = { mode: { isEditing: false } } as Page;

describe('Tabs Default', () => {
  it('delegates to TabsClient', () => {
    const fields: ITabFields = {
      TabItems: [
        {
          fields: {
            ComponentId: { value: '' },
            Title: { value: 'Overview' },
            Description: { value: '' },
          },
        },
      ],
    };

    render(<Default fields={fields} params={baseParams} page={basePage} />);

    expect(screen.getByTestId('tabs-client-stub')).toHaveTextContent('Overview');
    expect(screen.getByTestId('tabs-client-stub')).toHaveAttribute('data-editing', 'false');
    expect(tabsClientSpy).toHaveBeenCalledWith(
      expect.objectContaining({ fields, params: baseParams, isEditing: false }),
    );
  });
});
