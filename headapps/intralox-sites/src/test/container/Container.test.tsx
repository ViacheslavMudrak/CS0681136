import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@sitecore-content-sdk/nextjs', () => ({
  AppPlaceholder: () => <div data-testid="app-placeholder" />,
}));

vi.mock('.sitecore/component-map', () => ({
  default: new Map(),
}));

import { Default } from 'components/container/Container';

describe('Container Default', () => {
  it('wraps with w-full when styles include container', () => {
    const { container } = render(
      <Default
        params={{
          styles: 'container',
          DynamicPlaceholderId: 'main',
        }}
        rendering={{} as never}
        page={{} as never}
      />,
    );
    expect(container.querySelector('.w-full')).toBeTruthy();
  });

  it('renders without wrapper when styles omit container', () => {
    const { container } = render(
      <Default
        params={{
          styles: '',
          DynamicPlaceholderId: 'main',
        }}
        rendering={{} as never}
        page={{} as never}
      />,
    );
    expect(container.querySelector('.w-full')).toBeFalsy();
  });
});
