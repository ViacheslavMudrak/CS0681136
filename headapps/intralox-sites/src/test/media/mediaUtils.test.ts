import { describe, expect, it } from 'vitest';

import {
  getCmsLinkAnchorProps,
  isVideoMediaType,
  mediaHasVisitorContent,
  mediaImageAspectBoxStyle,
  mediaVideoAspectBoxStyle,
  normalizeMediaFocalPoint,
  normalizeMediaObjectFit,
  parseMediaImageDimensions,
  parseMediaImageDimensionsWithFallback,
  parseVideoItemDimensions,
  readMediaParamString,
  readPlayInModal,
  resolveMediaLayoutFields,
  resolveMediaPlaybackOptions,
  resolveMediaVideoCoverImage,
  resolveMediaVideoPresentation,
  titleToVideoSlug,
} from 'components/media/mediaUtils';
import type { MediaFields } from 'components/media/mediaUtils';
import type { IVideoFields } from 'src/utils/interface';

describe('getCmsLinkAnchorProps', () => {
  it('uses link text as aria-label and adds rel for blank targets', () => {
    expect(
      getCmsLinkAnchorProps(
        {
          value: { href: '/x', text: 'Read more', target: '_blank' },
        },
        'Link',
      ),
    ).toEqual({
      'aria-label': 'Read more',
      target: '_blank',
      rel: 'noopener noreferrer',
    });
  });

  it('falls back to description then ariaFallback', () => {
    expect(
      getCmsLinkAnchorProps(
        {
          value: { href: '/y', description: 'Desc', text: '' },
        },
        'Fallback',
      ),
    ).toEqual({
      'aria-label': 'Desc',
      target: undefined,
      rel: undefined,
    });
    expect(
      getCmsLinkAnchorProps({ value: { href: '/z' } }, 'Fallback'),
    ).toEqual({
      'aria-label': 'Fallback',
      target: undefined,
      rel: undefined,
    });
  });
});

describe('titleToVideoSlug', () => {
  it('kebab-cases titles for URL query usage', () => {
    expect(titleToVideoSlug('The Intralox Foodsafe System')).toBe('the-intralox-foodsafe-system');
    expect(titleToVideoSlug('foodsafe video')).toBe('foodsafe-video');
  });

  it('returns empty for blank input', () => {
    expect(titleToVideoSlug('')).toBe('');
    expect(titleToVideoSlug('   ')).toBe('');
    expect(titleToVideoSlug(null)).toBe('');
  });
});

describe('resolveMediaVideoPresentation', () => {
  it('maps Link to modal-link regardless of play-in-modal', () => {
    expect(resolveMediaVideoPresentation('Link', false)).toBe('modal-link');
    expect(resolveMediaVideoPresentation('Link', true)).toBe('modal-link');
  });

  it('maps Button formats to modal CTAs', () => {
    expect(resolveMediaVideoPresentation('Button', false)).toBe('modal-button');
    expect(resolveMediaVideoPresentation('Button with custom label', true)).toBe('modal-button');
    expect(resolveMediaVideoPresentation('Button contrast', false)).toBe('modal-button-contrast');
    expect(resolveMediaVideoPresentation('Button with contrast', true)).toBe('modal-button-contrast');
  });

  it('maps Video to inline or poster+modal', () => {
    expect(resolveMediaVideoPresentation('Video', false)).toBe('inline');
    expect(resolveMediaVideoPresentation('Video', true)).toBe('modal-poster');
    expect(resolveMediaVideoPresentation('', true)).toBe('modal-poster');
  });
});

describe('resolveMediaPlaybackOptions', () => {
  it('returns video item defaults when Playback is empty', () => {
    expect(resolveMediaPlaybackOptions(undefined, true, false)).toEqual({
      autoplay: true,
      loop: false,
    });
    expect(resolveMediaPlaybackOptions('   ', false, true)).toEqual({
      autoplay: false,
      loop: true,
    });
  });

  it('applies Playback tokens over video defaults', () => {
    expect(resolveMediaPlaybackOptions('Autoplay', false, false)).toEqual({
      autoplay: true,
      loop: false,
    });
    expect(resolveMediaPlaybackOptions('Manual', true, true)).toEqual({
      autoplay: false,
      loop: true,
    });
    expect(resolveMediaPlaybackOptions('Loop', false, false)).toEqual({
      autoplay: false,
      loop: true,
    });
    expect(resolveMediaPlaybackOptions('Autoplay, Loop', false, false)).toEqual({
      autoplay: true,
      loop: true,
    });
    expect(resolveMediaPlaybackOptions('no loop', false, true)).toEqual({
      autoplay: false,
      loop: false,
    });
  });
});

describe('readPlayInModal', () => {
  it('reads Sitecore nested Value shape', () => {
    expect(readPlayInModal({ Value: { value: '1' } })).toBe(true);
    expect(readPlayInModal({ Value: { value: '0' } })).toBe(false);
  });
});

describe('isVideoMediaType', () => {
  it('detects video from droplist item', () => {
    expect(
      isVideoMediaType({
        fields: { Value: { value: 'Video' } },
      }),
    ).toBe(true);
    expect(
      isVideoMediaType({
        fields: { Value: { value: 'Image' } },
      }),
    ).toBe(false);
  });
});

describe('mediaHasVisitorContent', () => {
  const baseImageFields: MediaFields = {
    MediaType: { fields: { Value: { value: 'Image' } } },
    Image: { value: { src: 'https://example.com/a.jpg', width: 100, height: 100 } },
  };

  it('returns false for image without src when not editing', () => {
    expect(
      mediaHasVisitorContent(
        resolveMediaLayoutFields({
          ...baseImageFields,
          Image: { value: {} },
        }),
        false,
      ),
    ).toBe(false);
  });

  it('returns true for image with src in preview', () => {
    expect(
      mediaHasVisitorContent(resolveMediaLayoutFields(baseImageFields), false),
    ).toBe(true);
  });
});

describe('resolveMediaVideoCoverImage', () => {
  it('prefers datasource image src when present', () => {
    const ds = { value: { src: 'https://example.com/ds.jpg', width: 1, height: 1 } };
    const video = {
      fields: {
        CoverImage: { value: { src: 'https://example.com/cover.jpg', width: 1, height: 1 } },
      },
    } as import('src/utils/interface').IVideoFields;
    expect(resolveMediaVideoCoverImage(ds, video)).toBe(ds);
  });

  it('unwraps video CoverImage jsonValue so value.src is readable', () => {
    const video = {
      fields: {
        CoverImage: {
          jsonValue: {
            value: {
              src: 'https://example.com/from-jsonvalue.jpg',
              width: 100,
              height: 100,
            },
          },
        },
      },
    } as unknown as import('src/utils/interface').IVideoFields;
    expect(resolveMediaVideoCoverImage(undefined, video)?.value?.src).toBe(
      'https://example.com/from-jsonvalue.jpg',
    );
  });
});

describe('resolveMediaLayoutFields', () => {
  it('unwraps Image from jsonValue on datasource', () => {
    const resolved = resolveMediaLayoutFields({
      MediaType: { fields: { Value: { value: 'Image' } } },
      Image: { value: {} },
      data: {
        datasource: {
          Image: {
            jsonValue: {
              value: {
                src: 'https://example.com/from-ds.jpg',
                width: 200,
                height: 100,
              },
            },
          },
        },
      },
    } satisfies MediaFields);
    expect(resolved.Image?.value?.src).toBe('https://example.com/from-ds.jpg');
  });
});

describe('readPlayInModal', () => {
  it('accepts common param shapes', () => {
    expect(readPlayInModal('1')).toBe(true);
    expect(readPlayInModal('0')).toBe(false);
    expect(readPlayInModal(true)).toBe(true);
  });
});

describe('normalizeMediaFocalPoint', () => {
  it('lowercases CMS values', () => {
    expect(normalizeMediaFocalPoint('Center')).toBe('center');
  });
});

describe('normalizeMediaObjectFit', () => {
  it('parses contain and cover', () => {
    expect(normalizeMediaObjectFit('Contain')).toBe('contain');
    expect(normalizeMediaObjectFit('Cover')).toBe('cover');
  });
});

describe('parseMediaImageDimensions', () => {
  it('accepts string width and height from Sitecore layout JSON', () => {
    expect(
      parseMediaImageDimensions({
        value: { src: 'https://x.test/a.jpg', width: '584', height: '389' },
      }),
    ).toEqual({ width: 584, height: 389 });
  });
});

describe('parseMediaImageDimensionsWithFallback', () => {
  it('returns parsed dimensions when present', () => {
    expect(
      parseMediaImageDimensionsWithFallback({
        value: { src: 'https://x.test/a.jpg', width: 400, height: 300 },
      }),
    ).toEqual({ width: 400, height: 300 });
  });

  it('uses 16:9 default when src exists but width/height are missing', () => {
    expect(
      parseMediaImageDimensionsWithFallback({
        value: { src: 'https://x.test/a.jpg' },
      }),
    ).toEqual({ width: 1200, height: 675 });
  });

  it('returns null when there is no src', () => {
    expect(parseMediaImageDimensionsWithFallback({ value: {} })).toBeNull();
  });
});

describe('parseVideoItemDimensions', () => {
  it('reads Pascal-case Width and Height', () => {
    const v = {
      fields: {
        Width: { value: '1920' },
        Height: { value: 1080 },
      },
    } as IVideoFields;
    expect(parseVideoItemDimensions(v)).toEqual({ width: 1920, height: 1080 });
  });

  it('reads camel-case width and height', () => {
    const v = {
      fields: {
        width: { value: 640 },
        height: { value: '480' },
      },
    } as unknown as IVideoFields;
    expect(parseVideoItemDimensions(v)).toEqual({ width: 640, height: 480 });
  });

  it('returns null when dimensions are missing', () => {
    expect(
      parseVideoItemDimensions({
        fields: { BrightcoveId: { value: 'x' } },
      } as unknown as IVideoFields),
    ).toBeNull();
  });
});

describe('mediaVideoAspectBoxStyle', () => {
  it('returns aspect-ratio from video item dimensions', () => {
    expect(
      mediaVideoAspectBoxStyle({
        fields: {
          Width: { value: 1280 },
          Height: { value: 720 },
        },
      } as IVideoFields),
    ).toEqual({ aspectRatio: '1280 / 720' });
  });
});

describe('mediaImageAspectBoxStyle', () => {
  it('returns aspect-ratio for ImageView wrapper', () => {
    expect(
      mediaImageAspectBoxStyle({
        value: { src: 'https://x.test/a.jpg', width: '568', height: '298' },
      }),
    ).toEqual({ aspectRatio: '568 / 298' });
  });

  it('uses fallback dimensions for aspect when only src is set', () => {
    expect(
      mediaImageAspectBoxStyle({
        value: { src: 'https://x.test/a.jpg' },
      }),
    ).toEqual({ aspectRatio: '1200 / 675' });
  });
});

describe('readMediaParamString', () => {
  it('returns undefined for null', () => {
    expect(readMediaParamString(null)).toBeUndefined();
  });

  it('returns undefined for undefined', () => {
    expect(readMediaParamString(undefined)).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    expect(readMediaParamString('')).toBeUndefined();
  });

  it('returns the raw string when non-empty', () => {
    expect(readMediaParamString('fade')).toBe('fade');
  });

  it('extracts value from { Value: { value } } object', () => {
    expect(readMediaParamString({ Value: { value: 'fade' } })).toBe('fade');
  });

  it('coerces a numeric value to string', () => {
    expect(readMediaParamString({ Value: { value: 42 } })).toBe('42');
  });

  it('returns undefined when Value.value is undefined', () => {
    expect(readMediaParamString({ Value: {} })).toBeUndefined();
  });
});
