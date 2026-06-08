import { describe, it, expect } from 'vitest';
import {
  contentSwitcherSolutionKeyFromSitecorePath,
  contentSwitcherTabMatchesSolutionParam,
  getContentSwitcherTabSolutionKey,
} from 'components/contentSwitcher/contentSwitcherUtils';
import type { ITabItemsFields } from 'components/contentSwitcher/ContentSwitcher.type';
import { MediaType } from 'src/utils/enum';

function minimalTab(options: {
  id: string;
  url?: string;
  label?: string;
}): ITabItemsFields {
  return {
    id: options.id,
    url: options.url,
    fields: {
      TabLabel: { value: options.label ?? 'Tab' },
      TabContent: { value: '' },
      MediaType: {
        fields: { Value: { value: MediaType.IMAGE } },
      },
      Image: { value: { src: '', width: 1, height: 1, alt: '' } },
      Video: {
        fields: {
          Autoplay: { value: false },
          BrightcoveId: { value: '' },
          Caption: { value: '' },
          CoverImage: { value: { src: '', width: 1, height: 1, alt: '' } },
          Loop: { value: false },
          Title: { value: '' },
        },
      },
    },
  };
}

describe('contentSwitcherSolutionKeyFromSitecorePath', () => {
  it('returns lowercased last segment of Sitecore path', () => {
    expect(
      contentSwitcherSolutionKeyFromSitecorePath(
        '/Solutions/Foodsafe/Data/Content-Switcher/Modular-Plastic-Belting',
      ),
    ).toBe('modular-plastic-belting');
  });

  it('returns null for empty input', () => {
    expect(contentSwitcherSolutionKeyFromSitecorePath('')).toBeNull();
    expect(contentSwitcherSolutionKeyFromSitecorePath(undefined)).toBeNull();
  });
});

describe('getContentSwitcherTabSolutionKey', () => {
  it('prefers url last segment over label slug', () => {
    const item = minimalTab({
      id: '1',
      url: '/path/ThermoDrive-Technology',
      label: 'Different Label',
    });
    expect(getContentSwitcherTabSolutionKey(item)).toBe('thermodrive-technology');
  });

  it('falls back to label-based slug when url is missing', () => {
    const item = minimalTab({
      id: '2',
      label: 'Tools and Components',
    });
    expect(getContentSwitcherTabSolutionKey(item)).toBe('tools-and-components');
  });
});

describe('contentSwitcherTabMatchesSolutionParam', () => {
  it('matches canonical slug from url (case-insensitive param)', () => {
    const item = minimalTab({
      id: '1',
      url: '/x/Belt-Design',
      label: 'Belt Design',
    });
    expect(contentSwitcherTabMatchesSolutionParam(item, 'belt-design')).toBe(true);
    expect(contentSwitcherTabMatchesSolutionParam(item, 'Belt-Design')).toBe(true);
  });

  it('matches legacy TabLabel text and slug from label fallback', () => {
    const item = minimalTab({
      id: '1',
      label: 'Beta',
    });
    expect(contentSwitcherTabMatchesSolutionParam(item, 'Beta')).toBe(true);
    expect(contentSwitcherTabMatchesSolutionParam(item, 'beta')).toBe(true);
  });
});

describe('getContentSwitcherTabSolutionKey - fallback to tab-id', () => {
  it('returns "tab-{id}" when both url and label are missing', () => {
    const item = minimalTab({ id: 'my-id', label: '' });
    // override url to undefined
    (item as unknown as { url: undefined }).url = undefined;
    expect(getContentSwitcherTabSolutionKey(item)).toBe('tab-my-id');
  });
});

describe('contentSwitcherTabMatchesSolutionParam - empty param', () => {
  it('returns false for an empty solutionParam', () => {
    const item = minimalTab({ id: '1', url: '/x/belt-design' });
    expect(contentSwitcherTabMatchesSolutionParam(item, '')).toBe(false);
  });

  it('returns false for a whitespace-only solutionParam', () => {
    const item = minimalTab({ id: '1', url: '/x/belt-design' });
    expect(contentSwitcherTabMatchesSolutionParam(item, '   ')).toBe(false);
  });

  it('returns false when neither canonical key nor label matches', () => {
    const item = minimalTab({ id: '1', url: '/x/belt-design', label: 'Belt Design' });
    expect(contentSwitcherTabMatchesSolutionParam(item, 'no-match')).toBe(false);
  });
});
