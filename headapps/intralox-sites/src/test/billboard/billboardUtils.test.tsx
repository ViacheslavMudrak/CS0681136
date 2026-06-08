import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('src/components/shared/video/Video', () => ({
  default: () => <div data-testid="billboard-video-mock" />,
}));

vi.mock('components/shared/ImageView/ImageView', () => ({
  ImageView: () => <div data-testid="billboard-image-view-mock" />,
}));

vi.mock('src/components/shared/LinkRenderer', () => ({
  default: () => <div data-testid="link-renderer-mock" />,
}));

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const { mediaTileSitecoreSdkMock } = await import('src/test/mocks/viteSafeMocks');
  return mediaTileSitecoreSdkMock();
});

import { BillboardClient } from 'components/billboard/partial/BillboardClient';
import type { BillboardFields } from 'components/billboard/Billboard.type';
import { MediaType } from 'src/utils/enum';

const videoFields = {
  fields: {
    BrightcoveId: { value: 'bc-99' },
    Autoplay: { value: false },
    Loop: { value: false },
    Caption: { value: '' },
    CoverImage: { value: { src: '', width: 1, height: 1, alt: '' } },
    Title: { value: 'V' },
  },
};

const imageBillboardFields = (): BillboardFields => ({
  BackgroundImage: {
    value: { src: 'https://example.com/bg.jpg', width: 1600, height: 900, alt: '' },
  },
  ButtonAlignment: { fields: { Value: { value: 'center' } } },
  Description: { value: '<p>Desc</p>' },
  Eyebrow: { value: 'Eyebrow' },
  Headline: { value: 'Billboard headline' },
  Links: [],
  Subheading: { value: '' },
  MediaType: { fields: { Value: { value: MediaType.IMAGE } } },
  Video: videoFields,
  FocalPoint: { fields: { Value: { value: 'center' } } },
});

const BASE_SHELL =
  'relative flex flex-col overflow-hidden items-center h-[100vw] md:min-h-[480px] md:max-h-[calc(100vh-147px-60px-24px)]';

describe('BillboardClient shell classes (render-based)', () => {
  it('uses base shell classes when no divider or ratio params apply', () => {
    const { container } = render(
      <BillboardClient fields={imageBillboardFields()} params={{ styles: '', RenderingIdentifier: 'bb' } as never} />,
    );
    expect(container.firstElementChild?.className).toContain(BASE_SHELL);
  });

  it('appends fade divider gradient when Divider is fade', () => {
    const { container } = render(
      <BillboardClient
        fields={imageBillboardFields()}
        params={
          {
            styles: '',
            RenderingIdentifier: 'bb-fade',
            Divider: { Value: { value: 'fade' } },
          } as never
        }
      />,
    );
    expect(container.firstElementChild?.className).toContain('after:bg-[linear-gradient(');
  });

  it('appends ratio height class when PreferredRatio is 16:9', () => {
    const { container } = render(
      <BillboardClient
        fields={imageBillboardFields()}
        params={
          {
            styles: '',
            RenderingIdentifier: 'bb-ratio',
            PreferredRatio: { Value: { value: '16:9' } },
          } as never
        }
      />,
    );
    expect(container.firstElementChild?.className).toContain('md:h-[56.25vw]');
  });
});
