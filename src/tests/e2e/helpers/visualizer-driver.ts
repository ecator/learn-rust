import userEvent from '@testing-library/user-event';

export class VisualizerDriver {
  private container: HTMLElement;
  private user = userEvent.setup();

  constructor(container: HTMLElement = document.body) {
    this.container = container;
  }

  /**
   * Find the Next Step button across supported languages (EN / ZH / JA)
   */
  findNextButton(): HTMLElement | null {
    const nextRegex = /(next|next step|下一步|次へ)/i;
    const buttons = this.container.querySelectorAll<HTMLButtonElement>('button');
    for (const btn of Array.from(buttons)) {
      const label = btn.getAttribute('aria-label') || btn.textContent || '';
      if (nextRegex.test(label)) {
        return btn;
      }
    }
    return null;
  }

  /**
   * Find the Previous Step button across supported languages
   */
  findPrevButton(): HTMLElement | null {
    const prevRegex = /(prev|previous|previous step|上一步|前へ)/i;
    const buttons = this.container.querySelectorAll<HTMLButtonElement>('button');
    for (const btn of Array.from(buttons)) {
      const label = btn.getAttribute('aria-label') || btn.textContent || '';
      if (prevRegex.test(label)) {
        return btn;
      }
    }
    return null;
  }

  /**
   * Find Play/Pause button
   */
  findPlayPauseButton(): HTMLElement | null {
    const playRegex = /(play|pause|播放|暂停|再生|一時停止)/i;
    const buttons = this.container.querySelectorAll<HTMLButtonElement>('button');
    for (const btn of Array.from(buttons)) {
      const label = btn.getAttribute('aria-label') || btn.textContent || '';
      if (playRegex.test(label)) {
        return btn;
      }
    }
    return null;
  }

  /**
   * Find Reset button
   */
  findResetButton(): HTMLElement | null {
    const resetRegex = /(reset|重置|リセット)/i;
    const buttons = this.container.querySelectorAll<HTMLButtonElement>('button');
    for (const btn of Array.from(buttons)) {
      const label = btn.getAttribute('aria-label') || btn.textContent || '';
      if (resetRegex.test(label)) {
        return btn;
      }
    }
    return null;
  }

  /**
   * Click Next Step
   */
  async stepForward(): Promise<boolean> {
    const btn = this.findNextButton();
    if (!btn || btn.hasAttribute('disabled')) return false;
    await this.user.click(btn);
    return true;
  }

  /**
   * Click Previous Step
   */
  async stepBackward(): Promise<boolean> {
    const btn = this.findPrevButton();
    if (!btn || btn.hasAttribute('disabled')) return false;
    await this.user.click(btn);
    return true;
  }

  /**
   * Toggle Play/Pause
   */
  async togglePlay(): Promise<boolean> {
    const btn = this.findPlayPauseButton();
    if (!btn || btn.hasAttribute('disabled')) return false;
    await this.user.click(btn);
    return true;
  }

  /**
   * Click Reset
   */
  async reset(): Promise<boolean> {
    const btn = this.findResetButton();
    if (!btn || btn.hasAttribute('disabled')) return false;
    await this.user.click(btn);
    return true;
  }

  /**
   * Retrieve current step index if exposed via text (e.g., "Step 2 of 5" or "2 / 5")
   * or via slider aria-valuenow.
   */
  getCurrentStep(): number | null {
    const slider = this.container.querySelector<HTMLInputElement>('input[type="range"]');
    if (slider && slider.value) {
      return parseInt(slider.value, 10);
    }

    const stepEl = this.container.querySelector('[data-testid="current-step"]');
    if (stepEl && stepEl.textContent) {
      const match = stepEl.textContent.match(/\d+/);
      if (match) return parseInt(match[0], 10);
    }

    // Check textual step patterns in the document
    const match = this.container.textContent?.match(/(?:Step|步骤|ステップ)\s*(\d+)/i);
    if (match) {
      return parseInt(match[1], 10);
    }

    return null;
  }

  /**
   * Detect simulated compiler error message in the visualizer container
   */
  getCompilerError(): string | null {
    const errorEl = this.container.querySelector('[data-testid="compiler-error"], [role="alert"]');
    if (errorEl) {
      return errorEl.textContent || null;
    }
    const text = this.container.textContent || '';
    const match = text.match(/(?:error\[)?(E\d{4}\]?:?[^\n]+)/i);
    return match ? match[1] : null;
  }
}
