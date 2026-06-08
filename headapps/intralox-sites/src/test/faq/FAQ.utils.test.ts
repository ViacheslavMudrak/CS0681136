import { describe, it, expect } from 'vitest';

import type { IFAQItemFields } from 'components/faq/FAQ.type';
import {
  getFaqGroupLabels,
  groupFaqItemsInOrder,
  faqItemsUseGroupedLayout,
} from 'components/faq/FAQ.utils';

function groupField(value: string) {
  return { fields: { Value: { value } } };
}

function makeItem(
  id: string,
  question: string,
  faqGroups: Array<{ fields: { Value: { value: string } } }>,
): IFAQItemFields {
  return {
    id,
    fields: {
      Question: { value: question },
      Answer: { value: '<p>a</p>' },
      FaqGroup: faqGroups,
    },
  };
}

describe('FAQ.utils', () => {
  it('getFaqGroupLabels returns all distinct labels in order', () => {
    const item = makeItem('1', 'Q?', [
      groupField('Shipping'),
      groupField('Returns'),
      groupField('Shipping'),
    ]);
    expect(getFaqGroupLabels(item)).toEqual(['Shipping', 'Returns']);
  });

  it('groupFaqItemsInOrder places an item in every assigned group', () => {
    const shared = makeItem('shared', 'Same Q?', [groupField('A'), groupField('B')]);
    const onlyB = makeItem('b-only', 'B only?', [groupField('B')]);

    const groups = groupFaqItemsInOrder([shared, onlyB]);

    expect(groups.map((g) => g.label)).toEqual(['A', 'B']);
    const bucketA = groups.find((g) => g.label === 'A')?.items ?? [];
    const bucketB = groups.find((g) => g.label === 'B')?.items ?? [];
    expect(bucketA.map((i) => i.id)).toEqual(['shared']);
    expect(bucketB.map((i) => i.id)).toEqual(['shared', 'b-only']);
  });
});

describe('groupFaqItemsInOrder - duplicate label across items', () => {
  it('adds a second item to an existing group bucket (covers the labelToItems.has(label) true branch)', () => {
    const item1 = makeItem('i1', 'Q1?', [groupField('Technical')]);
    const item2 = makeItem('i2', 'Q2?', [groupField('Technical')]);
    const groups = groupFaqItemsInOrder([item1, item2]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.label).toBe('Technical');
    expect(groups[0]?.items.map((i) => i.id)).toEqual(['i1', 'i2']);
  });

  it('skips items with no fields', () => {
    const noFields = { id: 'bad' } as unknown as IFAQItemFields;
    const valid = makeItem('good', 'Q?', [groupField('General')]);
    const groups = groupFaqItemsInOrder([noFields, valid]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.items[0]?.id).toBe('good');
  });

  it('uses an empty label bucket for ungrouped items mixed with grouped ones', () => {
    const grouped = makeItem('g', 'Grouped Q?', [groupField('A')]);
    const ungrouped = makeItem('u', 'Ungrouped Q?', []);
    const groups = groupFaqItemsInOrder([grouped, ungrouped]);

    const emptyBucket = groups.find((g) => g.label === '');
    expect(emptyBucket).toBeDefined();
    expect(emptyBucket?.items[0]?.id).toBe('u');
  });
});

describe('faqItemsUseGroupedLayout', () => {
  it('returns false for items with no group', () => {
    const items = [makeItem('1', 'Q?', [])];
    expect(faqItemsUseGroupedLayout(items)).toBe(false);
  });

  it('returns true when at least one item has a group', () => {
    const items = [makeItem('1', 'Q?', [groupField('G1')])];
    expect(faqItemsUseGroupedLayout(items)).toBe(true);
  });
});
