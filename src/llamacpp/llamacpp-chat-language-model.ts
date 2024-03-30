import {
  LanguageModelV1,
  LanguageModelV1CallOptions,
  LanguageModelV1CallWarning,
  LanguageModelV1FinishReason,
  LanguageModelV1FunctionToolCall,
  LanguageModelV1Prompt,
  LanguageModelV1StreamPart,
  LanguageModelV1TextPart,
} from "ai/spec";
import { Message } from "ai";

import { experimental_buildLlama2Prompt } from "ai/prompts";

import {
  LlamaChatSession,
  LlamaContext,
  LlamaModel,
  Token,
} from "node-llama-cpp";

function isString(x: any): x is string {
  return typeof x === "string";
}

function convertLanguageModelPromptToMessages(
  prompt: LanguageModelV1Prompt
): Message[] {
  return prompt.map(({ role, content }, id) => ({
    id: id.toString(),
    role,
    content: isString(content)
      ? content
      : content[0].type === "text"
        ? (content[0] as LanguageModelV1TextPart).text
        : "",
  }));
}

export class LLamaCppCompletionLanguageModel implements LanguageModelV1 {
  readonly specificationVersion = "v1";
  readonly provider = "llamacpp";
  modelId: string;
  modelPath: string;
  session?: LlamaChatSession;
  defaultObjectGenerationMode: "json" | "tool" | "grammar" | undefined;

  constructor(
    modelPath: string,
    defaultObjectGenerationMode?: "json" | "tool" | "grammar"
  ) {
    this.modelPath = modelPath;
    this.modelId = "unknown";
    this.defaultObjectGenerationMode = defaultObjectGenerationMode;
  }

  private async getSession() {
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
    const session = await this.getSession();

    const responseText = await session.prompt(prompt, {
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
    const session = await this.getSession();

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
                  textDelta: session.context.decode(chunk),
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
