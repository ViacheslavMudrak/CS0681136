import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const { quickLinkSitecoreSdkMock } = await import('src/test/mocks/viteSafeMocks');
  return quickLinkSitecoreSdkMock();
});

vi.mock('components/shared/ImageView/ImageView', () => ({
  ImageView: () => (
    <div data-testid="quick-link-standalone-image-view" className="relative overflow-hidden h-full w-full">
      <img alt="" src="https://example.com/identify-a-belt.png" className="object-cover object-center" />
    </div>
  ),
}));

import { QuickLinkIcon } from 'components/quick-link/partial/QuickLinkPartials';
import type { QuickLinkFields } from 'components/quick-link/QuickLink.type';

function cmsIconFields(value: string): QuickLinkFields['Icon'] {
  return {
    id: '3524192a-2d3b-407e-82ef-bffe352517b4',
    name: value,
    displayName: value,
    fields: { Value: { value } },
  };
}

describe('QuickLinkIcon', () => {
  it('renders message-square CMS icon in card center layout', () => {
    const fields: QuickLinkFields = {
      Image: { value: {} },
      Icon: cmsIconFields('message-square'),
    };

    const { container } = render(
      <QuickLinkIcon
        fields={fields}
        cardType="card"
        iconPosition="center"
        iconCmsKey="message-square"
        isEditing={false}
        cardIsNavigableLink
      />,
    );

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders Image CMS icon item as award ribbon in card center layout', () => {
    const fields: QuickLinkFields = {
      Image: { value: {} },
      Icon: cmsIconFields('Image'),
    };

    const { container } = render(
      <QuickLinkIcon
        fields={fields}
        cardType="card"
        iconPosition="center"
        iconCmsKey="award"
        isEditing={false}
        cardIsNavigableLink
      />,
    );

    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelector('svg circle')).toBeInTheDocument();
  });

  it('renders ImageView MediaBox for standalone card image on mobile rail shell', () => {
    const fields: QuickLinkFields = {
      Image: {
        value: {
          src: 'https://example.com/identify-a-belt.png',
          width: 448,
          height: 235,
          alt: 'Identify a belt',
        },
      },
    };

    const { container } = render(
      <QuickLinkIcon
        fields={fields}
        cardType="card"
        iconPosition="left"
        iconCmsKey={undefined}
        isEditing={false}
        standaloneStrip
        cardIsNavigableLink
      />,
    );

    expect(screen.getByTestId('quick-link-standalone-image-view')).toBeInTheDocument();
    expect(container.querySelector('.max-\\[599px\\]\\:block')).toBeTruthy();
    expect(container.querySelector('.min-\\[600px\\]\\:block')).toBeTruthy();
  });

  it('renders standalone card rail icon with visible SVG sizing', () => {
    const fields: QuickLinkFields = {
      Image: { value: {} },
      Icon: cmsIconFields('message-square'),
    };

    const { container } = render(
      <QuickLinkIcon
        fields={fields}
        cardType="card"
        iconPosition="left"
        iconCmsKey="message-square"
        isEditing={false}
        standaloneStrip
        cardIsNavigableLink
      />,
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.className.baseVal ?? svg?.getAttribute('class') ?? '').toMatch(/size-\[1em\]/);
  });
});
