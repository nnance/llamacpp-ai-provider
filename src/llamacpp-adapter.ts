export type Token = number;

export interface LLamaCppEvaluateOptions {
  maxTokens?: number;
  onToken?: (textDelta: string) => void;
}

export interface LLamaCppAdapter {
  evaluate(query: string, options?: LLamaCppEvaluateOptions): Promise<string>;
}
