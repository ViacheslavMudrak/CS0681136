import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ComponentRendering, Page } from '@sitecore-content-sdk/nextjs';

const { textBlockSpy } = vi.hoisted(() => ({
  textBlockSpy: vi.fn(({ fields }: { fields: { Title: { value: string } } }) => (
    <div data-testid="text-block-stub">{fields.Title.value}</div>
  )),
}));

vi.mock('components/textBlock/partial/TextBlockClient', () => ({
  TextBlockClient: (props: { fields: { Title: { value: string } }; params: unknown }) =>
    textBlockSpy(props),
}));

vi.mock('@sitecore-content-sdk/nextjs', () => ({
  AppPlaceholder: () => null,
}));

import { Default } from 'components/textBlock/TextBlock';
import type { ITextBlockFields } from 'components/textBlock/TextBlock.type';

const baseParams = { styles: '', RenderingIdentifier: 'tb-1' } as never;
const basePage = {
  mode: { isEditing: false },
  layout: { sitecore: { route: {} } },
} as unknown as Page;
const baseRendering = { componentName: 'TextBlock' } as unknown as ComponentRendering;
const baseComponentMap = new Map() as never;

describe('TextBlock Default', () => {
  it('delegates to TextBlockClient', () => {
    const fields: ITextBlockFields = {
      Title: { value: 'Block title' },
      Eyebrow: { value: '' },
      Description: { value: '' },
      Link: { value: { href: '' } },
    };

    render(
      <Default
        fields={fields}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
        componentMap={baseComponentMap}
      />,
    );

    expect(screen.getByTestId('text-block-stub')).toHaveTextContent('Block title');
    expect(textBlockSpy).toHaveBeenCalledWith(
      expect.objectContaining({ fields, params: baseParams }),
    );
  });
});
