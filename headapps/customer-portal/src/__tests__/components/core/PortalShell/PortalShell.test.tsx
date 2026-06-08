import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PortalShell from 'components/core/PortalShell/PortalShell';
import { TEST_CASE_DATA_IDS } from '../../../../helpers/enums';
import type { PortalShellProps, PortalShellFields } from 'components/core/PortalShell/PortalShell.type';

vi.mock('components/core/PortalShell/partial/PortalShellClient', () => ({
  default: () => (
    <div data-testid={TEST_CASE_DATA_IDS.PORTAL_SHELL}>PortalShellDefaultVariant</div>
  ),
}));

vi.mock('components/core/PortalShell/variants/PortalShellDefault.variant', () => ({
  default: (props: PortalShellProps) => (
    <div data-testid={TEST_CASE_DATA_IDS.PORTAL_SHELL}>PortalShellDefaultVariant</div>
  ),
}));

describe('PortalShell', () => {
  const mockRendering = {
    componentName: 'PortalShell',
    placeholders: { Top: [], SideNav: [], Content: [] },
  };

  const mockPage = {
    layout: {
      sitecore: {
        route: { itemLanguage: 'en' },
        context: { language: 'en' },
      },
    },
  };

  const mockParams = {
    params: {
      styles: 'test-styles',
      RenderingIdentifier: 'test-id',
    },
  };

  const mockFields: PortalShellFields = {
    Title: { value: 'Portal' },
    data: {
      item: {
        children: {
          results: [],
        },
      },
    },
  };

  const defaultProps: PortalShellProps = {
    rendering: mockRendering,
    page: mockPage,
    params: mockParams,
    fields: mockFields,
  };

  it('should render component with test id', () => {
    render(<PortalShell {...defaultProps} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.PORTAL_SHELL)).toBeInTheDocument();
  });

  it('should pass serialized props to variant component', () => {
    render(<PortalShell {...defaultProps} />);

    const variant = screen.getByTestId(TEST_CASE_DATA_IDS.PORTAL_SHELL);
    expect(variant).toBeInTheDocument();
    expect(variant.textContent).toBe('PortalShellDefaultVariant');
  });

  it('should handle empty fields', () => {
    const emptyFields: PortalShellFields = {};

    render(<PortalShell {...defaultProps} fields={emptyFields} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.PORTAL_SHELL)).toBeInTheDocument();
  });

  it('should handle missing fields gracefully', () => {
    const partialProps = {
      rendering: mockRendering,
      page: mockPage,
      params: mockParams,
      fields: undefined,
    } as unknown as PortalShellProps;

    render(<PortalShell {...partialProps} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.PORTAL_SHELL)).toBeInTheDocument();
  });

  it('should serialize rendering and page so no functions are passed to client', () => {
    const propsWithCircular = {
      ...defaultProps,
      rendering: { ...mockRendering, fn: () => {} },
      page: { ...mockPage, fn: () => {} },
    } as unknown as PortalShellProps;

    expect(() => render(<PortalShell {...propsWithCircular} />)).not.toThrow();
    expect(screen.getByTestId(TEST_CASE_DATA_IDS.PORTAL_SHELL)).toBeInTheDocument();
  });
});
