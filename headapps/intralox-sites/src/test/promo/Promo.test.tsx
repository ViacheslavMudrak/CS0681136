import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@sitecore-content-sdk/nextjs', () => ({
  NextImage: ({ field }: { field?: { value?: { src?: string } } }) =>
    field?.value?.src ? <img data-testid="promo-icon" src={field.value.src} alt="" /> : null,
  RichText: ({ field, className }: { field?: { value?: string }; className?: string }) => (
    <div className={className} data-testid="richtext">
      {field?.value}
    </div>
  ),
  Link: ({ field }: { field?: { value?: { href?: string; text?: string } } }) => (
    <a href={field?.value?.href} data-testid="link">
      {field?.value?.text}
    </a>
  ),
}));

import { Default, WithText } from 'components/promo/Promo';

const baseParams = { styles: 'promo-style', RenderingIdentifier: 'promo-1' } as never;

const sampleFields = {
  PromoIcon: { value: { src: '/icon.png' } },
  PromoText: { value: '<p>Main</p>' },
  PromoLink: { value: { href: '/go', text: 'Go' } },
  PromoText2: { value: '<p>Secondary</p>' },
} as never;

describe('Promo', () => {
  it('Default renders icon, rich text, and link', () => {
    render(<Default fields={sampleFields} params={baseParams} />);
    expect(screen.getByTestId('promo-icon')).toHaveAttribute('src', '/icon.png');
    expect(screen.getByTestId('richtext')).toHaveTextContent('<p>Main</p>');
    expect(screen.getByTestId('link')).toHaveAttribute('href', '/go');
  });

  it('WithText renders two rich text slots', () => {
    render(<WithText fields={sampleFields} params={baseParams} />);
    const rts = screen.getAllByTestId('richtext');
    expect(rts).toHaveLength(2);
    expect(rts[0]).toHaveClass('promo-text');
    expect(rts[1]).toHaveTextContent('<p>Secondary</p>');
  });

  it('shows empty hint when fields is undefined at runtime', () => {
    render(<Default fields={undefined as never} params={baseParams} />);
    expect(screen.getByText('Promo')).toHaveClass('is-empty-hint');
  });
});
