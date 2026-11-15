/**
 * Raw semantic version injected from `package.json` at build time via Vite `define`.
 */
export const APP_VERSION: string = __APP_VERSION__;

/**
 * Display-formatted version badge label (e.g. `v0.1.0`), preserving any leading `v`.
 */
export const APP_VERSION_LABEL: string = APP_VERSION.startsWith('v')
  ? APP_VERSION
  : `v${APP_VERSION}`;
