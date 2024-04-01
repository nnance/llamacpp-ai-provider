import {
  LanguageModelV1CallOptions,
  LanguageModelV1Prompt,
  LanguageModelV1StreamPart,
} from "ai/spec";
import { LLamaCppAdaptor } from "./llamacpp-adaptor.js";
import { LLamaCppCompletionLanguageModel } from "./llamacpp-chat-language-model.js";
import { LLamaChatPromptOptions } from "node-llama-cpp";

const assistantResponse = "Hello, how can I help you?";

class LLamaCppAdaptorMock implements LLamaCppAdaptor {
  decode(batch: number[]): string {
    return "Hello";
  }
  async prompt(text: string, options: LLamaChatPromptOptions): Promise<string> {
    if (options.onToken) {
      options.onToken([1, 2, 3]);
      return assistantResponse;
    } else {
      return assistantResponse;
    }
  }
}

describe("LLamaCppCompletionLanguageModel", () => {
  let model: LLamaCppCompletionLanguageModel;

  // Create a mock prompt and options
  const prompt: LanguageModelV1Prompt = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "hello",
        },
      ],
    },
  ];

  const options: LanguageModelV1CallOptions = {
    mode: { type: "regular" },
    prompt,
    inputFormat: "prompt",
  };

  beforeEach(() => {
    const mock = new LLamaCppAdaptorMock();
    // Create a new instance of the LLamaCppCompletionLanguageModel before each test
    model = new LLamaCppCompletionLanguageModel(mock);
  });

  describe("doGenerate", () => {
    it("should generate completion text", async () => {
      // Call the doGenerate method
      const result = await model.doGenerate(options);

      // Assert the expected result
      expect(result.finishReason).toEqual("stop");
      expect(result.text).toEqual(assistantResponse);
      expect(result.usage.promptTokens).toEqual(0);
      expect(result.usage.completionTokens).toEqual(0);
      expect(result.rawCall.rawPrompt).toBeUndefined();
      expect(result.rawCall.rawSettings).toEqual({});
    });
  });

  describe("doStream", () => {
    it("should generate a readable stream", async () => {
      // Call the doStream method
      const { stream, rawCall } = await model.doStream(options);
      const reader = stream.getReader();

      // Assert the expected result
      const blocks: LanguageModelV1StreamPart[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        blocks.push(value);
      }
      expect(blocks[0]).toEqual({
        type: "text-delta",
        textDelta: "Hello",
      });
      expect(blocks[1]).toEqual({
        finishReason: "stop",
        type: "finish",
        usage: {
          completionTokens: 3,
          promptTokens: 0,
        },
      });
      expect(rawCall.rawPrompt).toBeUndefined();
      expect(rawCall.rawSettings).toEqual({});
    });
  });
});
