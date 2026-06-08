import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

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

const baseParams = {
  styles: '',
  RenderingIdentifier: 'billboard-test',
  ContainerWidth: { Value: { value: 'default' } },
} as never;

describe('BillboardClient', () => {
  it('sets root id from params.RenderingIdentifier lowercased', () => {
    const { container } = render(
      <BillboardClient fields={imageBillboardFields()} params={baseParams} />,
    );

    expect(container.firstChild).toHaveAttribute('id', 'billboard-test');
  });

  it('renders headline and uses ImageView when media type is image', () => {
    render(<BillboardClient fields={imageBillboardFields()} params={baseParams} />);

    expect(screen.getByText('Billboard headline')).toBeInTheDocument();
    expect(screen.getByTestId('billboard-image-view-mock')).toBeInTheDocument();
    expect(screen.queryByTestId('billboard-video-mock')).not.toBeInTheDocument();
  });

  it('renders Video when media type is video', () => {
    const fields = imageBillboardFields();
    fields.MediaType = { fields: { Value: { value: MediaType.VIDEO } } };

    render(<BillboardClient fields={fields} params={baseParams} />);

    expect(screen.getByTestId('billboard-video-mock')).toBeInTheDocument();
    expect(screen.queryByTestId('billboard-image-view-mock')).not.toBeInTheDocument();
  });

  it('renders ImageView when MediaType is null but BackgroundImage has src', () => {
    const fields = imageBillboardFields();
    fields.MediaType = null as never;

    render(<BillboardClient fields={fields} params={baseParams} />);

    expect(screen.getByTestId('billboard-image-view-mock')).toBeInTheDocument();
    expect(screen.queryByTestId('billboard-video-mock')).not.toBeInTheDocument();
  });

  it('renders Video when MediaType is null, no image src, and Brightcove id is set', () => {
    const fields = imageBillboardFields();
    fields.MediaType = null as never;
    fields.BackgroundImage = { value: { src: '', width: 0, height: 0, alt: '' } };

    render(<BillboardClient fields={fields} params={baseParams} />);

    expect(screen.getByTestId('billboard-video-mock')).toBeInTheDocument();
    expect(screen.queryByTestId('billboard-image-view-mock')).not.toBeInTheDocument();
  });
});
