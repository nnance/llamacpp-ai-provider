import { LLamaCppCompletionLanguageModel } from "./llamacpp-chat-language-model.js";

/**
 * llama.cpp provider
 */

export class LLamaCpp {
  modelPath?: string;

  constructor(options?: { modelPath?: string }) {
    this.modelPath = options?.modelPath;
  }

  private get getModelPath() {
    const modelPath = this.modelPath || process.env.MODEL_PATH;
    if (!modelPath) {
      throw new Error("model path not defined");
    }
    return modelPath;
  }

  chat() {
    return new LLamaCppCompletionLanguageModel(this.getModelPath);
  }
}

/**
 * Default LLamaCpp provider instance.
 */
export const llamacpp = new LLamaCpp();
