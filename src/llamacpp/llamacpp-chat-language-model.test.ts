import { LanguageModelV1CallOptions, LanguageModelV1Prompt } from "ai/spec";
import { LLamaCppAdaptor } from "./llamacpp-adaptor.js";
import { LLamaCppCompletionLanguageModel } from "./llamacpp-chat-language-model.js";

class LLamaCppAdaptorMock implements LLamaCppAdaptor {
  decode(batch: number[]): string {
    return "Hello";
  }
  async prompt(text: string): Promise<string> {
    return "Hello, how can I help you?";
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
      expect(result.text).toBeDefined();
      expect(result.usage.promptTokens).toEqual(0);
      expect(result.usage.completionTokens).toEqual(0);
      expect(result.rawCall.rawPrompt).toBeUndefined();
      expect(result.rawCall.rawSettings).toEqual({});
    });
  });

  describe("doStream", () => {
    it("should generate a readable stream", async () => {
      // Call the doStream method
      const result = await model.doStream(options);

      // Assert the expected result
      expect(result.stream).toBeInstanceOf(ReadableStream);
      expect(result.rawCall.rawPrompt).toBeUndefined();
      expect(result.rawCall.rawSettings).toEqual({});
    });
  });
});
