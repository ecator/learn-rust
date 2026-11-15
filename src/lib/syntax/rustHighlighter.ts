export type RustTokenType =
  | 'comment'
  | 'docComment'
  | 'attribute'
  | 'string'
  | 'char'
  | 'lifetime'
  | 'keyword'
  | 'controlKeyword'
  | 'selfKeyword'
  | 'boolean'
  | 'macro'
  | 'primitive'
  | 'type'
  | 'constant'
  | 'function'
  | 'number'
  | 'operator'
  | 'punctuation'
  | 'identifier'
  | 'plain';

export interface RustToken {
  type: RustTokenType;
  value: string;
}

const CONTROL_KEYWORDS = new Set([
  'if',
  'else',
  'match',
  'for',
  'while',
  'loop',
  'return',
  'break',
  'continue',
  'in',
  'await',
  'async',
  'yield',
]);

const KEYWORDS = new Set([
  'fn',
  'let',
  'mut',
  'const',
  'static',
  'struct',
  'enum',
  'trait',
  'impl',
  'type',
  'use',
  'mod',
  'pub',
  'crate',
  'super',
  'as',
  'where',
  'move',
  'dyn',
  'ref',
  'unsafe',
  'extern',
  'macro_rules',
]);

const PRIMITIVE_TYPES = new Set([
  'i8',
  'i16',
  'i32',
  'i64',
  'i128',
  'isize',
  'u8',
  'u16',
  'u32',
  'u64',
  'u128',
  'usize',
  'f32',
  'f64',
  'bool',
  'char',
  'str',
]);

const PRELUDE_TYPES = new Set([
  'String',
  'Vec',
  'Option',
  'Result',
  'Some',
  'None',
  'Ok',
  'Err',
  'Box',
  'Rc',
  'Arc',
  'RefCell',
  'Cell',
  'Mutex',
  'MutexGuard',
  'RwLock',
  'Send',
  'Sync',
  'Copy',
  'Clone',
  'Debug',
  'Display',
  'Drop',
  'From',
  'Into',
  'Sized',
  'PhantomData',
  'Pin',
  'Future',
  'Error',
  'Ordering',
]);

const NUMERIC_SUFFIXES = [
  'isize',
  'usize',
  'i128',
  'u128',
  'i64',
  'u64',
  'f64',
  'i32',
  'u32',
  'f32',
  'i16',
  'u16',
  'i8',
  'u8',
];

const THREE_CHAR_OPERATORS = new Set(['..=', '<<=', '>>=']);
const TWO_CHAR_OPERATORS = new Set([
  '..',
  '->',
  '=>',
  '::',
  '==',
  '!=',
  '<=',
  '>=',
  '&&',
  '||',
  '+=',
  '-=',
  '*=',
  '/=',
  '%=',
  '&=',
  '|=',
  '^=',
  '<<',
  '>>',
]);
const ONE_CHAR_OPERATORS = new Set([
  '+',
  '-',
  '*',
  '/',
  '%',
  '=',
  '!',
  '<',
  '>',
  '&',
  '|',
  '^',
  '?',
  '~',
]);
const PUNCTUATION_CHARS = new Set(['{', '}', '(', ')', '[', ']', ';', ':', ',', '.', '@', '#', '$']);

function isAsciiDigit(ch: string | undefined): boolean {
  return ch !== undefined && ch >= '0' && ch <= '9';
}

function isHexDigit(ch: string | undefined): boolean {
  return (
    ch !== undefined &&
    ((ch >= '0' && ch <= '9') || (ch >= 'a' && ch <= 'f') || (ch >= 'A' && ch <= 'F'))
  );
}

function isIdentStart(ch: string | undefined): boolean {
  return (
    ch !== undefined &&
    ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_')
  );
}

function isIdentChar(ch: string | undefined): boolean {
  return isIdentStart(ch) || isAsciiDigit(ch);
}

function isWhitespace(ch: string | undefined): boolean {
  return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r' || ch === '\f' || ch === '\v';
}

function scanQuotedString(code: string, quoteStartIndex: number): number {
  const len = code.length;
  let j = quoteStartIndex + 1;
  while (j < len) {
    const c = code[j];
    if (c === '\\') {
      j += 2;
      continue;
    }
    if (c === '"') {
      return j + 1;
    }
    j++;
  }
  return len;
}

function matchRawString(code: string, start: number): number | null {
  const len = code.length;
  let j = start;
  const ch = code[j];
  if (ch === 'b' || ch === 'c') {
    if (code[j + 1] !== 'r') return null;
    j += 2;
  } else if (ch === 'r') {
    if (code[j + 1] === 'b') {
      j += 2;
    } else {
      j += 1;
    }
  } else {
    return null;
  }

  let hashes = 0;
  while (j < len && code[j] === '#') {
    hashes++;
    j++;
  }

  if (code[j] !== '"') return null;
  j++;

  const closing = '"' + '#'.repeat(hashes);
  const closeIdx = code.indexOf(closing, j);
  if (closeIdx === -1) return len;
  return closeIdx + closing.length;
}

function matchCharLiteral(code: string, quoteIndex: number): number | null {
  const len = code.length;
  if (code[quoteIndex] !== "'") return null;

  const next = code[quoteIndex + 1];
  if (next === undefined || next === '\n' || next === '\r') return null;

  if (next === '\\') {
    let j = quoteIndex + 2;
    if (j >= len) return null;
    j++; // skip escaped char
    let steps = 0;
    while (j < len && steps < 12 && code[j] !== '\n' && code[j] !== '\r') {
      if (code[j] === "'") {
        return j + 1;
      }
      j++;
      steps++;
    }
    return null;
  }

  const cp = code.codePointAt(quoteIndex + 1);
  if (cp === undefined || cp === 0x27 /* ' */ || cp === 0x0a || cp === 0x0d) {
    return null;
  }
  const cpLen = cp > 0xffff ? 2 : 1;
  if (code[quoteIndex + 1 + cpLen] === "'") {
    return quoteIndex + 2 + cpLen;
  }

  return null;
}

function matchAttribute(code: string, start: number): number | null {
  const len = code.length;
  if (code[start] !== '#') return null;

  let j = start + 1;
  if (code[j] === '!') j++;
  while (j < len && (code[j] === ' ' || code[j] === '\t')) j++;
  if (code[j] !== '[') return null;

  let depth = 0;
  while (j < len) {
    const c = code[j];
    if (c === '"') {
      j = scanQuotedString(code, j);
      continue;
    }
    if (c === '[') {
      depth++;
    } else if (c === ']') {
      depth--;
      if (depth === 0) {
        return j + 1;
      }
    }
    j++;
  }

  return null;
}

function consumeNumericSuffix(code: string, index: number): number {
  for (const suffix of NUMERIC_SUFFIXES) {
    if (code.startsWith(suffix, index)) {
      const after = code[index + suffix.length];
      if (!isIdentChar(after)) {
        return index + suffix.length;
      }
    }
  }
  return index;
}

/**
 * Tokenizes Rust source code into syntax-highlighted lexical tokens.
 * Operates synchronously with zero external runtime dependencies and produces
 * lossless tokens (concatenating all token values reproduces the exact input).
 */
export function tokenizeRust(code: string): RustToken[] {
  if (!code) return [];

  const tokens: RustToken[] = [];
  const len = code.length;
  let i = 0;
  const prevSignificant: { token: RustToken | null } = { token: null };

  const pushToken = (type: RustTokenType, value: string) => {
    const token: RustToken = { type, value };
    tokens.push(token);
    if (type !== 'plain' && type !== 'comment' && type !== 'docComment') {
      prevSignificant.token = token;
    }
  };

  while (i < len) {
    const ch = code[i];

    // 1. Whitespace
    if (isWhitespace(ch)) {
      let j = i + 1;
      while (j < len && isWhitespace(code[j])) j++;
      pushToken('plain', code.slice(i, j));
      i = j;
      continue;
    }

    // 2. Line comments & doc comments
    if (ch === '/' && code[i + 1] === '/') {
      const isDoc =
        (code.startsWith('///', i) && code[i + 3] !== '/') || code.startsWith('//!', i);
      let j = i + 2;
      while (j < len && code[j] !== '\n' && code[j] !== '\r') j++;
      pushToken(isDoc ? 'docComment' : 'comment', code.slice(i, j));
      i = j;
      continue;
    }

    // 3. Block comments (nested) & doc block comments
    if (ch === '/' && code[i + 1] === '*') {
      const isDoc =
        (code.startsWith('/**', i) && code[i + 3] !== '*' && code[i + 3] !== '/') ||
        code.startsWith('/*!', i);
      let depth = 1;
      let j = i + 2;
      while (j < len && depth > 0) {
        if (code[j] === '/' && code[j + 1] === '*') {
          depth++;
          j += 2;
        } else if (code[j] === '*' && code[j + 1] === '/') {
          depth--;
          j += 2;
        } else {
          j++;
        }
      }
      pushToken(isDoc ? 'docComment' : 'comment', code.slice(i, j));
      i = j;
      continue;
    }

    // 4. Attributes (#[...] / #![...])
    if (ch === '#') {
      const attrEnd = matchAttribute(code, i);
      if (attrEnd !== null) {
        pushToken('attribute', code.slice(i, attrEnd));
        i = attrEnd;
        continue;
      }
    }

    // 5. Raw strings (r"...", r#"..."#, br#"..."#, cr#"..."#)
    if (ch === 'r' || ch === 'b' || ch === 'c') {
      const rawEnd = matchRawString(code, i);
      if (rawEnd !== null) {
        pushToken('string', code.slice(i, rawEnd));
        i = rawEnd;
        continue;
      }
      if ((ch === 'b' || ch === 'c') && code[i + 1] === '"') {
        const strEnd = scanQuotedString(code, i + 1);
        pushToken('string', code.slice(i, strEnd));
        i = strEnd;
        continue;
      }
      if (ch === 'b' && code[i + 1] === "'") {
        const charEnd = matchCharLiteral(code, i + 1);
        if (charEnd !== null) {
          pushToken('char', code.slice(i, charEnd));
          i = charEnd;
          continue;
        }
      }
    }

    // 6. Standard double-quoted strings
    if (ch === '"') {
      const strEnd = scanQuotedString(code, i);
      pushToken('string', code.slice(i, strEnd));
      i = strEnd;
      continue;
    }

    // 7. Char literals vs lifetimes ('a, 'static, '_)
    if (ch === "'") {
      const charEnd = matchCharLiteral(code, i);
      if (charEnd !== null) {
        pushToken('char', code.slice(i, charEnd));
        i = charEnd;
        continue;
      }
      if (isIdentStart(code[i + 1])) {
        let j = i + 2;
        while (j < len && isIdentChar(code[j])) j++;
        pushToken('lifetime', code.slice(i, j));
        i = j;
        continue;
      }
      pushToken('punctuation', "'");
      i++;
      continue;
    }

    // 8. Numeric literals (hex, binary, octal, decimal, float)
    if (isAsciiDigit(ch)) {
      let j = i;
      if (ch === '0' && (code[i + 1] === 'x' || code[i + 1] === 'X')) {
        j += 2;
        while (j < len && (isHexDigit(code[j]) || code[j] === '_')) j++;
        j = consumeNumericSuffix(code, j);
      } else if (ch === '0' && (code[i + 1] === 'b' || code[i + 1] === 'B')) {
        j += 2;
        while (j < len && (code[j] === '0' || code[j] === '1' || code[j] === '_')) j++;
        j = consumeNumericSuffix(code, j);
      } else if (ch === '0' && (code[i + 1] === 'o' || code[i + 1] === 'O')) {
        j += 2;
        while (j < len && ((code[j] >= '0' && code[j] <= '7') || code[j] === '_')) j++;
        j = consumeNumericSuffix(code, j);
      } else {
        while (j < len && (isAsciiDigit(code[j]) || code[j] === '_')) j++;
        // Only treat '.' as decimal point when followed by a digit (preserve 0..3 range syntax)
        if (code[j] === '.' && isAsciiDigit(code[j + 1])) {
          j++;
          while (j < len && (isAsciiDigit(code[j]) || code[j] === '_')) j++;
        }
        if (
          (code[j] === 'e' || code[j] === 'E') &&
          (isAsciiDigit(code[j + 1]) ||
            ((code[j + 1] === '+' || code[j + 1] === '-') && isAsciiDigit(code[j + 2])))
        ) {
          j++;
          if (code[j] === '+' || code[j] === '-') j++;
          while (j < len && (isAsciiDigit(code[j]) || code[j] === '_')) j++;
        }
        j = consumeNumericSuffix(code, j);
      }
      pushToken('number', code.slice(i, j));
      i = j;
      continue;
    }

    // 9. Raw identifiers (r#ident)
    if (ch === 'r' && code[i + 1] === '#' && isIdentStart(code[i + 2])) {
      let j = i + 3;
      while (j < len && isIdentChar(code[j])) j++;
      pushToken('identifier', code.slice(i, j));
      i = j;
      continue;
    }

    // 10. Identifiers, keywords, macros, types, functions
    if (isIdentStart(ch)) {
      let j = i + 1;
      while (j < len && isIdentChar(code[j])) j++;
      const word = code.slice(i, j);

      // Macro invocation (ident! where ! is not !=)
      if (code[j] === '!' && code[j + 1] !== '=') {
        pushToken('macro', code.slice(i, j + 1));
        i = j + 1;
        continue;
      }

      let tokenType: RustTokenType;
      if (word === 'true' || word === 'false') {
        tokenType = 'boolean';
      } else if (word === 'self') {
        tokenType = 'selfKeyword';
      } else if (word === 'Self') {
        tokenType = 'type';
      } else if (CONTROL_KEYWORDS.has(word)) {
        tokenType = 'controlKeyword';
      } else if (KEYWORDS.has(word)) {
        tokenType = 'keyword';
      } else if (PRIMITIVE_TYPES.has(word)) {
        tokenType = 'primitive';
      } else if (prevSignificant.token?.type === 'keyword' && prevSignificant.token.value === 'fn') {
        tokenType = 'function';
      } else if (PRELUDE_TYPES.has(word)) {
        tokenType = 'type';
      } else if (/^[A-Z][A-Z0-9_]+$/.test(word)) {
        tokenType = 'constant';
      } else if (word[0] >= 'A' && word[0] <= 'Z') {
        tokenType = 'type';
      } else {
        let peek = j;
        while (peek < len && (code[peek] === ' ' || code[peek] === '\t')) peek++;
        if (code[peek] === '(' || code.startsWith('::<', peek)) {
          tokenType = 'function';
        } else {
          tokenType = 'identifier';
        }
      }

      pushToken(tokenType, word);
      i = j;
      continue;
    }

    // 11. Operators (3-char, 2-char, 1-char)
    const threeChar = code.slice(i, i + 3);
    if (THREE_CHAR_OPERATORS.has(threeChar)) {
      pushToken('operator', threeChar);
      i += 3;
      continue;
    }

    const twoChar = code.slice(i, i + 2);
    if (TWO_CHAR_OPERATORS.has(twoChar)) {
      pushToken('operator', twoChar);
      i += 2;
      continue;
    }

    if (ONE_CHAR_OPERATORS.has(ch)) {
      pushToken('operator', ch);
      i++;
      continue;
    }

    // 12. Punctuation
    if (PUNCTUATION_CHARS.has(ch)) {
      pushToken('punctuation', ch);
      i++;
      continue;
    }

    // 13. Fallback
    pushToken('plain', ch);
    i++;
  }

  return tokens;
}

/**
 * Splits a token stream into per-line token arrays by breaking tokens
 * across newline boundaries (`\n` / `\r\n`).
 */
export function splitTokensByLine(tokens: RustToken[]): RustToken[][] {
  const lines: RustToken[][] = [[]];

  for (const token of tokens) {
    if (!token.value.includes('\n')) {
      lines[lines.length - 1].push(token);
      continue;
    }

    const parts = token.value.split(/\r?\n/);
    for (let idx = 0; idx < parts.length; idx++) {
      if (idx > 0) {
        lines.push([]);
      }
      const part = parts[idx];
      if (part.length > 0) {
        lines[lines.length - 1].push({ type: token.type, value: part });
      }
    }
  }

  return lines;
}

export const RUST_TOKEN_CLASSES_DARK: Record<RustTokenType, string> = {
  comment: 'text-slate-400 italic',
  docComment: 'text-slate-300 italic',
  attribute: 'text-teal-300',
  string: 'text-emerald-400',
  char: 'text-emerald-300',
  lifetime: 'text-rose-400 italic',
  keyword: 'text-purple-400',
  controlKeyword: 'text-fuchsia-400',
  selfKeyword: 'text-rose-400 italic',
  boolean: 'text-orange-400',
  macro: 'text-cyan-400',
  primitive: 'text-amber-300',
  type: 'text-amber-300',
  constant: 'text-orange-300',
  function: 'text-sky-400',
  number: 'text-orange-400',
  operator: 'text-sky-300',
  punctuation: 'text-slate-400',
  identifier: 'text-slate-100',
  plain: '',
};

export const RUST_TOKEN_CLASSES_ADAPTIVE: Record<RustTokenType, string> = {
  comment: 'text-slate-500 dark:text-slate-400 italic',
  docComment: 'text-slate-600 dark:text-slate-300 italic',
  attribute: 'text-teal-700 dark:text-teal-300',
  string: 'text-emerald-700 dark:text-emerald-400',
  char: 'text-emerald-700 dark:text-emerald-300',
  lifetime: 'text-rose-600 dark:text-rose-400 italic',
  keyword: 'text-purple-700 dark:text-purple-400',
  controlKeyword: 'text-fuchsia-700 dark:text-fuchsia-400',
  selfKeyword: 'text-rose-600 dark:text-rose-400 italic',
  boolean: 'text-orange-700 dark:text-orange-400',
  macro: 'text-cyan-700 dark:text-cyan-400',
  primitive: 'text-amber-700 dark:text-amber-300',
  type: 'text-amber-700 dark:text-amber-300',
  constant: 'text-orange-700 dark:text-orange-300',
  function: 'text-sky-700 dark:text-sky-400',
  number: 'text-orange-700 dark:text-orange-400',
  operator: 'text-sky-700 dark:text-sky-300',
  punctuation: 'text-slate-500 dark:text-slate-400',
  identifier: 'text-slate-800 dark:text-slate-100',
  plain: '',
};
