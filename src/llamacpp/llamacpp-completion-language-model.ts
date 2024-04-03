import {
  LanguageModelV1,
  LanguageModelV1CallOptions,
  LanguageModelV1CallWarning,
  LanguageModelV1FunctionToolCall,
  LanguageModelV1StreamPart,
  LanguageModelV1FinishReason,
} from "ai/spec";
import { LLamaCppAdaptor } from "./llamacpp-adaptor.js";

interface LLamaCppCompletionConfig {
  provider?: string;
  modelId?: string;
  defaultObjectGenerationMode?: "json" | "tool" | "grammar";
}

export class LlamaCppCompletionLanguageModel implements LanguageModelV1 {
  readonly specificationVersion = "v1";
  readonly provider: string;
  readonly adaptor: LLamaCppAdaptor;
  readonly modelId: string;
  readonly defaultObjectGenerationMode: "tool" | "json" | "grammar";

  constructor(adaptor: LLamaCppAdaptor, config?: LLamaCppCompletionConfig) {
    this.adaptor = adaptor;
    this.provider = config?.provider || "llamacpp.completion";
    this.modelId = config?.modelId || "unknown";
    this.defaultObjectGenerationMode =
      config?.defaultObjectGenerationMode || "tool";
  }

  async doGenerate(options: LanguageModelV1CallOptions): Promise<{
    text?: string;
    toolCalls?: LanguageModelV1FunctionToolCall[];
    finishReason: LanguageModelV1FinishReason;
    usage: { promptTokens: number; completionTokens: number };
    rawCall: { rawPrompt: unknown; rawSettings: Record<string, unknown> };
    warnings?: LanguageModelV1CallWarning[];
  }> {
    // Implement the logic for generating completion text here
    return {
      text: "Generated completion text",
      finishReason: "stop",
      usage: {
        promptTokens: 0,
        completionTokens: 0,
      },
      rawCall: {
        rawPrompt: options.prompt,
        rawSettings: options,
      },
    };
  }

  async doStream(options: LanguageModelV1CallOptions): Promise<{
    stream: ReadableStream<LanguageModelV1StreamPart>;
    rawCall: { rawPrompt: unknown; rawSettings: Record<string, unknown> };
    warnings?: LanguageModelV1CallWarning[];
  }> {
    // Implement the logic for streaming completion text here
    const stream = new ReadableStream<LanguageModelV1StreamPart>({
      start(controller) {
        // Implement the streaming logic here
        // controller.enqueue({ text: "Streamed completion text" });
        controller.close();
      },
    });

    return {
      stream,
      rawCall: {
        rawPrompt: options.prompt,
        rawSettings: options,
      },
    };
  }
}
