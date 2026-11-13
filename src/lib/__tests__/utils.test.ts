import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn utility', () => {
  it('combines simple class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('handles conditional classes', () => {
    const isTrue = true;
    const isFalse = false;
    expect(cn('base', isTrue && 'active', isFalse && 'inactive')).toBe('base active');
  });

  it('filters out falsy and undefined values', () => {
    expect(cn('base', null, undefined, false, '', 0 && 'zero')).toBe('base');
  });

  it('resolves conflicting Tailwind utility classes properly', () => {
    // Tailwind merge should let the later class override the earlier class
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    expect(cn('bg-white', 'bg-slate-900')).toBe('bg-slate-900');
  });

  it('handles nested arrays and object inputs', () => {
    expect(cn(['btn', ['btn-primary', { 'btn-large': true, 'btn-disabled': false }]])).toBe(
      'btn btn-primary btn-large'
    );
  });
});
