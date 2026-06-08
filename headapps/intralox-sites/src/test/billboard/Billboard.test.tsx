import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const { billboardClientSpy } = vi.hoisted(() => ({
  billboardClientSpy: vi.fn(
    ({ fields }: { fields: { Headline: { value: string } } }) => (
      <div data-testid="billboard-client-stub">{fields.Headline.value}</div>
    ),
  ),
}));

vi.mock('components/billboard/partial/BillboardClient', () => ({
  BillboardClient: (props: { fields: { Headline: { value: string } }; params: unknown }) =>
    billboardClientSpy(props),
}));

import { Default } from 'components/billboard/Billboard';
import type { BillboardFields } from 'components/billboard/Billboard.type';

const baseParams = { styles: '', RenderingIdentifier: 'bb-1' } as never;

describe('Billboard Default', () => {
  it('delegates rendering to BillboardClient with fields and params', () => {
    const fields = {
      Headline: { value: 'Hero headline' },
    } as unknown as BillboardFields;

    render(<Default fields={fields} params={baseParams} />);

    expect(screen.getByTestId('billboard-client-stub')).toHaveTextContent('Hero headline');
    expect(billboardClientSpy).toHaveBeenCalledWith(
      expect.objectContaining({ fields, params: baseParams }),
    );
  });
});
