import { describe, it, expect } from 'vitest';
import { tokenizeRust, splitTokensByLine } from '@/lib/syntax/rustHighlighter';
import { curriculumLessons } from '@/lib/i18n/curriculumData';

describe('rustHighlighter', () => {
  it('returns empty array for empty input', () => {
    expect(tokenizeRust('')).toEqual([]);
  });

  it('losslessly tokenizes all curriculum code snippets and pitfall badCode across zh/en/ja', () => {
    for (const lesson of curriculumLessons) {
      for (const lang of ['zh', 'en', 'ja'] as const) {
        const content = lesson.translations[lang];
        const snippetTokens = tokenizeRust(content.codeSnippet);
        expect(snippetTokens.map((t) => t.value).join('')).toBe(content.codeSnippet);
        expect(snippetTokens.some((t) => t.type === 'keyword' || t.type === 'controlKeyword')).toBe(
          true
        );

        if (content.pitfall?.badCode) {
          const badTokens = tokenizeRust(content.pitfall.badCode);
          expect(badTokens.map((t) => t.value).join('')).toBe(content.pitfall.badCode);
        }
      }
    }
  });

  it('distinguishes Rust lifetimes from character literals including escapes and emoji', () => {
    const code = `fn longest<'a, 'b>(x: &'a str, ch: char) -> &'static str { let _ = ('\\n', '🦀', b'a'); }`;
    const tokens = tokenizeRust(code);

    const lifetimes = tokens.filter((t) => t.type === 'lifetime').map((t) => t.value);
    expect(lifetimes).toEqual(["'a", "'b", "'a", "'static"]);

    const chars = tokens.filter((t) => t.type === 'char').map((t) => t.value);
    expect(chars).toEqual(["'\\n'", "'🦀'", "b'a'"]);
  });

  it('highlights macros without confusing != operator as macro', () => {
    const code = `if x!=y { println!("hi"); vec![1, 2]; }`;
    const tokens = tokenizeRust(code);

    const macros = tokens.filter((t) => t.type === 'macro').map((t) => t.value);
    expect(macros).toEqual(['println!', 'vec!']);

    const operators = tokens.filter((t) => t.type === 'operator').map((t) => t.value);
    expect(operators).toContain('!=');
  });

  it('handles ranges without swallowing .. as a float literal', () => {
    const code = `for id in 0..3 { let v = 4.5_f64 + 0xffu32 as f64; }`;
    const tokens = tokenizeRust(code);

    const numbers = tokens.filter((t) => t.type === 'number').map((t) => t.value);
    expect(numbers).toEqual(['0', '3', '4.5_f64', '0xffu32']);

    const operators = tokens.filter((t) => t.type === 'operator').map((t) => t.value);
    expect(operators).toContain('..');
  });

  it('tokenizes nested block comments, line comments, and doc comments', () => {
    const code = [
      '/// Doc comment',
      '// Regular comment',
      '/* outer /* nested */ outer */',
      'let x = 1;',
    ].join('\n');
    const tokens = tokenizeRust(code);

    expect(tokens.find((t) => t.type === 'docComment')?.value).toBe('/// Doc comment');
    const comments = tokens.filter((t) => t.type === 'comment').map((t) => t.value);
    expect(comments).toEqual(['// Regular comment', '/* outer /* nested */ outer */']);
  });

  it('tokenizes attributes, raw strings, byte strings, and functions', () => {
    const code = [
      '#[derive(Debug, Clone)]',
      'struct User { name: String }',
      'fn greet(u: &User) {',
      '    let raw = r#"hello "rust""#;',
      '    let bytes = b"abc";',
      '    u.clone();',
      '}',
    ].join('\n');
    const tokens = tokenizeRust(code);

    expect(tokens.find((t) => t.type === 'attribute')?.value).toBe('#[derive(Debug, Clone)]');
    expect(tokens.filter((t) => t.type === 'string').map((t) => t.value)).toEqual([
      'r#"hello "rust""#',
      'b"abc"',
    ]);
    expect(tokens.filter((t) => t.type === 'function').map((t) => t.value)).toEqual([
      'greet',
      'clone',
    ]);
  });

  it('splits multi-line tokens cleanly across line boundaries', () => {
    const code = '/* line 1\nline 2 */\nfn main() {}';
    const lines = splitTokensByLine(tokenizeRust(code));

    expect(lines).toHaveLength(3);
    expect(lines[0]).toEqual([{ type: 'comment', value: '/* line 1' }]);
    expect(lines[1]).toEqual([{ type: 'comment', value: 'line 2 */' }]);
    expect(lines[2].map((t) => t.value).join('')).toBe('fn main() {}');
  });
});
