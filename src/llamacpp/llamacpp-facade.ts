import { LlamaChatSession, LlamaContext, LlamaModel } from "node-llama-cpp";
import { LLamaCppAdaptor, LLamaCppPromptOptions } from "./llamacpp-adaptor.js";
import { LLamaCppCompletionLanguageModel } from "./llamacpp-chat-language-model.js";
import { LlamaCppCompletionLanguageModel } from "./llamacpp-completion-language-model.js";

class NodeLLamaCpp implements LLamaCppAdaptor {
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

/**
 * llama.cpp provider
 */

export class LLamaCpp {
  private adaptor: LLamaCppAdaptor;

  constructor(modelPath: string) {
    this.adaptor = new NodeLLamaCpp(modelPath);
  }

  chat() {
    return new LLamaCppCompletionLanguageModel(this.adaptor);
  }

  completion() {
    return new LlamaCppCompletionLanguageModel(this.adaptor);
  }
}
