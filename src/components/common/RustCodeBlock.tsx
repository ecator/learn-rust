import React, { useMemo } from 'react';
import {
  RUST_TOKEN_CLASSES_ADAPTIVE,
  RUST_TOKEN_CLASSES_DARK,
  RustToken,
  splitTokensByLine,
  tokenizeRust,
} from '@/lib/syntax/rustHighlighter';
import { cn } from '@/lib/utils';

export type CodeThemeVariant = 'dark' | 'adaptive';

export interface HighlightedRustCodeProps {
  code: string;
  theme?: CodeThemeVariant;
}

function renderTokens(
  tokens: RustToken[],
  palette: Record<RustToken['type'], string>,
  keyPrefix = ''
): React.ReactNode {
  return tokens.map((token, idx) => {
    const tokenClass = palette[token.type];
    const key = keyPrefix ? `${keyPrefix}-${idx}` : idx;
    if (!tokenClass) {
      return <React.Fragment key={key}>{token.value}</React.Fragment>;
    }
    return (
      <span key={key} className={tokenClass} data-token-type={token.type}>
        {token.value}
      </span>
    );
  });
}

/**
 * Renders inline syntax-highlighted Rust tokens without a surrounding <pre> container.
 */
export const HighlightedRustCode: React.FC<HighlightedRustCodeProps> = ({
  code,
  theme = 'dark',
}) => {
  const tokens = useMemo(() => tokenizeRust(code), [code]);
  const palette = theme === 'adaptive' ? RUST_TOKEN_CLASSES_ADAPTIVE : RUST_TOKEN_CLASSES_DARK;

  return <>{renderTokens(tokens, palette)}</>;
};

export interface RustCodeBlockProps {
  code: string;
  showLineNumbers?: boolean;
  variant?: 'default' | 'pitfall';
  theme?: CodeThemeVariant;
  preClassName?: string;
  codeClassName?: string;
}

/**
 * Renders a syntax-highlighted Rust code block inside semantic <pre><code> elements
 * with optional non-selectable line numbers.
 */
export const RustCodeBlock: React.FC<RustCodeBlockProps> = ({
  code,
  showLineNumbers = true,
  variant = 'default',
  theme = 'dark',
  preClassName,
  codeClassName,
}) => {
  const lines = useMemo(() => splitTokensByLine(tokenizeRust(code)), [code]);
  const palette = theme === 'adaptive' ? RUST_TOKEN_CLASSES_ADAPTIVE : RUST_TOKEN_CLASSES_DARK;

  return (
    <pre
      data-testid={variant === 'pitfall' ? 'rust-pitfall-code' : 'rust-code-block'}
      className={cn(
        'flex overflow-x-auto font-mono',
        variant === 'pitfall'
          ? 'rounded-xl border border-red-900/40 bg-slate-950 py-3.5 text-xs leading-5 text-slate-200'
          : 'py-4 sm:py-5 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-200',
        preClassName
      )}
    >
      {showLineNumbers && (
        <span
          aria-hidden="true"
          className={cn(
            'sticky left-0 z-10 flex shrink-0 select-none flex-col border-r pr-3 mr-3 text-right bg-slate-950',
            variant === 'pitfall'
              ? 'border-red-900/30 pl-3.5 text-red-400/50'
              : 'border-slate-800/80 pl-4 sm:pl-6 text-slate-500'
          )}
        >
          {lines.map((_, lineIdx) => (
            <span key={lineIdx}>{lineIdx + 1}</span>
          ))}
        </span>
      )}
      <code
        className={cn(
          'block flex-1 min-w-max',
          variant === 'pitfall' ? 'pr-3.5' : 'pr-4 sm:pr-6',
          !showLineNumbers && (variant === 'pitfall' ? 'pl-3.5' : 'pl-4 sm:pl-6'),
          codeClassName
        )}
      >
        {lines.map((lineTokens, lineIdx) => (
          <React.Fragment key={lineIdx}>
            {renderTokens(lineTokens, palette, `l${lineIdx}`)}
            {lineIdx < lines.length - 1 ? '\n' : null}
          </React.Fragment>
        ))}
      </code>
    </pre>
  );
};

export default RustCodeBlock;
