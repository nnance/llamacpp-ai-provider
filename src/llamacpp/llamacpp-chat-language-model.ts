import {
  LanguageModelV1,
  LanguageModelV1CallOptions,
  LanguageModelV1CallWarning,
  LanguageModelV1FinishReason,
  LanguageModelV1FunctionToolCall,
  LanguageModelV1ImagePart,
  LanguageModelV1Prompt,
  LanguageModelV1StreamPart,
  LanguageModelV1TextPart,
  LanguageModelV1ToolCallPart,
  LanguageModelV1ToolResultPart,
} from "ai/spec";
import { Message } from "ai";

import { experimental_buildLlama2Prompt } from "ai/prompts";
import { LLamaCppAdaptor, Token } from "./llamacpp-adaptor.js";

function isString(x: any): x is string {
  return typeof x === "string";
}

function getStringContent(
  content:
    | string
    | (LanguageModelV1TextPart | LanguageModelV1ImagePart)[]
    | (LanguageModelV1TextPart | LanguageModelV1ToolCallPart)[]
    | LanguageModelV1ToolResultPart[]
): string {
  if (isString(content)) {
    return content;
  } else if (Array.isArray(content) && content.length > 0) {
    const first = content[0];
    return first.type === "text"
      ? first.text
      : first.type === "tool-call"
        ? first.toolName
        : "image";
  } else {
    return "";
  }
}

// TODO: Update tests so this can become private again
export function convertLanguageModelPromptToMessages(
  prompt: LanguageModelV1Prompt
): Message[] {
  return prompt.map(({ role, content }, id) => ({
    id: id.toString(),
    role,
    content: getStringContent(content),
  }));
}

export class LLamaCppCompletionLanguageModel implements LanguageModelV1 {
  readonly specificationVersion = "v1";
  readonly provider = "llamacpp";
  modelId: string;
  adaptor: LLamaCppAdaptor;
  defaultObjectGenerationMode: "json" | "tool" | "grammar" | undefined;

  constructor(
    adaptor: LLamaCppAdaptor,
    defaultObjectGenerationMode?: "json" | "tool" | "grammar"
  ) {
    this.adaptor = adaptor;
    this.modelId = "unknown";
    this.defaultObjectGenerationMode = defaultObjectGenerationMode;
  }

  async doGenerate(options: LanguageModelV1CallOptions): Promise<{
    text?: string | undefined;
    toolCalls?: LanguageModelV1FunctionToolCall[] | undefined;
    finishReason: LanguageModelV1FinishReason;
    usage: { promptTokens: number; completionTokens: number };
    rawCall: { rawPrompt: unknown; rawSettings: Record<string, unknown> };
    warnings?: LanguageModelV1CallWarning[] | undefined;
  }> {
    const messages = convertLanguageModelPromptToMessages(options.prompt);
    const prompt = experimental_buildLlama2Prompt(messages);

    const responseText = await this.adaptor.prompt(prompt, {
      maxTokens: options.maxTokens,
    });

    return {
      finishReason: "stop",
      text: responseText,
      usage: {
        promptTokens: 0,
        completionTokens: 0,
      },
      rawCall: {
        rawPrompt: undefined,
        rawSettings: {},
      },
    };
  }

  async doStream(options: LanguageModelV1CallOptions): Promise<{
    stream: ReadableStream<LanguageModelV1StreamPart>;
    rawCall: { rawPrompt: unknown; rawSettings: Record<string, unknown> };
    warnings?: LanguageModelV1CallWarning[] | undefined;
  }> {
    const messages = convertLanguageModelPromptToMessages(options.prompt);
    const prompt = experimental_buildLlama2Prompt(messages);
    const session = this.adaptor;

    return {
      stream: new ReadableStream({
        start(controller) {
          const tokens: Token[] = [];
          session
            .prompt(prompt, {
              onToken(chunk: Token[]) {
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
      }),
      rawCall: {
        rawPrompt: undefined,
        rawSettings: {},
      },
    };
  }
}
