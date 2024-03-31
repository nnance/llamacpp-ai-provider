import { LLamaCppAdaptor } from "./llamacpp-adaptor.js";
import { LLamaCppCompletionLanguageModel } from "./llamacpp-chat-language-model.js";

/**
 * llama.cpp provider
 */

export class LLamaCpp {
  adaptor: LLamaCppAdaptor;

  constructor(adaptor: LLamaCppAdaptor) {
    this.adaptor = adaptor;
  }

  chat() {
    return new LLamaCppCompletionLanguageModel(this.adaptor);
  }
}
