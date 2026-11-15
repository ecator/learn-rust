import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HighlightedRustCode, RustCodeBlock } from '@/components/common/RustCodeBlock';
import { I18nProvider } from '@/lib/i18n';
import { LessonPage } from '@/routes/LessonPage';

describe('RustCodeBlock & HighlightedRustCode', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders syntax-highlighted tokens and keeps code.textContent identical to source', () => {
    const sample = `fn main() {\n    let name: &'static str = "Ferris";\n    println!("Hi, {}", name);\n}`;
    const { container } = render(<RustCodeBlock code={sample} showLineNumbers />);

    const pre = container.querySelector('pre');
    const code = container.querySelector('code');
    expect(pre).toBeInTheDocument();
    expect(pre?.className).toMatch(/overflow-x-auto/);
    expect(code).toBeInTheDocument();
    expect(code?.textContent).toBe(sample);

    expect(code?.querySelector('[data-token-type="keyword"]')).toHaveTextContent('fn');
    expect(code?.querySelector('[data-token-type="function"]')).toHaveTextContent('main');
    expect(code?.querySelector('[data-token-type="lifetime"]')).toHaveTextContent("'static");
    expect(code?.querySelector('[data-token-type="primitive"]')).toHaveTextContent('str');
    expect(code?.querySelector('[data-token-type="macro"]')).toHaveTextContent('println!');

    const gutter = pre?.querySelector('[aria-hidden="true"]');
    expect(gutter).toBeInTheDocument();
    expect(gutter?.textContent).toBe('1234');
  });

  it('supports pitfall variant without line numbers when disabled', () => {
    const { container } = render(
      <RustCodeBlock code={'let x = 1;'} variant="pitfall" showLineNumbers={false} />
    );

    const pre = screen.getByTestId('rust-pitfall-code');
    expect(pre).toBeInTheDocument();
    expect(pre.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
    expect(container.querySelector('code')?.textContent).toBe('let x = 1;');
  });

  it('renders adaptive theme token classes cleanly', () => {
    const { container } = render(<HighlightedRustCode code={'let mut x = 42;'} theme="adaptive" />);
    const keyword = container.querySelector('[data-token-type="keyword"]');
    expect(keyword?.className).toContain('text-purple-700');
    expect(keyword?.className).toContain('dark:text-purple-400');
  });

  it('escapes HTML/script content strictly as text nodes', () => {
    const xssSample = 'let s = "<script src=\\"malicious.js\\"></script>";';
    const { container } = render(<RustCodeBlock code={xssSample} />);

    expect(container.querySelectorAll('script').length).toBe(0);
    expect(container.querySelector('code')?.textContent).toBe(xssSample);
  });

  it('copies lesson code snippet via Copy button on LessonPage', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
      writable: true,
    });

    render(
      <I18nProvider defaultLanguage="en">
        <MemoryRouter initialEntries={['/lesson/hello-ferris']}>
          <Routes>
            <Route path="/lesson/:slug" element={<LessonPage />} />
          </Routes>
        </MemoryRouter>
      </I18nProvider>
    );

    const copyBtn = screen.getByRole('button', { name: /Copy/i });
    await user.click(copyBtn);

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0][0]).toContain('fn main()');
    expect(screen.getByRole('button', { name: /Copied/i })).toBeInTheDocument();
  });
});
