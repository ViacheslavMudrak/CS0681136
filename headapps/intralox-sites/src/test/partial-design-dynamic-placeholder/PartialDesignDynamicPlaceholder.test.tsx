import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('.sitecore/component-map', () => ({ default: new Map() }));

vi.mock('@sitecore-content-sdk/nextjs', () => ({
  AppPlaceholder: ({ name }: { name: string }) => <div data-testid="ph">{name}</div>,
}));

import PartialDesignDynamicPlaceholder from 'components/partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder';

describe('PartialDesignDynamicPlaceholder', () => {
  it('passes rendering.params.sig as placeholder name', () => {
    render(
      <PartialDesignDynamicPlaceholder
        rendering={{ params: { sig: 'partial-sig-1' } } as never}
        page={{ mode: { isEditing: false } } as never}
        params={{} as never}
      />,
    );
    expect(screen.getByTestId('ph')).toHaveTextContent('partial-sig-1');
  });

  it('uses empty name when sig is missing', () => {
    render(
      <PartialDesignDynamicPlaceholder
        rendering={{ params: {} } as never}
        page={{ mode: { isEditing: false } } as never}
        params={{} as never}
      />,
    );
    expect(screen.getByTestId('ph')).toHaveTextContent('');
  });
});
