/**
 * Color luminance and WCAG 2.1 contrast calculation helpers.
 */

function parseRgb(color: string): [number, number, number] {
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    const num = parseInt(hex, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return [parseInt(rgbMatch[1], 10), parseInt(rgbMatch[2], 10), parseInt(rgbMatch[3], 10)];
  }

  return [0, 0, 0];
}

function getLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(foreground: string, background: string): number {
  const l1 = getLuminance(parseRgb(foreground));
  const l2 = getLuminance(parseRgb(background));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function assertWcagContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const required = level === 'AAA' ? (isLargeText ? 4.5 : 7.0) : isLargeText ? 3.0 : 4.5;
  return ratio >= required;
}

/**
 * Validate that an interactive element meets basic ARIA accessibility criteria.
 */
export function assertAccessibleInteractiveElement(element: HTMLElement): void {
  const role = element.getAttribute('role') || element.tagName.toLowerCase();
  const hasAriaLabel = !!element.getAttribute('aria-label') || !!element.getAttribute('aria-labelledby');
  const hasTextContent = (element.textContent || '').trim().length > 0;
  const isAccessible = hasAriaLabel || hasTextContent || element.hasAttribute('title');

  if (!isAccessible) {
    throw new Error(
      `Element <${element.tagName.toLowerCase()}> with role "${role}" has no accessible name (neither aria-label, aria-labelledby, title, nor text content).`
    );
  }
}
