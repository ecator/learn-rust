import { describe, it, expect, beforeEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorHandlingVisualizer } from '../ErrorHandlingVisualizer';
import { I18nProvider } from '@/lib/i18n';

describe('ErrorHandlingVisualizer Unit Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.clear();
  });

  it('renders Result Railway track execution flow', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <ErrorHandlingVisualizer />
      </I18nProvider>
    );

    expect(screen.getByTestId('error-handling-visualizer')).toBeInTheDocument();
    expect(screen.getByTestId('railway-view')).toBeInTheDocument();

    const stepBtn = screen.getByRole('button', { name: /Step Track/i });
    await user.click(stepBtn);
    await user.click(stepBtn);
    await user.click(stepBtn);

    expect(screen.getByText(/Ok\(value\)/i)).toBeInTheDocument();
  });

  it('demonstrates early return short-circuit on Err', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <ErrorHandlingVisualizer />
      </I18nProvider>
    );

    const toggleValidBtn = screen.getByRole('button', { name: /Valid Input/i });
    await user.click(toggleValidBtn); // switch to Invalid Input

    const stepBtn = screen.getByRole('button', { name: /Step Track/i });
    await user.click(stepBtn);

    expect(screen.getByText(/Err\(ValidationError\) \[Early Return\]/i)).toBeInTheDocument();
  });

  it('handles Option combinators map and unwrap_or', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <ErrorHandlingVisualizer />
      </I18nProvider>
    );

    const optionTab = screen.getByRole('tab', { name: /Option Combinators/i });
    await user.click(optionTab);

    expect(screen.getByText(/10 \(mapped via Some\)/i)).toBeInTheDocument();

    const noneBtn = screen.getByRole('button', { name: /^None$/i });
    await user.click(noneBtn);

    expect(screen.getByText(/0 \(default branch via unwrap_or\)/i)).toBeInTheDocument();
  });

  it('shows Panic and stack unwinding on unwrap failure', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <ErrorHandlingVisualizer />
      </I18nProvider>
    );

    const panicTab = screen.getByRole('tab', { name: /Panic vs Recoverable/i });
    await user.click(panicTab);

    const triggerBtn = screen.getByRole('button', { name: /Trigger unwrap\(\) on None/i });
    await user.click(triggerBtn);

    expect(screen.getByRole('img', { name: /Ferris the Crab \(panic\)/i })).toBeInTheDocument();
    expect(screen.getByText(/unwinding stack frames/i)).toBeInTheDocument();
  });

  it('renders From/Into automatic error conversion', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <ErrorHandlingVisualizer />
      </I18nProvider>
    );

    const fromIntoTab = screen.getByRole('tab', { name: /From\/Into Conversion/i });
    await user.click(fromIntoTab);

    expect(screen.getByText(/From::from conversion/i)).toBeInTheDocument();
    expect(screen.getByText(/AppError::Io\(err\)/i)).toBeInTheDocument();
  });

  it('simulates E0277 compiler error when error simulation is toggled', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <ErrorHandlingVisualizer />
      </I18nProvider>
    );

    const errorBtn = screen.getByRole('button', { name: /Toggle Error Simulation/i });
    await user.click(errorBtn);

    expect(screen.getByTestId('compiler-error')).toHaveTextContent(/E0277.*operator/i);
  });

  it('renders in Chinese when language is zh', () => {
    localStorage.setItem('learn_rust_lang', 'zh');
    render(
      <I18nProvider defaultLanguage="zh">
        <ErrorHandlingVisualizer />
      </I18nProvider>
    );

    expect(screen.getByText(/错误处理与铁路道岔模型/i)).toBeInTheDocument();
  });

  it('renders in Japanese when language is ja', () => {
    localStorage.setItem('learn_rust_lang', 'ja');
    render(
      <I18nProvider defaultLanguage="ja">
        <ErrorHandlingVisualizer />
      </I18nProvider>
    );

    expect(screen.getByText(/エラー処理と鉄道モデル/i)).toBeInTheDocument();
  });
});
