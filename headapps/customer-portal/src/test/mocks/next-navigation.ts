/**
 * Mocks for Next.js navigation hooks
 */

export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
};

export const mockSearchParams = {
  get: vi.fn(),
  has: vi.fn(),
  getAll: vi.fn(),
  keys: vi.fn(),
  values: vi.fn(),
  entries: vi.fn(),
  forEach: vi.fn(),
  toString: vi.fn(),
};

export const useRouter = vi.fn(() => mockRouter);
export const useSearchParams = vi.fn(() => mockSearchParams);
export const usePathname = vi.fn(() => '/');

