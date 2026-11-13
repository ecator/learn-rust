export interface VisualizerStep {
  step: number;
  codeHighlightLines: number[];
  explanation: { zh: string; en: string; ja: string };
  state: Record<string, unknown>;
  error?: { code: string; message: { zh: string; en: string; ja: string } };
}

export interface VisualizerProps {
  initialStep?: number;
  autoPlay?: boolean;
  onComplete?: () => void;
  className?: string;
}
