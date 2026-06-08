import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const { linkGridClientSpy } = vi.hoisted(() => ({
  linkGridClientSpy: vi.fn(() => <div data-testid="link-grid-client-stub" />),
}));

vi.mock('components/linkGrid/partial/LinkGridClient', () => ({
  LinkGridClient: (props: { fields: unknown; params: unknown }) => linkGridClientSpy(props),
}));

import { Default } from 'components/linkGrid/LinkGrid';
import type { ILinkGridFields } from 'components/linkGrid/LinkGrid.type';

const baseParams = { styles: '', RenderingIdentifier: 'lg-1' } as never;

describe('LinkGrid Default', () => {
  it('delegates to LinkGridClient', () => {
    const fields = {
      Headline: { value: 'Grid' },
      Description: { value: '' },
      ContentItems: { value: [] },
      ItemCount: { Value: '3' },
    } satisfies ILinkGridFields;

    render(<Default fields={fields} params={baseParams} />);

    expect(screen.getByTestId('link-grid-client-stub')).toBeInTheDocument();
    expect(linkGridClientSpy).toHaveBeenCalledWith(
      expect.objectContaining({ fields, params: baseParams }),
    );
  });
});
