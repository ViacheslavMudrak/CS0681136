import { describe, expect, it } from 'vitest';

import {
  resolveBillboardBrightcoveId,
  resolveBillboardMediaKind,
} from 'components/billboard/billboardUtils';
import type { BillboardFields } from 'components/billboard/Billboard.type';
import { MediaType } from 'src/utils/enum';

const videoFields: BillboardFields['Video'] = {
  fields: {
    BrightcoveId: { value: '6389085534112' },
    Autoplay: { value: false },
    Loop: { value: false },
    Caption: { value: '' },
    CoverImage: { value: { src: '', width: 1, height: 1, alt: '' } },
    Title: { value: 'Video title' },
  },
};

const baseFields = (): Pick<BillboardFields, 'MediaType' | 'BackgroundImage' | 'Video'> => ({
  BackgroundImage: {
    value: {
      src: 'https://example.com/bg.jpg',
      width: 2400,
      height: 1350,
      alt: 'Billboard',
    },
  },
  MediaType: { fields: { Value: { value: MediaType.IMAGE } } },
  Video: videoFields,
});

describe('resolveBillboardMediaKind', () => {
  it('returns image when MediaType is Image and BackgroundImage has src', () => {
    expect(resolveBillboardMediaKind(baseFields())).toBe('image');
  });

  it('returns video when MediaType is Video and Brightcove id exists', () => {
    const fields = baseFields();
    fields.MediaType = { fields: { Value: { value: MediaType.VIDEO } } };
    expect(resolveBillboardMediaKind(fields)).toBe('video');
  });

  it('prefers image when MediaType is null and both image and video are present', () => {
    const fields = baseFields();
    fields.MediaType = null as never;
    expect(resolveBillboardMediaKind(fields)).toBe('image');
  });

  it('returns video when MediaType is null and only Brightcove id is present', () => {
    const fields = baseFields();
    fields.MediaType = null as never;
    fields.BackgroundImage = { value: { src: '', width: 0, height: 0, alt: '' } };
    expect(resolveBillboardMediaKind(fields)).toBe('video');
  });

  it('returns null when no usable media fields are present', () => {
    expect(resolveBillboardMediaKind(undefined)).toBeNull();
    expect(
      resolveBillboardMediaKind({
        MediaType: null as never,
        BackgroundImage: { value: { src: '', width: 0, height: 0, alt: '' } },
        Video: {
          fields: {
            BrightcoveId: { value: '' },
            Autoplay: { value: false },
            Loop: { value: false },
            Caption: { value: '' },
            CoverImage: { value: { src: '', width: 1, height: 1, alt: '' } },
            Title: { value: '' },
          },
        },
      }),
    ).toBeNull();
  });
});

describe('resolveBillboardBrightcoveId', () => {
  it('reads Brightcove id from nested video fields', () => {
    expect(resolveBillboardBrightcoveId(videoFields)).toBe('6389085534112');
  });
});
