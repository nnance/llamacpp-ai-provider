import {
  LlamaChatSession,
  LlamaContext,
  LlamaModel,
  Token,
} from "node-llama-cpp";
import { LLamaCppAdapter, LLamaCppPromptOptions } from "./llamacpp-adapter.js";

export class NodeLLamaCpp implements LLamaCppAdapter {
  private modelPath: string;
  private activeSession?: LlamaChatSession;

  constructor(modelPath?: string) {
    const path = modelPath || process.env.MODEL_PATH;
    if (!path) {
      throw new Error("model path not defined");
    }
    this.modelPath = path;
  }

  async getSession(): Promise<LlamaChatSession> {
    if (!this.activeSession) {
      const model = new LlamaModel({ modelPath: this.modelPath });
      const context = new LlamaContext({ model });

      this.activeSession = new LlamaChatSession({
        context,
        printLLamaSystemInfo: false,
      });
    }

    return this.activeSession;
  }

  async prompt(text: string, options?: LLamaCppPromptOptions): Promise<string> {
    const session = await this.getSession();
    return session.prompt(text, {
      maxTokens: options?.maxTokens,
      onToken: options?.onToken,
    });
  }

  async evaluate(
    query: string,
    options?: LLamaCppPromptOptions
  ): Promise<string> {
    const { context } = await this.getSession();
    const tokens = context.encode(query);
    const res: Token[] = [];
    for await (const modelToken of context.evaluate(tokens)) {
      if (options?.onToken) {
        options.onToken([modelToken]);
      }
      res.push(modelToken);

      // It's important to not concatinate the results as strings,
      // as doing so will break some characters (like some emojis)
      // that consist of multiple tokens.
      // By using an array of tokens, we can decode them correctly together.
      const resString: string = context.decode(res);

      const lastPart = resString.split("ASSISTANT:").reverse()[0];
      if (lastPart.includes("USER:")) break;
    }

    return context.decode(res).split("USER:")[0];
  }

  decode(batch: number[]): string {
    if (!this.activeSession) {
      throw new Error("No active session");
    }
    const { context } = this.activeSession;
    return context.decode(batch);
  }
}
