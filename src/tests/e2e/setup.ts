import '@testing-library/jest-dom/vitest';
import { beforeEach, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// 1. Mock MediaQueryList for Theme and Viewport tests
class MockMediaQueryList implements MediaQueryList {
  matches: boolean;
  media: string;
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null = null;
  private listeners: Array<(e: MediaQueryListEvent) => void> = [];

  constructor(media: string, matches: boolean = false) {
    this.media = media;
    this.matches = matches;
  }

  addEventListener(type: string, listener: any) {
    if (type === 'change') {
      this.listeners.push(listener);
    }
  }

  removeEventListener(type: string, listener: any) {
    if (type === 'change') {
      this.listeners = this.listeners.filter((l) => l !== listener);
    }
  }

  addListener(listener: any) {
    this.addEventListener('change', listener);
  }

  removeListener(listener: any) {
    this.removeEventListener('change', listener);
  }

  dispatchEvent(_event: Event): boolean {
    return true;
  }

  setMatches(matches: boolean) {
    this.matches = matches;
    const ev = { matches, media: this.media } as MediaQueryListEvent;
    if (this.onchange) {
      this.onchange.call(this, ev);
    }
    this.listeners.forEach((l) => l(ev));
  }
}

// Global registry of matchMedia queries so tests can trigger changes
export const activeMediaQueries = new Map<string, MockMediaQueryList>();

export function createMatchMediaMock(initialDark: boolean = false) {
  return vi.fn().mockImplementation((query: string) => {
    let mql = activeMediaQueries.get(query);
    if (!mql) {
      const isDarkQuery = query.includes('prefers-color-scheme: dark');
      mql = new MockMediaQueryList(query, isDarkQuery ? initialDark : false);
      activeMediaQueries.set(query, mql);
    }
    return mql;
  });
}

// 2. ResizeObserver polyfill
class MockResizeObserver implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// 3. LocalStorage Polyfill
class MockStorage implements Storage {
  private store: Map<string, string> = new Map();

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
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    const protoSetItem = typeof Storage !== 'undefined' ? Storage.prototype.setItem : null;
    if (protoSetItem && vi.isMockFunction(protoSetItem)) {
      protoSetItem.call(this, key, value);
    }
    this.store.set(key, String(value));
  }
}

// Install Polyfills
const mockStorage = new MockStorage();
Object.defineProperty(window, 'localStorage', {
  value: mockStorage,
  writable: true,
  configurable: true,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: createMatchMediaMock(false),
});

globalThis.ResizeObserver = MockResizeObserver;
window.ResizeObserver = MockResizeObserver;

window.scrollTo = vi.fn().mockImplementation(() => {});

// Lifecycle hooks
beforeEach(() => {
  localStorage.clear();
  activeMediaQueries.clear();
  window.matchMedia = createMatchMediaMock(false);
  document.documentElement.className = '';
  document.documentElement.lang = 'zh';
  window.innerWidth = 1280;
  window.innerHeight = 800;
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});
