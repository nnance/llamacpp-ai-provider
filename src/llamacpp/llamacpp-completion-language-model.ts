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

function extractPromptContent({
  inputFormat,
  prompt,
}: LanguageModelV1CallOptions) {
  if (
    inputFormat === "prompt" &&
    prompt.length === 1 &&
    prompt[0].role === "user" &&
    prompt[0].content.length === 1 &&
    prompt[0].content[0].type === "text"
  ) {
    return { prompt: prompt[0].content[0].text };
  }
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
    const query = extractPromptContent(options);
    if (!query) {
      throw new Error("Missing prompt");
    }

    const response = await this.adaptor.evaluate(query.prompt);

    return {
      text: response,
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
    const session = this.adaptor;
    const query = extractPromptContent(options);
    if (!query) {
      throw new Error("Missing prompt");
    }

    const stream = new ReadableStream<LanguageModelV1StreamPart>({
      start(controller) {
        const tokens: number[] = [];
        session
          .evaluate(query.prompt, {
            onToken(chunk: number[]) {
              tokens.push(...chunk);
              controller.enqueue({
                type: "text-delta",
                textDelta: session.decode(chunk),
              });
            },
          })
          .then(() => {
            const part: LanguageModelV1StreamPart = {
              type: "finish",
              finishReason: "stop",
              usage: {
                completionTokens: tokens.length,
                promptTokens: 0,
              },
            };

            controller.enqueue(part);
            controller.close();
          });
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
