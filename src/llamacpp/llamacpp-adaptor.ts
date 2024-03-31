import { LlamaModel, LlamaContext, LlamaChatSession } from "node-llama-cpp";

export type Token = number;

export interface LLamaCppPromptOptions {
  maxTokens?: number;
  onToken?: (chunk: Token[]) => void;
}

export interface LLamaCppAdaptor {
  prompt(text: string, options?: LLamaCppPromptOptions): Promise<string>;
  decode(batch: Token[]): string;
}

export class NodeLLamaCpp implements LLamaCppAdaptor {
  private modelPath: string;
  private session?: LlamaChatSession;

  constructor(modelPath?: string) {
    const path = modelPath || process.env.MODEL_PATH;
    if (!path) {
      throw new Error("model path not defined");
    }
    this.modelPath = path;
  }

  async getSession(): Promise<LlamaChatSession> {
    if (!this.session) {
      const model = new LlamaModel({ modelPath: this.modelPath });
      const context = new LlamaContext({ model });

      this.session = new LlamaChatSession({
        context,
        printLLamaSystemInfo: false,
      });
    }

    return this.session;
  }

  async prompt(text: string, options?: LLamaCppPromptOptions): Promise<string> {
    const session = await this.getSession();
    return session.prompt(text, {
      maxTokens: options?.maxTokens,
      onToken: options?.onToken,
    });
  }

  decode(batch: number[]): string {
    if (this.session) {
      return this.session.context.decode(batch);
    }
    return "";
  }
}
