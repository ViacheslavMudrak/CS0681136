import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@sitecore-content-sdk/nextjs', () => ({
  NextImage: ({ field }: { field?: { value?: { src?: string } } }) =>
    field?.value?.src ? <img data-testid="next-img" src={field.value.src} alt="" /> : null,
  Link: ({ children, field }: { children?: React.ReactNode; field?: { value?: { href?: string } } }) => (
    <a href={field?.value?.href} data-testid="sdk-link">
      {children}
    </a>
  ),
  Text: ({ field }: { field?: { value?: string } }) => <span data-testid="caption">{field?.value}</span>,
}));

import { Default, Banner } from 'components/image/Image';

const baseParams = { styles: ' img-s ', RenderingIdentifier: 'img-r' } as never;
const basePage = { mode: { isEditing: false } } as never;

const fullFields = {
  Image: { value: { src: '/pic.jpg' } },
  ImageCaption: { value: 'Cap' },
  TargetUrl: { value: { href: '/target', text: 'T' } },
} as never;

describe('Image Default', () => {
  it('wraps image in link when not editing and TargetUrl has href', () => {
    render(<Default fields={fullFields} params={baseParams} page={basePage} />);
    expect(screen.getByTestId('sdk-link')).toHaveAttribute('href', '/target');
    expect(screen.getByTestId('next-img')).toHaveAttribute('src', '/pic.jpg');
  });

  it('renders image without link when editing', () => {
    render(
      <Default
        fields={fullFields}
        params={baseParams}
        page={{ mode: { isEditing: true } } as never}
      />,
    );
    expect(screen.queryByTestId('sdk-link')).toBeFalsy();
    expect(screen.getByTestId('next-img')).toBeInTheDocument();
  });

  it('renders image without link when TargetUrl href is empty', () => {
    const fields = {
      ...fullFields,
      TargetUrl: { value: { href: '', text: '' } },
    } as never;
    render(<Default fields={fields} params={baseParams} page={basePage} />);
    expect(screen.queryByTestId('sdk-link')).toBeFalsy();
  });

  it('renders empty hint when fields is falsy', () => {
    render(<Default fields={undefined as never} params={baseParams} page={basePage} />);
    expect(screen.getByText('Image')).toHaveClass('is-empty-hint');
  });
});

describe('Image Banner', () => {
  it('renders hero banner with image field', () => {
    const { container } = render(
      <Banner fields={fullFields} params={{ styles: ' ban ', RenderingIdentifier: 'b1' } as never} />,
    );
    expect(container.querySelector('.hero-banner')).toBeTruthy();
    expect(screen.getByTestId('next-img')).toHaveAttribute('src', '/pic.jpg');
  });
});
