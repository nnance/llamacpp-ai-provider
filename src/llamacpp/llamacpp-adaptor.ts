export type Token = number;

export interface LLamaCppPromptOptions {
  maxTokens?: number;
  onToken?: (chunk: Token[]) => void;
}

export interface LLamaCppAdaptor {
  prompt(text: string, options?: LLamaCppPromptOptions): Promise<string>;
  decode(batch: Token[]): string;
}
