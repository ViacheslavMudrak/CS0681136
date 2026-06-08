import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const { solutionsGroupSpy } = vi.hoisted(() => ({
  solutionsGroupSpy: vi.fn(({ fields }: { fields: { Text: { value: string } } }) => (
    <div data-testid="solutions-group-stub">{fields.Text.value}</div>
  )),
}));

vi.mock('components/solutions-group/partial/SolutionsGroupClient', () => ({
  SolutionsGroupClient: (props: { fields: { Text: { value: string } }; params: unknown }) =>
    solutionsGroupSpy(props),
}));

import { Default } from 'components/solutions-group/SolutionsGroup';
import type { ISolutionsGroupFields } from 'components/solutions-group/SolutionsGroup.type';

const baseParams = { styles: '', RenderingIdentifier: 'sg-1' } as never;

describe('SolutionsGroup Default', () => {
  it('delegates to SolutionsGroupClient', () => {
    const fields = {
      Text: { value: 'Solutions copy' },
      Image: { value: { src: '', width: 1, height: 1, alt: '' } },
      MediaType: { fields: { Value: { value: 'image' } } },
      Video: {
        fields: {
          BrightcoveId: { value: '' },
          Autoplay: { value: false },
          Loop: { value: false },
          Caption: { value: '' },
          CoverImage: { value: { src: '', width: 1, height: 1, alt: '' } },
          Title: { value: '' },
        },
      },
      QuickLinks: [],
    } as ISolutionsGroupFields;

    render(<Default fields={fields} params={baseParams} />);

    expect(screen.getByTestId('solutions-group-stub')).toHaveTextContent('Solutions copy');
    expect(solutionsGroupSpy).toHaveBeenCalledWith(
      expect.objectContaining({ fields, params: baseParams }),
    );
  });
});
