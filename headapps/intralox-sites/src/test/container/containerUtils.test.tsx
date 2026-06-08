import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { Default } from 'components/container/Container';

const basePage = { mode: { isEditing: false } } as never;
const baseRendering = {} as never;

describe('Container Default', () => {
  it('includes base component class on root', () => {
    const { container } = render(
      <Default
        params={{ styles: '', RenderingIdentifier: 'c1', DynamicPlaceholderId: '1' } as never}
        rendering={baseRendering}
        page={basePage}
      />,
    );
    expect(container.querySelector('.component.container-default')).toBeTruthy();
  });

  it('maps fullwidth-container style token to max-w-none', () => {
    const { container } = render(
      <Default
        params={
          {
            styles: 'my-style fullwidth-container',
            RenderingIdentifier: 'c2',
            DynamicPlaceholderId: '2',
          } as never
        }
        rendering={baseRendering}
        page={basePage}
      />,
    );
    const root = container.querySelector('.component.container-default');
    expect(root?.className).toContain('my-style');
    expect(root?.className).toContain('fullwidth-container');
    expect(root?.className).toContain('max-w-none');
  });
});
