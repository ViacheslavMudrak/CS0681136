import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { DividerProps } from 'components/divider/Divider.type';
import { Default } from 'components/divider/Divider';
import {
  DIVIDER_ARIA_LABEL,
  DIVIDER_EMPTY_HINT,
  DIVIDER_EMPTY_HINT_HIDDEN,
} from 'components/divider/dividerUtils';

function createDividerProps(overrides: Partial<DividerProps> = {}): DividerProps {
  const isEditing = overrides.page?.mode?.isEditing ?? false;
  return {
    rendering: overrides.rendering ?? ({ uid: 'divider-test-uid', componentName: 'Divider' } as never),
    page: {
      mode: { isEditing },
      ...overrides.page,
    } as DividerProps['page'],
    params: {
      RenderingIdentifier: 'divider-rendering-id',
      styles: '',
      ShowDivider: '1',
      ...overrides.params,
    },
    fields: overrides.fields,
  } as DividerProps;
}

describe('Divider Default', () => {
  it('renders nothing for visitors when component ShowDivider param is off', () => {
    const { container } = render(
      <Default
        {...createDividerProps({
          params: { ShowDivider: '0' },
          fields: {
            Style: { value: 'line' },
            ShowDivider: { value: true },
          },
        })}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing for visitors when datasource ShowDivider is off', () => {
    const { container } = render(
      <Default
        {...createDividerProps({
          fields: {
            Style: { value: 'line' },
            ShowDivider: { value: false },
          },
        })}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders horizontal rule with design-token border classes when style is line', () => {
    render(
      <Default
        {...createDividerProps({
          fields: {
            Style: { value: 'line' },
            Spacing: { value: 'default' },
            ShowDivider: { value: true },
          },
        })}
      />,
    );

    const region = screen.getByRole('region', { name: DIVIDER_ARIA_LABEL });
    expect(region).toBeInTheDocument();

    const rule = region.querySelector('hr');
    expect(rule).toBeInTheDocument();
    expect(rule).toHaveAttribute('aria-hidden', 'true');
    expect(rule?.className).toMatch(/border-stroke-default/);
    expect(rule?.className).toMatch(/border-t/);
    expect(rule?.className).toMatch(/\bmy-12\b/);
  });

  it('renders hr directly (no flex wrapper) for center position', () => {
    render(
      <Default
        {...createDividerProps({
          params: { Position: 'center', ShowDivider: '1' },
          fields: {
            Style: { value: 'Line' },
            ShowDivider: { value: true },
          },
        })}
      />,
    );

    const section = document.querySelector('section.component.divider');
    const hr = section?.querySelector('hr');
    expect(hr).toBeInTheDocument();
    expect(hr?.parentElement?.classList.contains('flex')).toBe(false);
  });

  it('wraps hr in a flex container for left position', () => {
    render(
      <Default
        {...createDividerProps({
          params: { Position: 'left', ShowDivider: '1' },
          fields: {
            Style: { value: 'Line' },
            ShowDivider: { value: true },
          },
        })}
      />,
    );

    const hr = document.querySelector('hr');
    expect(hr).toBeInTheDocument();
    expect(hr?.parentElement?.className).toMatch(/\bflex\b/);
    expect(hr?.parentElement?.className).toMatch(/justify-start/);
  });

  it('wraps hr in a flex container for right position', () => {
    render(
      <Default
        {...createDividerProps({
          params: { Position: 'right', ShowDivider: '1' },
          fields: {
            Style: { value: 'Line' },
            ShowDivider: { value: true },
          },
        })}
      />,
    );

    const hr = document.querySelector('hr');
    expect(hr).toBeInTheDocument();
    expect(hr?.parentElement?.className).toMatch(/\bflex\b/);
    expect(hr?.parentElement?.className).toMatch(/justify-end/);
  });

  it('uses GraphQL datasource fields when flat fields are absent', () => {
    render(
      <Default
        {...createDividerProps({
          fields: {
            data: {
              datasource: {
                style: { jsonValue: { value: 'line' } },
                spacing: { jsonValue: { value: 'default' } },
                showDivider: { jsonValue: { value: true } },
              },
            },
          },
        })}
      />,
    );

    expect(screen.getByRole('region', { name: DIVIDER_ARIA_LABEL })).toBeInTheDocument();
    expect(document.querySelector('hr')).toBeInTheDocument();
  });

  it('applies inline width and mx-auto for partial Width with center position', () => {
    render(
      <Default
        {...createDividerProps({
          params: { Position: 'center', ShowDivider: '1' },
          fields: {
            Style: { value: 'line' },
            Width: {
              fields: { Value: { value: '30' } },
            },
            ShowDivider: { value: true },
          },
        })}
      />,
    );

    const rule = document.querySelector('hr');
    expect(rule).toBeInTheDocument();
    expect(rule).toHaveStyle({ width: '30%' });
    expect(rule?.className).toMatch(/\bmx-auto\b/);
    expect(rule?.className.split(/\s+/)).toContain('max-w-full');
    expect(rule?.className.split(/\s+/)).not.toContain('w-full');
  });

  it('applies partial Width inside flex for left position without mx-auto', () => {
    render(
      <Default
        {...createDividerProps({
          params: { Position: 'left', ShowDivider: '1' },
          fields: {
            Style: { value: 'line' },
            Width: { fields: { Value: { value: '50' } } },
            ShowDivider: { value: true },
          },
        })}
      />,
    );

    const rule = document.querySelector('hr');
    expect(rule).toHaveStyle({ width: '50%' });
    expect(rule?.className).not.toMatch(/\bmx-auto\b/);
  });

  it('reads Width from GraphQL datasource', () => {
    render(
      <Default
        {...createDividerProps({
          fields: {
            data: {
              datasource: {
                style: { jsonValue: { value: 'line' } },
                width: { jsonValue: { value: '40' } },
                showDivider: { jsonValue: { value: true } },
              },
            },
          },
        })}
      />,
    );

    expect(document.querySelector('hr')).toHaveStyle({ width: '40%' });
  });

  it('reads Width from GraphQL datasource when field key is PascalCase Width', () => {
    render(
      <Default
        {...createDividerProps({
          fields: {
            data: {
              datasource: {
                style: { jsonValue: { value: 'line' } },
                Width: { jsonValue: { fields: { Value: { value: '25' } } } },
                showDivider: { jsonValue: { value: true } },
              },
            },
          },
        })}
      />,
    );

    expect(document.querySelector('hr')).toHaveStyle({ width: '25%' });
  });

  it('uses rendering.fields when top-level fields is undefined', () => {
    render(
      <Default
        {...createDividerProps({
          fields: undefined,
          rendering: {
            uid: 'divider-test-uid',
            componentName: 'Divider',
            fields: {
              Style: { value: 'line' },
              Width: { fields: { Value: { value: '50' } } },
              ShowDivider: { value: true },
            },
          } as never,
        })}
      />,
    );

    expect(document.querySelector('hr')).toHaveStyle({ width: '50%' });
  });

  it('uses full width when Width is Full or omitted', () => {
    const { rerender } = render(
      <Default
        {...createDividerProps({
          fields: {
            Style: { value: 'line' },
            Width: { fields: { Value: { value: 'Full' } } },
            ShowDivider: { value: true },
          },
        })}
      />,
    );

    let rule = document.querySelector('hr');
    expect(rule?.getAttribute('style')).toBeNull();
    expect(rule?.className.split(/\s+/)).toContain('w-full');

    rerender(
      <Default
        {...createDividerProps({
          fields: {
            Style: { value: 'line' },
            ShowDivider: { value: true },
          },
        })}
      />,
    );
    rule = document.querySelector('hr');
    expect(rule?.className.split(/\s+/)).toContain('w-full');
  });

  it('renders spacing-only block (no hr) when style is none and not editing', () => {
    render(
      <Default
        {...createDividerProps({
          fields: {
            Style: { value: 'none' },
            Spacing: { value: 'default' },
            ShowDivider: { value: true },
          },
        })}
      />,
    );

    const section = document.querySelector('section.component.divider');
    expect(section).toHaveAttribute('aria-hidden', 'true');
    expect(document.querySelector('hr')).toBeNull();

    const spacer = section?.querySelector(
      '.component-content > div > div[aria-hidden="true"]',
    );
    expect(spacer).toBeInTheDocument();
  });

  it('shows empty hint when fields are missing and editor is in editing mode', () => {
    render(
      <Default
        {...createDividerProps({
          fields: undefined,
          page: { mode: { isEditing: true } } as DividerProps['page'],
        })}
      />,
    );

    expect(screen.getByText(DIVIDER_EMPTY_HINT)).toBeInTheDocument();
    expect(screen.getByRole('region', { name: DIVIDER_ARIA_LABEL })).toBeInTheDocument();
  });

  it('shows hidden hint when divider disabled in datasource but editing', () => {
    render(
      <Default
        {...createDividerProps({
          page: { mode: { isEditing: true } } as DividerProps['page'],
          fields: {
            Style: { value: 'line' },
            ShowDivider: { value: false },
          },
        })}
      />,
    );

    expect(screen.getByText(DIVIDER_EMPTY_HINT_HIDDEN)).toBeInTheDocument();
  });

  it('does not expose hr to accessibility tree as a separate separator (decorative)', () => {
    render(
      <Default
        {...createDividerProps({
          fields: {
            Style: { value: 'line' },
            ShowDivider: { value: true },
          },
        })}
      />,
    );

    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });

  it('renders spacing-only block (no hr) when style is "Spacing" (Sitecore dropdown value)', () => {
    render(
      <Default
        {...createDividerProps({
          fields: {
            Style: { value: 'Spacing' },
            Spacing: { value: 'Default' },
            ShowDivider: { value: true },
          },
        })}
      />,
    );

    const section = document.querySelector('section.component.divider');
    expect(section).toHaveAttribute('aria-hidden', 'true');
    expect(document.querySelector('hr')).toBeNull();

    const spacer = section?.querySelector('.component-content > div > div[aria-hidden="true"]');
    expect(spacer).toBeInTheDocument();
  });

  it('shows empty hint for "Spacing" style in editing mode', () => {
    render(
      <Default
        {...createDividerProps({
          page: { mode: { isEditing: true } } as DividerProps['page'],
          fields: {
            Style: { value: 'Spacing' },
            Spacing: { value: 'Default' },
            ShowDivider: { value: true },
          },
        })}
      />,
    );

    expect(screen.getByText(DIVIDER_EMPTY_HINT)).toBeInTheDocument();
  });

  it('applies my-6 spacing class for small spacing with line style', () => {
    render(
      <Default
        {...createDividerProps({
          fields: {
            Style: { value: 'Line' },
            Spacing: { value: 'Small' },
            ShowDivider: { value: true },
          },
        })}
      />,
    );

    const rule = document.querySelector('hr');
    expect(rule).toBeInTheDocument();
    expect(rule?.className).toMatch(/\bmy-6\b/);
  });

  it('applies mt-0 mb-12 spacing classes for "No Top Spacing" with line style', () => {
    render(
      <Default
        {...createDividerProps({
          fields: {
            Style: { value: 'Line' },
            Spacing: { value: 'No Top Spacing' },
            ShowDivider: { value: true },
          },
        })}
      />,
    );

    const rule = document.querySelector('hr');
    expect(rule).toBeInTheDocument();
    expect(rule?.className).toMatch(/\bmt-0\b/);
    expect(rule?.className).toMatch(/\bmb-12\b/);
  });

  it('applies my-6 spacing class for small spacing with Spacing style', () => {
    render(
      <Default
        {...createDividerProps({
          fields: {
            Style: { value: 'Spacing' },
            Spacing: { value: 'Small' },
            ShowDivider: { value: true },
          },
        })}
      />,
    );

    const spacer = document.querySelector('div[aria-hidden="true"]');
    expect(spacer).toBeInTheDocument();
    expect(spacer?.className).toMatch(/\bmy-6\b/);
  });

  it('applies mt-0 mb-12 spacing classes for "No Top Spacing" with Spacing style', () => {
    render(
      <Default
        {...createDividerProps({
          fields: {
            Style: { value: 'Spacing' },
            Spacing: { value: 'No Top Spacing' },
            ShowDivider: { value: true },
          },
        })}
      />,
    );

    const spacer = document.querySelector('div[aria-hidden="true"]');
    expect(spacer).toBeInTheDocument();
    expect(spacer?.className).toMatch(/\bmt-0\b/);
    expect(spacer?.className).toMatch(/\bmb-12\b/);
  });

  it('omits vertical margin classes on hr when Spacing field is missing', () => {
    render(
      <Default
        {...createDividerProps({
          fields: {
            Style: { value: 'line' },
            ShowDivider: { value: true },
          },
        })}
      />,
    );

    const rule = document.querySelector('hr');
    expect(rule).toBeInTheDocument();
    expect(rule?.className).not.toMatch(/\bmy-\d+\b/);
    expect(rule?.className).not.toMatch(/\bmb-\d+\b/);
    expect(rule?.className).not.toMatch(/\bmt-\d+\b/);
  });

  it('omits vertical margin classes on hr when Spacing value is blank', () => {
    render(
      <Default
        {...createDividerProps({
          fields: {
            Style: { value: 'line' },
            Spacing: { value: '   ' },
            ShowDivider: { value: true },
          },
        })}
      />,
    );

    const rule = document.querySelector('hr');
    expect(rule).toBeInTheDocument();
    expect(rule?.className).not.toMatch(/\bmy-\d+\b/);
  });

  it('omits margin utilities on spacing-only block when Spacing field is missing', () => {
    render(
      <Default
        {...createDividerProps({
          fields: {
            Style: { value: 'spacing' },
            ShowDivider: { value: true },
          },
        })}
      />,
    );

    const spacer = document.querySelector('section.component.divider div[aria-hidden="true"]');
    expect(spacer).toBeInTheDocument();
    expect(spacer?.className).not.toMatch(/\bmy-\d+\b/);
    expect(spacer?.className).not.toMatch(/\bmb-\d+\b/);
    expect(spacer?.className).not.toMatch(/\bmt-\d+\b/);
  });
});
