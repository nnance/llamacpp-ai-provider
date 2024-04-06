import { LLamaCppAdapter } from "./llamacpp-adapter.js";
import { LLamaCppChatLanguageModel } from "./llamacpp-chat-language-model.js";
import { LlamaCppCompletionLanguageModel } from "./llamacpp-completion-language-model.js";
import { NodeLLamaCpp } from "./node-llama-cpp-adapter.js";

/**
 * llama.cpp provider
 */

export class LLamaCpp {
  private adaptor: LLamaCppAdapter;

  constructor(modelPath: string) {
    this.adaptor = new NodeLLamaCpp(modelPath);
  }

  chat() {
    return new LLamaCppChatLanguageModel(this.adaptor);
  }

  completion() {
    return new LlamaCppCompletionLanguageModel(this.adaptor);
  }
}
