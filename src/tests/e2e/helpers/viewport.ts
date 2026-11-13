import { activeMediaQueries } from '../setup';

export type ViewportDevice = 'desktop' | 'tablet' | 'mobile';

export interface ViewportSize {
  width: number;
  height: number;
}

export const VIEWPORT_PRESETS: Record<ViewportDevice, ViewportSize> = {
  desktop: { width: 1280, height: 800 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
};

/**
 * Set the browser viewport dimensions and dispatch a resize event.
 */
export function setViewport(widthOrDevice: number | ViewportDevice, height?: number): void {
  let targetWidth: number;
  let targetHeight: number;

  if (typeof widthOrDevice === 'string') {
    const preset = VIEWPORT_PRESETS[widthOrDevice] || VIEWPORT_PRESETS.desktop;
    targetWidth = preset.width;
    targetHeight = preset.height;
  } else {
    targetWidth = widthOrDevice;
    targetHeight = height ?? 800;
  }

  window.innerWidth = targetWidth;
  window.innerHeight = targetHeight;
  window.dispatchEvent(new Event('resize'));
}

/**
 * Helper to simulate system theme preference changes via matchMedia
 */
export function setSystemThemePreference(dark: boolean): void {
  const query = '(prefers-color-scheme: dark)';
  const mql = activeMediaQueries.get(query);
  if (mql) {
    mql.setMatches(dark);
  }
}
