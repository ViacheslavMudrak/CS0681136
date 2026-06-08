import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

/** jsdom does not implement ResizeObserver; components that measure overflow use it in effects. */
class ResizeObserverMock {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
globalThis.ResizeObserver = ResizeObserverMock;

/** jsdom throws "Not implemented" for scrollTo; used by body scroll lock and portal chrome. */
Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
window.scrollTo = vi.fn() as typeof window.scrollTo;

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
});

