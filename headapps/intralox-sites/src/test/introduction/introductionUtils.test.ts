import { describe, expect, it } from 'vitest';

import {
  introductionMediaColumnVisible,
  introductionShouldRenderSection,
  resolveIntroductionVideoCoverImage,
  type ResolvedIntroductionFields,
} from 'components/introduction/introductionUtils';
import type { IVideoFields } from 'src/utils/interface';

describe('resolveIntroductionVideoCoverImage', () => {
  it('prefers video CoverImage when both layout Image and video cover have src', () => {
    const layout = { value: { src: 'https://example.com/layout.jpg', width: 1, height: 1 } };
    const video = {
      fields: {
        CoverImage: { value: { src: 'https://example.com/cover.jpg', width: 1, height: 1 } },
      },
    } as IVideoFields;
    expect(resolveIntroductionVideoCoverImage(layout, video)).toBe(video.fields.CoverImage);
  });

  it('falls back to layout Image when video CoverImage has no src', () => {
    const layout = { value: { src: 'https://example.com/layout.jpg', width: 1, height: 1 } };
    const video = {
      fields: {
        CoverImage: { value: {} },
      },
    } as IVideoFields;
    expect(resolveIntroductionVideoCoverImage(layout, video)).toBe(layout);
  });
});

describe('introductionMediaColumnVisible', () => {
  it('returns true when video type, Video present, and isEditing', () => {
    const resolved: ResolvedIntroductionFields = {
      MediaType: { fields: { Value: { value: 'Video' } } } as never,
      Video: { fields: { BrightcoveId: { value: '12345' } } } as IVideoFields,
    };
    expect(introductionMediaColumnVisible(resolved, true)).toBe(true);
  });

  it('returns true when video type, Video present, and Brightcove id exists (not editing)', () => {
    const resolved: ResolvedIntroductionFields = {
      MediaType: { fields: { Value: { value: 'Video' } } } as never,
      Video: { fields: { BrightcoveId: { value: '12345' } } } as IVideoFields,
    };
    expect(introductionMediaColumnVisible(resolved, false)).toBe(true);
  });

  it('returns isEditing when video type but Video is null/undefined (line 301)', () => {
    const resolved: ResolvedIntroductionFields = {
      MediaType: { fields: { Value: { value: 'Video' } } } as never,
      Video: null,
    };
    expect(introductionMediaColumnVisible(resolved, false)).toBe(false);
    expect(introductionMediaColumnVisible(resolved, true)).toBe(true);
  });

  it('returns true when image media with a src', () => {
    const resolved: ResolvedIntroductionFields = {
      Image: { value: { src: 'https://example.com/img.jpg' } } as never,
    };
    expect(introductionMediaColumnVisible(resolved, false)).toBe(true);
  });

  it('returns isEditing && image defined when image has no src (line 305)', () => {
    const resolved: ResolvedIntroductionFields = {
      Image: { value: {} } as never,
    };
    expect(introductionMediaColumnVisible(resolved, false)).toBe(false);
    expect(introductionMediaColumnVisible(resolved, true)).toBe(true);
  });

  it('returns false when no media and not editing', () => {
    expect(introductionMediaColumnVisible({}, false)).toBe(false);
  });
});

describe('introductionShouldRenderSection', () => {
  it('returns true when isEditing', () => {
    expect(introductionShouldRenderSection({}, true)).toBe(true);
  });

  it('returns false when no visible content and not editing', () => {
    expect(introductionShouldRenderSection({}, false)).toBe(false);
  });

  it('returns true when headline is present', () => {
    const resolved: ResolvedIntroductionFields = {
      Headline: { value: 'Hello' },
    };
    expect(introductionShouldRenderSection(resolved, false)).toBe(true);
  });
});
