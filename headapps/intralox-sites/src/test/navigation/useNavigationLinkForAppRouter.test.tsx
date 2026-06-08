import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  usePathname: () => '/Corp/en/solutions',
  useParams: () => ({ site: 'Corp', locale: 'en' }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@sitecore-content-sdk/nextjs', () => ({
  useSitecore: () => ({ page: { mode: { isPreview: false } } }),
}));

import { useNavigationLinkForAppRouter } from 'components/navigation/useNavigationLinkForAppRouter';

describe('useNavigationLinkForAppRouter', () => {
  it('prefixes nav item link fields with site and locale for client navigation', () => {
    const { result } = renderHook(() => useNavigationLinkForAppRouter(false));

    const resolved = result.current.linkFieldForAppRouter({
      Link: { value: { href: '/Solutions/Foodsafe', text: 'Foodsafe' } },
    });

    expect(resolved?.value?.href).toBe('/Corp/Solutions/Foodsafe');
  });

  it('returns CMS link fields unchanged while editing', () => {
    const { result } = renderHook(() => useNavigationLinkForAppRouter(true));

    const link = { value: { href: '/Solutions/Foodsafe', text: 'Foodsafe' } };
    const resolved = result.current.linkForAppRouter(link);

    expect(resolved).toBe(link);
  });
});
