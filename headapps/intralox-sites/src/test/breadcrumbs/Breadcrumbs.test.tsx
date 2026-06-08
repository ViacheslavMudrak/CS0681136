import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const { breadcrumbsClientSpy } = vi.hoisted(() => ({
  breadcrumbsClientSpy: vi.fn(
    ({
      fields,
    }: {
      fields: { data: { currentPage: { Title: { data: { value: string } } } } };
    }) => (
      <nav data-testid="breadcrumbs-stub">{fields.data.currentPage.Title.data.value}</nav>
    ),
  ),
}));

vi.mock('components/breadcrumbs/partial/BreadcrumbsClient', () => ({
  BreadcrumbsClient: (props: {
    fields: { data: { currentPage: { Title: { data: { value: string } } } } };
    params: unknown;
  }) => breadcrumbsClientSpy(props),
}));

import { Default } from 'components/breadcrumbs/Breadcrumbs';
import type { IBreadcrumbsFields } from 'components/breadcrumbs/Breadcrumbs.type';

const baseParams = { styles: '', RenderingIdentifier: 'bc-1' } as never;

describe('Breadcrumbs Default', () => {
  it('delegates to BreadcrumbsClient', () => {
    const fields: IBreadcrumbsFields = {
      data: {
        currentPage: {
          Title: { data: { value: 'Current' } },
          BreadcrumbData: [],
        },
      },
    };

    render(<Default fields={fields} params={baseParams} />);

    expect(screen.getByTestId('breadcrumbs-stub')).toHaveTextContent('Current');
    expect(breadcrumbsClientSpy).toHaveBeenCalledWith(
      expect.objectContaining({ fields, params: baseParams }),
    );
  });
});
