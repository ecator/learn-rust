import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTheme } from '@/lib/theme';

export type CursorMode = 'claw' | 'pointer' | 'text' | 'language' | 'theme';

export type CursorVariant =
  | 'default'
  | 'zh'
  | 'en'
  | 'ja'
  | 'cycle'
  | 'light'
  | 'dark'
  | 'system';

export interface ResolvedCursorState {
  mode: CursorMode;
  variant: CursorVariant;
}

const TEXT_INPUT_SELECTOR =
  'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]):not([type="file"]), textarea, [contenteditable="true"]';

const CLICKABLE_SELECTOR =
  'a[href], button:not(:disabled), [role="button"]:not([aria-disabled="true"]), select:not(:disabled), summary, label[for], input[type="checkbox"]:not(:disabled), input[type="radio"]:not(:disabled), input[type="submit"]:not(:disabled), input[type="button"]:not(:disabled), input[type="file"]:not(:disabled)';

const LANGUAGE_VARIANTS = new Set<CursorVariant>(['zh', 'en', 'ja', 'cycle']);
const THEME_VARIANTS = new Set<CursorVariant>(['light', 'dark', 'system']);

const LANGUAGE_FILL_COLORS: Record<string, string> = {
  zh: '#CE412B',
  en: '#2563EB',
  ja: '#DB2777',
  cycle: '#0284C7',
  default: '#0284C7',
};

function toElement(target: EventTarget | null): Element | null {
  if (!target) return null;
  if (target instanceof Element) return target;
  if (typeof Node !== 'undefined' && target instanceof Node) {
    return target.parentElement;
  }
  return null;
}

function normalizeLanguageVariant(raw: string | null): CursorVariant {
  if (raw && LANGUAGE_VARIANTS.has(raw as CursorVariant)) {
    return raw as CursorVariant;
  }
  return 'cycle';
}

function normalizeThemeVariant(raw: string | null): CursorVariant {
  if (raw && THEME_VARIANTS.has(raw as CursorVariant)) {
    return raw as CursorVariant;
  }
  return 'system';
}

/**
 * Resolves the active cursor mode and sub-variant from the hovered DOM target.
 */
export function resolveCursorState(target: EventTarget | null): ResolvedCursorState {
  const el = toElement(target);
  if (!el || typeof el.closest !== 'function') {
    return { mode: 'claw', variant: 'default' };
  }

  const customEl = el.closest('[data-cursor]');
  if (customEl) {
    const cursorAttr = customEl.getAttribute('data-cursor');
    const variantAttr = customEl.getAttribute('data-cursor-variant');

    if (cursorAttr === 'language') {
      return { mode: 'language', variant: normalizeLanguageVariant(variantAttr) };
    }
    if (cursorAttr === 'theme') {
      return { mode: 'theme', variant: normalizeThemeVariant(variantAttr) };
    }
  }

  const textEl = el.closest(TEXT_INPUT_SELECTOR);
  if (textEl && !(textEl as HTMLInputElement | HTMLTextAreaElement).disabled) {
    return { mode: 'text', variant: 'default' };
  }

  const clickableEl = el.closest(CLICKABLE_SELECTOR);
  if (clickableEl) {
    return { mode: 'pointer', variant: 'default' };
  }

  return { mode: 'claw', variant: 'default' };
}

/**
 * Returns the SVG hotspot offset (in px) so the active pointer tip aligns with clientX/clientY.
 */
export function getCursorHotspot(mode: CursorMode): { x: number; y: number } {
  if (mode === 'text') {
    return { x: 22, y: 22 };
  }
  if (mode === 'pointer') {
    return { x: 17, y: 5 };
  }
  return { x: 4, y: 4 };
}

function isCoarseOnlyDevice(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  try {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const anyFine = window.matchMedia('(any-pointer: fine)').matches;
    return coarse && !anyFine;
  } catch {
    return false;
  }
}

interface CrabClawGraphicProps {
  pressed: boolean;
  reducedMotion: boolean;
}

const CrabClawGraphic: React.FC<CrabClawGraphicProps> = ({ pressed, reducedMotion }) => {
  const lowerRotate = pressed ? 'rotate(13deg)' : 'rotate(0deg)';
  const upperRotate = pressed ? 'rotate(-2deg)' : 'rotate(0deg)';
  const transitionStyle = reducedMotion
    ? 'none'
    : 'transform 140ms cubic-bezier(0.34, 1.56, 0.64, 1)';

  return (
    <g data-testid="cursor-shape-claw">
      {/* Jointed Crab Forearm Cuff */}
      <path
        d="M21 22 C25 25, 29 29, 32 32 C33.5 33.5, 31 36.5, 28.5 34.5 C25.5 31.5, 22.5 28.5, 19.5 25.5 Z"
        fill="#B33621"
        stroke="#FFFFFF"
        strokeWidth="2.8"
        strokeLinejoin="round"
        style={{ paintOrder: 'stroke fill' }}
      />

      {/* Lower Movable Pincer (Dactylus) */}
      <g
        data-testid="crab-claw-lower-jaw"
        style={{
          transformOrigin: '17px 19px',
          transform: lowerRotate,
          transition: transitionStyle,
        }}
      >
        <path
          d="M17 18.5 C14 15.5, 10 12.5, 5.5 10 C6.2 15.5, 10.5 21, 17 21.5 C18.5 21.5, 18.5 19.5, 17 18.5 Z"
          fill="#DC4A33"
          stroke="#FFFFFF"
          strokeWidth="2.8"
          strokeLinejoin="round"
          style={{ paintOrder: 'stroke fill' }}
        />
        <path
          d="M8.5 13.5 C10 16.5, 12.5 18.5, 15.2 19.3"
          stroke="#FDBA74"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.75"
        />
      </g>

      {/* Upper Main Claw (Propodus + Fixed Tip at 4,4) */}
      <g
        data-testid="crab-claw-upper-jaw"
        style={{
          transformOrigin: '20px 20px',
          transform: upperRotate,
          transition: transitionStyle,
        }}
      >
        <path
          d="M4 4 C10.5 2.5, 19.5 4.8, 24.5 12 C27.2 16, 26.5 22, 22 24.8 C19 26.2, 16 24.2, 15.2 20.5 C14.2 16.2, 11.2 11.2, 4 4 Z"
          fill="#CE412B"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinejoin="round"
          style={{ paintOrder: 'stroke fill' }}
        />
        <path
          d="M11.5 6.8 C15.5 6.8, 19.5 8.8, 22.2 12.6"
          stroke="#FED7AA"
          strokeWidth="1.7"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
        <circle cx="18.5" cy="19.8" r="1.6" fill="#7C2012" stroke="#FDBA74" strokeWidth="0.8" />
      </g>

      {/* Snap Sparks on Click */}
      {pressed && (
        <g
          data-testid="crab-claw-snap-sparks"
          stroke="#F59E0B"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <line x1="1.5" y1="7" x2="3.2" y2="6.2" />
          <line x1="6.5" y1="1.5" x2="5.8" y2="3.2" />
          <line x1="1.8" y1="2.2" x2="3.2" y2="3.4" />
        </g>
      )}
    </g>
  );
};

const CrabPointerGraphic: React.FC<CrabClawGraphicProps> = ({ pressed, reducedMotion }) => {
  const rightPincerRotate = pressed ? 'rotate(-34deg)' : 'rotate(0deg)';
  const transitionStyle = reducedMotion
    ? 'none'
    : 'transform 140ms cubic-bezier(0.34, 1.56, 0.64, 1)';

  return (
    <g data-testid="cursor-shape-pointer">
      {/* Vertical Crab Forearm Cuff */}
      <path
        d="M16.5 30.5 H25.5 L26.5 36.2 C23.2 37.8, 18.8 37.8, 15.5 36.2 Z"
        fill="#B33621"
        stroke="#FFFFFF"
        strokeWidth="2.8"
        strokeLinejoin="round"
        style={{ paintOrder: 'stroke fill' }}
      />

      {/* Right Movable Pincer (Dactylus) — opens upright, clamps shut on click */}
      <g
        data-testid="crab-pointer-right-jaw"
        style={{
          transformOrigin: '22.5px 23px',
          transform: rightPincerRotate,
          transition: transitionStyle,
        }}
      >
        <path
          d="M22.5 23 C24.2 18, 26.8 13, 29.5 8.5 C32.5 14, 30.8 21.5, 24.8 24.2 C23.2 24.8, 21.8 24.2, 22.5 23 Z"
          fill="#DC4A33"
          stroke="#FFFFFF"
          strokeWidth="2.8"
          strokeLinejoin="round"
          style={{ paintOrder: 'stroke fill' }}
        />
        <path
          d="M28.6 12.2 C29.5 15.8, 28.2 19.6, 25.4 22.2"
          stroke="#FDBA74"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.78"
        />
      </g>

      {/* Main Upright Crab Claw (Propodus + Fixed Vertical Tip at 17,5) */}
      <path
        d="M17 5 C18.2 10.5, 19.6 15.8, 21.5 21.5 C24.5 23.5, 26.5 26, 25.8 30.8 L16.2 30.8 C10 26, 12.8 11.5, 17 5 Z"
        fill="#CE412B"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinejoin="round"
        style={{ paintOrder: 'stroke fill' }}
      />

      {/* Glossy Upright Shell Highlight & Joint Rivet */}
      <path
        d="M13.8 24.5 C12.4 19, 13.4 13, 16.2 8.8"
        stroke="#FED7AA"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      <circle cx="22.5" cy="24.5" r="1.6" fill="#7C2012" stroke="#FDBA74" strokeWidth="0.8" />

      {/* Hover Ready Arc or Click Snap Sparks at (17,5) */}
      {pressed ? (
        <g
          data-testid="crab-pointer-snap-sparks"
          stroke="#F59E0B"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <line x1="12.5" y1="3.8" x2="14.4" y2="4.6" />
          <line x1="17" y1="1.2" x2="17" y2="3.2" />
          <line x1="21.5" y1="3.8" x2="19.6" y2="4.6" />
        </g>
      ) : (
        <path
          data-testid="crab-pointer-hover-arc"
          d="M13.4 3.6 A4.4 4.4 0 0 1 20.6 3.6"
          stroke="#F59E0B"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
      )}
    </g>
  );
};

const TEXT_IBEAM_PATHS = [
  'M22 9 L22 35',
  'M16.5 7.5 C18.2 10.5, 20.2 10.5, 22 9.5 C23.8 10.5, 25.8 10.5, 27.5 7.5',
  'M16.5 36.5 C18.2 33.5, 20.2 33.5, 22 34.5 C23.8 33.5, 25.8 33.5, 27.5 36.5',
  'M19.5 22 L24.5 22',
] as const;

const SUN_RAYS: ReadonlyArray<[number, number, number, number]> = [
  [22.5, 8.2, 22.5, 11.2],
  [22.5, 33.8, 22.5, 36.8],
  [8.2, 22.5, 11.2, 22.5],
  [33.8, 22.5, 36.8, 22.5],
  [12.4, 12.4, 14.5, 14.5],
  [32.6, 12.4, 30.5, 14.5],
  [14.5, 30.5, 12.4, 32.6],
  [32.6, 32.6, 30.5, 30.5],
];

const CrabTextGraphic: React.FC = () => (
  <g data-testid="cursor-shape-text" fill="none" strokeLinecap="round" strokeLinejoin="round">
    {[
      { stroke: '#FFFFFF', strokeWidth: 4.2 },
      { stroke: '#CE412B', strokeWidth: 2 },
    ].map((layer) => (
      <g key={layer.stroke} stroke={layer.stroke} strokeWidth={layer.strokeWidth}>
        {TEXT_IBEAM_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    ))}
  </g>
);

const LanguageCursorGraphic: React.FC<{ variant: CursorVariant }> = ({ variant }) => {
  const fillColor = LANGUAGE_FILL_COLORS[variant] || LANGUAGE_FILL_COLORS.cycle;

  return (
    <g data-testid={`cursor-shape-language-${variant}`}>
      {/* Pointed Speech-Bubble Medallion with tip at (4,4) */}
      <path
        d="M4 4 L16.2 11.3 A13.5 13.5 0 1 1 11.3 16.2 Z"
        fill={fillColor}
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinejoin="round"
        style={{ paintOrder: 'stroke fill' }}
      />
      <circle
        cx="23"
        cy="23"
        r="11.2"
        stroke="#FFFFFF"
        strokeOpacity="0.28"
        strokeWidth="1"
        fill="none"
      />

      {/* Crisp Vector Language Emblems (no DOM text nodes to keep a11y/tests clean) */}
      {variant === 'zh' ? (
        <g
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <path d="M17.5 19.2 H28.5 V25.4 H17.5 Z" />
          <path d="M23 15.6 V30.4" />
        </g>
      ) : variant === 'en' ? (
        <g
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <path d="M19.6 18.5 H15.8 V27.5 H19.6 M15.8 23 H18.9" />
          <path d="M22.6 27.5 V18.5 L28.4 27.5 V18.5" />
        </g>
      ) : variant === 'ja' ? (
        <g
          stroke="#FFFFFF"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <path d="M18 18.6 Q22.5 18 26.5 17.8" />
          <path d="M21.8 15.6 C21.3 19.6, 21.3 24, 22.2 28.4" />
          <path d="M25.8 20.6 C24.5 25.5, 19.6 28.4, 17.4 26.8 C15.8 25.2, 18.6 21.4, 23.8 21.6 C27.6 21.9, 28.2 26.4, 24.5 28.7" />
        </g>
      ) : (
        <g
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <circle cx="23" cy="23" r="8" />
          <ellipse cx="23" cy="23" rx="3.8" ry="8" />
          <path d="M15 23 H31" />
          <path d="M16.5 18.8 Q23 20.6 29.5 18.8" />
          <path d="M16.5 27.2 Q23 25.4 29.5 27.2" />
        </g>
      )}
    </g>
  );
};

interface ThemeCursorGraphicProps {
  variant: CursorVariant;
  resolvedTheme: 'light' | 'dark';
  reducedMotion: boolean;
}

const ThemeCursorGraphic: React.FC<ThemeCursorGraphicProps> = ({
  variant,
  resolvedTheme,
  reducedMotion,
}) => {
  const effectiveVariant =
    variant === 'light' || variant === 'dark' || variant === 'system'
      ? variant
      : resolvedTheme;

  if (effectiveVariant === 'light') {
    return (
      <g data-testid="cursor-shape-theme-light">
        {/* Sharp Pointer Ray at (4,4) */}
        <path
          d="M4 4 L15.2 10.6 L10.6 15.2 Z"
          fill="#F59E0B"
          stroke="#FFFFFF"
          strokeWidth="2.8"
          strokeLinejoin="round"
          style={{ paintOrder: 'stroke fill' }}
        />

        {/* Rotating Outer Sunburst Rays */}
        <g
          className={reducedMotion ? undefined : 'crab-cursor-spin'}
          style={{ transformOrigin: '22.5px 22.5px' }}
          strokeLinecap="round"
        >
          {[
            { stroke: '#FFFFFF', strokeWidth: 4 },
            { stroke: '#F59E0B', strokeWidth: 2.2 },
          ].map((layer) => (
            <g key={layer.stroke} stroke={layer.stroke} strokeWidth={layer.strokeWidth}>
              {SUN_RAYS.map(([x1, y1, x2, y2], idx) => (
                <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2} />
              ))}
            </g>
          ))}
        </g>

        {/* White Sticker Halo + Radiant Sun Core */}
        <circle cx="22.5" cy="22.5" r="9.4" fill="#FFFFFF" />
        <circle cx="22.5" cy="22.5" r="7.8" fill="#FACC15" stroke="#D97706" strokeWidth="1.5" />
        <path
          d="M18.6 20.5 A4.4 4.4 0 0 1 22.5 18"
          stroke="#FEF9C3"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    );
  }

  if (effectiveVariant === 'dark') {
    return (
      <g data-testid="cursor-shape-theme-dark">
        {/* Pointed Night-Sky Medallion */}
        <path
          d="M4 4 L16.2 11.3 A13.5 13.5 0 1 1 11.3 16.2 Z"
          fill="#312E81"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinejoin="round"
          style={{ paintOrder: 'stroke fill' }}
        />
        <circle
          cx="23"
          cy="23"
          r="11.2"
          stroke="#818CF8"
          strokeOpacity="0.45"
          strokeWidth="1"
          fill="none"
        />

        {/* Luminous Crescent Moon */}
        <path
          d="M25.2 15.6 A7.2 7.2 0 1 0 29.2 27.4 A5.6 5.6 0 1 1 25.2 15.6 Z"
          fill="#FEF08A"
        />

        {/* Twinkling Stars */}
        <path
          d="M28.5 15.6 L29.2 17.5 L31.1 18.2 L29.2 18.9 L28.5 20.8 L27.8 18.9 L25.9 18.2 L27.8 17.5 Z"
          fill="#FFFFFF"
          className={reducedMotion ? undefined : 'crab-cursor-twinkle'}
          style={{ transformOrigin: '28.5px 18.2px' }}
        />
        <circle cx="17.5" cy="28.5" r="1.1" fill="#FDE68A" />
      </g>
    );
  }

  return (
    <g data-testid="cursor-shape-theme-system">
      {/* Pointed Day-Night Eclipse Medallion */}
      <path
        d="M4 4 L16.2 11.3 A13.5 13.5 0 1 1 11.3 16.2 Z"
        fill="#1E293B"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinejoin="round"
        style={{ paintOrder: 'stroke fill' }}
      />
      {/* Top-Left Sunlit Half */}
      <path d="M14.9 31.1 A11.5 11.5 0 0 1 31.1 14.9 Z" fill="#F59E0B" />
      <circle cx="19.6" cy="19.6" r="3" fill="#FEF08A" />

      {/* Bottom-Right Starry Night Half */}
      <path d="M31.1 14.9 A11.5 11.5 0 0 1 14.9 31.1 Z" fill="#312E81" />
      <path
        d="M27.2 22.8 A3.4 3.4 0 1 0 29 28.4 A2.6 2.6 0 1 1 27.2 22.8 Z"
        fill="#FEF08A"
      />
      <circle cx="29.4" cy="23.2" r="0.9" fill="#FFFFFF" />

      {/* Crisp Diagonal Horizon */}
      <line x1="15.2" y1="30.8" x2="30.8" y2="15.2" stroke="#FFFFFF" strokeWidth="1.5" />
    </g>
  );
};

export const CrabCursor: React.FC = () => {
  const { resolvedTheme } = useTheme();

  const cursorRef = useRef<HTMLDivElement>(null);
  const posRef = useRef<{ x: number; y: number }>({ x: -100, y: -100 });
  const lastTouchTimeRef = useRef<number>(0);

  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [cursorState, setCursorState] = useState<ResolvedCursorState>({
    mode: 'claw',
    variant: 'default',
  });
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  });

  const visibleRef = useRef(visible);
  const stateRef = useRef(cursorState);
  visibleRef.current = visible;
  stateRef.current = cursorState;

  // Listen to prefers-reduced-motion changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    setReducedMotion(mql.matches);
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, []);

  // Synchronize global html[data-crab-cursor="active"] attribute
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (visible) {
      document.documentElement.dataset.crabCursor = 'active';
    } else {
      delete document.documentElement.dataset.crabCursor;
    }
    return () => {
      delete document.documentElement.dataset.crabCursor;
    };
  }, [visible]);

  // Keep transform synced when hotspot changes (e.g., pointer <-> text)
  useLayoutEffect(() => {
    if (!cursorRef.current || !visible) return;
    const hotspot = getCursorHotspot(cursorState.mode);
    cursorRef.current.style.transform = `translate3d(${posRef.current.x - hotspot.x}px, ${
      posRef.current.y - hotspot.y
    }px, 0)`;
  }, [cursorState.mode, visible]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const syncResolvedState = (target: EventTarget | null): ResolvedCursorState => {
      const next = resolveCursorState(target);
      if (
        next.mode !== stateRef.current.mode ||
        next.variant !== stateRef.current.variant
      ) {
        stateRef.current = next;
        setCursorState(next);
      }
      return next;
    };

    const hideCursor = (markTouch = false) => {
      if (markTouch) {
        lastTouchTimeRef.current = Date.now();
      }
      setPressed(false);
      if (visibleRef.current) {
        visibleRef.current = false;
        setVisible(false);
      }
    };

    const isAllowedPointer = (e: MouseEvent | PointerEvent): boolean => {
      if ('pointerType' in e) {
        if (e.pointerType === 'touch') {
          hideCursor(true);
          return false;
        }
        if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') {
          return false;
        }
      }
      return Date.now() - lastTouchTimeRef.current >= 800;
    };

    const applyMove = (clientX: number, clientY: number, target: EventTarget | null) => {
      if (isCoarseOnlyDevice()) return;

      const next = syncResolvedState(target);
      posRef.current = { x: clientX, y: clientY };

      if (cursorRef.current) {
        const hotspot = getCursorHotspot(next.mode);
        cursorRef.current.style.transform = `translate3d(${clientX - hotspot.x}px, ${
          clientY - hotspot.y
        }px, 0)`;
      }

      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
      }
    };

    const handleMove = (e: MouseEvent | PointerEvent) => {
      if (!isAllowedPointer(e)) return;
      applyMove(e.clientX, e.clientY, e.target);
    };

    const handleOver = (e: MouseEvent | PointerEvent) => {
      if (!isAllowedPointer(e) || !visibleRef.current) return;
      syncResolvedState(e.target);
    };

    const handleDown = (e: MouseEvent | PointerEvent) => {
      if (!isAllowedPointer(e)) return;
      setPressed(true);
      applyMove(e.clientX, e.clientY, e.target);
    };

    const handleRelease = () => {
      setPressed(false);
    };

    const handleTouchStart = () => {
      hideCursor(true);
    };

    const handleLeave = () => {
      hideCursor(false);
    };

    const handleScroll = () => {
      if (!visibleRef.current || typeof document.elementFromPoint !== 'function') return;
      try {
        const el = document.elementFromPoint(posRef.current.x, posRef.current.y);
        if (el) syncResolvedState(el);
      } catch {
        // Ignore out-of-viewport elementFromPoint failures
      }
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('pointerover', handleOver, { passive: true });
    window.addEventListener('mouseover', handleOver, { passive: true });
    window.addEventListener('pointerdown', handleDown, { passive: true });
    window.addEventListener('mousedown', handleDown, { passive: true });
    window.addEventListener('pointerup', handleRelease, { passive: true });
    window.addEventListener('mouseup', handleRelease, { passive: true });
    window.addEventListener('pointercancel', handleRelease, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('blur', handleLeave);
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    document.documentElement.addEventListener('mouseleave', handleLeave);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('pointerover', handleOver);
      window.removeEventListener('mouseover', handleOver);
      window.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('pointerup', handleRelease);
      window.removeEventListener('mouseup', handleRelease);
      window.removeEventListener('pointercancel', handleRelease);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('blur', handleLeave);
      window.removeEventListener('scroll', handleScroll, true);
      document.documentElement.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  const hotspot = getCursorHotspot(cursorState.mode);
  const morphKey = `${cursorState.mode}-${cursorState.variant}`;
  const pressScale = pressed ? 'scale(0.88)' : 'scale(1)';
  const origin = `${hotspot.x}px ${hotspot.y}px`;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      data-testid="crab-cursor"
      data-visible={visible ? 'true' : 'false'}
      data-cursor-mode={cursorState.mode}
      data-cursor-variant={cursorState.variant}
      data-cursor-pressed={pressed ? 'true' : 'false'}
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
      className="pointer-events-none fixed left-0 top-0 z-[9999] select-none will-change-transform"
      style={{
        opacity: visible ? 1 : 0,
        transform: 'translate3d(-100px, -100px, 0)',
        transition: reducedMotion ? 'none' : 'opacity 120ms ease-out',
      }}
    >
      <div
        style={{
          transform: pressScale,
          transformOrigin: origin,
          transition: reducedMotion
            ? 'none'
            : 'transform 110ms cubic-bezier(0.22, 1, 0.36, 1)',
          filter: 'drop-shadow(0 2px 5px rgba(15, 23, 42, 0.28))',
        }}
      >
        <svg
          key={morphKey}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 44 44"
          width="44"
          height="44"
          fill="none"
          className={
            reducedMotion
              ? 'block overflow-visible'
              : 'block overflow-visible crab-cursor-morph'
          }
          style={{
            transformOrigin: origin,
          }}
        >
          {cursorState.mode === 'claw' && (
            <CrabClawGraphic pressed={pressed} reducedMotion={reducedMotion} />
          )}
          {cursorState.mode === 'pointer' && (
            <CrabPointerGraphic pressed={pressed} reducedMotion={reducedMotion} />
          )}
          {cursorState.mode === 'text' && <CrabTextGraphic />}
          {cursorState.mode === 'language' && (
            <LanguageCursorGraphic variant={cursorState.variant} />
          )}
          {cursorState.mode === 'theme' && (
            <ThemeCursorGraphic
              variant={cursorState.variant}
              resolvedTheme={resolvedTheme}
              reducedMotion={reducedMotion}
            />
          )}
        </svg>
      </div>
    </div>
  );
};

export default CrabCursor;
