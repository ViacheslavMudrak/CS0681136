import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('components/callToAction/partial/LinkVIew', () => ({
  default: () => <div data-testid="link-view-mock" />,
}));

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const { mediaTileSitecoreSdkMock } = await import('src/test/mocks/viteSafeMocks');
  return mediaTileSitecoreSdkMock();
});

import { CallToActionClient } from 'components/callToAction/partial/CallToActionClient';
import type { ICallToActionFields } from 'components/callToAction/CallToAction.type';

const fields: ICallToActionFields = {
  Heading: { value: 'Title' },
  Text: { value: 'Body' },
  Link: { value: { href: '/go', text: 'Go' } },
  Image: { value: { src: '', width: 1, height: 1, alt: '' } },
};

const baseParams = {
  styles: '',
  RenderingIdentifier: 'CtaBlock',
} as never;

describe('CallToActionClient', () => {
  it('renders heading and body copy', () => {
    const { container } = render(<CallToActionClient fields={fields} params={baseParams} />);

    const rich = screen.getAllByTestId('rich-text');
    expect(rich.some((el) => el.textContent === 'Title')).toBe(true);
    expect(rich.some((el) => el.textContent === 'Body')).toBe(true);
    expect(container.querySelector('.rounded-lg')).toBeTruthy();
    expect(screen.getByTestId('link-view-mock')).toBeInTheDocument();
  });

  it('applies xl text size class when TextSize param is xl', () => {
    const { container } = render(
      <CallToActionClient
        fields={fields}
        params={
          {
            styles: '',
            RenderingIdentifier: 'CtaBlock',
            TextSize: { Value: { value: 'xl' } },
          } as never
        }
      />,
    );

    expect(container.querySelector('.text-lg')).toBeTruthy();
  });
});
