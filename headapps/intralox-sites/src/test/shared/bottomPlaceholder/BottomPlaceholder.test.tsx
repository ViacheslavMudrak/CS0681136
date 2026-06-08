import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('components/shared/BaseContainer', () => ({
  Container: ({ children, width }: { children: ReactNode; width?: string }) => (
    <div data-testid="container" data-width={width}>
      {children}
    </div>
  ),
}));

vi.mock('components/shared/ImageView/ImageView', () => ({
  ImageView: () => <div data-testid="image-view" />,
}));

vi.mock('components/callToAction/partial/LinkVIew', () => ({
  default: ({ children }: { children: React.ReactNode }) => <a data-testid="link-view">{children}</a>,
}));

vi.mock('@sitecore-content-sdk/nextjs', () => ({
  RichText: ({ field }: { field?: { value?: string } }) => <div data-testid="richtext">{field?.value}</div>,
}));

import BottomPlaceholder from 'components/shared/bottomPlaceholder/BottomPlaceholder';

describe('BottomPlaceholder', () => {
  it('returns null when author bio and parent link are off', () => {
    const { container } = render(
      <BottomPlaceholder ShowParentPage={{ value: false }} author={{ fields: {} } as never} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders author bio when Bio has value', () => {
    render(
      <BottomPlaceholder
        author={
          {
            fields: {
              Bio: { value: '<p>Bio text</p>' },
              Image: { value: { src: '/a.jpg' } },
            },
          } as never
        }
      />,
    );
    expect(screen.getByTestId('richtext')).toHaveTextContent('<p>Bio text</p>');
    expect(screen.getByTestId('image-view')).toBeInTheDocument();
  });

  it('renders parent page link with hr when author bio is off and top border is on', () => {
    render(
      <BottomPlaceholder
        ShowParentPage={{ value: true }}
        ShowTopBorder={{ value: true }}
        title="Back"
        url="/parent"
        HasDarkTheme={{ value: true }}
      />,
    );
    expect(screen.getByTestId('link-view')).toHaveTextContent('Back');
    expect(document.querySelector('hr')).toBeTruthy();
  });

  it('renders parent page link without hr when top border is off', () => {
    render(
      <BottomPlaceholder
        ShowParentPage={{ value: true }}
        ShowTopBorder={{ value: false }}
        title="Back"
        url="/parent"
        HasDarkTheme={{ value: true }}
      />,
    );
    expect(screen.getByTestId('link-view')).toHaveTextContent('Back');
    expect(document.querySelector('hr')).toBeFalsy();
  });

  it('renders parent link without hr when author bio is on', () => {
    render(
      <BottomPlaceholder
        ShowParentPage={{ value: true }}
        title="Back"
        url="/p"
        author={{ fields: { Bio: { value: '<p>x</p>' } } } as never}
      />,
    );
    expect(screen.getByTestId('link-view')).toBeInTheDocument();
    expect(document.querySelector('hr')).toBeFalsy();
  });
});
