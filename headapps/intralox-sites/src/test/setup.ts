import '@testing-library/jest-dom';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

/** MediaTile and other renderings import the full map; avoid loading every component in unit tests. */
vi.mock('.sitecore/component-map', () => ({
  default: new Map(),
  componentMap: new Map(),
}));

/** In-memory Storage for jsdom when Node's `--localstorage-file` stub lacks `clear()`. */
class LocalStorageMock implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return [...this.store.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

function ensureTestLocalStorage(): void {
  const storage = globalThis.localStorage;
  if (typeof storage?.clear === 'function' && typeof storage?.setItem === 'function') {
    return;
  }

  Object.defineProperty(globalThis, 'localStorage', {
    value: new LocalStorageMock(),
    writable: true,
    configurable: true,
  });
}

beforeEach(() => {
  ensureTestLocalStorage();
  localStorage.clear();
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

