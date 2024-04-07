export type Token = number;

export interface LLamaCppPromptOptions {
  maxTokens?: number;
  onToken?: (textDelta: string) => void;
}

export interface LLamaCppAdapter {
  evaluate(query: string, options?: LLamaCppPromptOptions): Promise<string>;
  prompt(text: string, options?: LLamaCppPromptOptions): Promise<string>;
}
