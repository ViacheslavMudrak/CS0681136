import { describe, expect, it } from 'vitest';

import { resolveNavigationFields } from 'components/navigation/navigationUtils';

describe('resolveNavigationFields', () => {
  it('returns empty object for null, undefined, or non-object raw', () => {
    expect(resolveNavigationFields(null)).toEqual({});
    expect(resolveNavigationFields(undefined)).toEqual({});
    expect(resolveNavigationFields('not-an-object')).toEqual({});
    expect(resolveNavigationFields(0)).toEqual({});
  });

  it('returns flat fields unchanged when there is no data.datasource', () => {
    const flat = { SearchIconCssClass: { value: 'fa-solid fa-magnifying-glass' } };
    expect(resolveNavigationFields(flat)).toEqual(flat);
  });

  it('merges camelCase keys from GraphQL datasource', () => {
    const raw = {
      data: {
        datasource: {
          searchIconCssClass: { jsonValue: { value: 'fa-solid fa-magnifying-glass' } },
          topBar: { id: 'tb1', fields: {} },
        },
      },
    };
    const r = resolveNavigationFields(raw);
    expect(r.SearchIconCssClass).toEqual({
      jsonValue: { value: 'fa-solid fa-magnifying-glass' },
    });
    expect(r.TopBar).toEqual({ id: 'tb1', fields: {} });
  });

  it('prefers flat PascalCase over datasource when both exist', () => {
    const raw = {
      SearchIconCssClass: { value: 'from-flat' },
      data: {
        datasource: {
          searchIconCssClass: { value: 'from-ds' },
        },
      },
    };
    expect(resolveNavigationFields(raw).SearchIconCssClass).toEqual({ value: 'from-flat' });
  });

  it('merges IconCssClass from datasource (footer-parity field name)', () => {
    const raw = {
      data: {
        datasource: {
          iconCssClass: { value: 'fa-solid fa-magnifying-glass' },
        },
      },
    };
    expect(resolveNavigationFields(raw).IconCssClass).toEqual({
      value: 'fa-solid fa-magnifying-glass',
    });
  });

  it('merges SearchCloseIconCssClass from datasource (camelCase)', () => {
    const raw = {
      data: {
        datasource: {
          searchCloseIconCssClass: { value: 'fa-solid fa-xmark' },
        },
      },
    };
    expect(resolveNavigationFields(raw).SearchCloseIconCssClass).toEqual({
      value: 'fa-solid fa-xmark',
    });
  });

  it('merges Logo from flat camelCase on datasource when PascalCase absent', () => {
    const raw = {
      data: {
        datasource: {
          logo: { value: { src: '/logo.png' } },
        },
      },
    };
    expect(resolveNavigationFields(raw).Logo).toEqual({ value: { src: '/logo.png' } });
  });

  it('prefers flat Logo over datasource when both exist', () => {
    const raw = {
      Logo: { value: { src: '/from-flat.png' } },
      data: {
        datasource: {
          logo: { value: { src: '/from-ds.png' } },
        },
      },
    };
    expect(resolveNavigationFields(raw).Logo).toEqual({ value: { src: '/from-flat.png' } });
  });
});
