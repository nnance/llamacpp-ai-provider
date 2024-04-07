export type LLAMAModelParams = {
  gpuLayers?: number;
  vocabOnly?: boolean;
  useMmap?: boolean;
  useMlock?: boolean;
};

export interface EvaluateParams {
  temperature?: number;
  top_k?: number;
  top_p?: number;
  repeat_penalty?: number;
  repeat_penalty_presence_penalty?: number;
  repeat_penalty_frequency_penalty?: number;
  repeat_penalty_tokens?: Uint32Array;
  use_repeat_penalty?: boolean;
}

export class LLAMAContext {
  constructor(modelPath: string, options?: LLAMAModelParams);
  encode(text: string): Uint32Array;
  batchEncode(input: string[]): Uint32Array;
  decode(tokens: Uint32Array): string;
  batchDecode(input: Uint32Array): string[];
  tokenBos(): number;
  tokenEos(): number;
  tokenN1(): number;
  evaluate(input: Uint32Array, params?: EvaluateParams): Promise<number>;
}

export default interface ILLAMABindings {
  LLAMAContext: typeof LLAMAContext;
  systemInfo(): Promise<string>;
}
