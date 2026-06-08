import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('src/components/navigation/Navigation', async () => {
  const { navigationDefaultViMock } = await import('src/test/mocks/viteSafeMocks');
  return navigationDefaultViMock();
});

import { Default as Header } from 'components/header/Header';
import { Default as NavigationDefault } from 'src/components/navigation/Navigation';
import type { HeaderProps } from 'components/header/Header.type';

function createHeaderProps(overrides: Partial<HeaderProps> = {}): HeaderProps {
  return {
    rendering: overrides.rendering ?? ({ uid: 'header-test-uid', componentName: 'Header' } as never),
    page: {
      mode: { isEditing: false },
      ...overrides.page,
    } as HeaderProps['page'],
    params: {
      RenderingIdentifier: 'header-rendering-id',
      styles: 'custom-style',
      ...overrides.params,
    },
    fields: overrides.fields as HeaderProps['fields'],
  };
}

describe('Header Default', () => {
  it('renders shell without Navigation when fields are missing', () => {
    const { container } = render(
      <Header
        {...createHeaderProps({
          fields: undefined as never,
        })}
      />,
    );

    const root = container.querySelector('.component.header');
    expect(root).toBeTruthy();
    expect(root?.className).toContain('m-0!');
    expect(root?.className).toContain('p-0!');
    expect(root).toHaveClass('custom-style');
    expect(root).toHaveAttribute('id', 'header-rendering-id');
    expect(screen.queryByTestId('header-navigation-mock')).not.toBeInTheDocument();
    expect(vi.mocked(NavigationDefault)).not.toHaveBeenCalled();
  });

  it('renders Navigation inside component-content when fields are present', () => {
    render(
      <Header
        {...createHeaderProps({
          fields: { Logo: {} } as HeaderProps['fields'],
        })}
      />,
    );

    expect(screen.getByTestId('header-navigation-mock')).toBeInTheDocument();
    expect(vi.mocked(NavigationDefault)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(NavigationDefault).mock.calls[0][0]).toMatchObject({
      fields: { Logo: {} },
      params: expect.objectContaining({ RenderingIdentifier: 'header-rendering-id' }),
    });
  });

  it('renders without crashing when styles is undefined (styles ?? "" branch)', () => {
    const { container } = render(
      <Header
        {...createHeaderProps({
          fields: undefined as never,
          params: { RenderingIdentifier: '', styles: undefined },
        })}
      />,
    );
    const root = container.querySelector('.component.header');
    expect(root).toBeTruthy();
    expect(root?.className).not.toContain('undefined');
  });
});
