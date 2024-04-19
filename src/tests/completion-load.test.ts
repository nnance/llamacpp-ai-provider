import { LanguageModelV1CallOptions, LanguageModelV1Prompt } from "ai/spec";
import { LLamaCppChatLanguageModel } from "../llamacpp-chat-language-model.js";

import { fileURLToPath } from "url";
import path from "path";
import { LLamaCppBindings } from "../llamacpp-bindings-adapter.js";

const modelPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../models",
  "llama-2-7b-chat.Q4_K_M.gguf"
);

const chatLog = [
  "My name is Nick, what is yours?",
  "what are the different options to iterate over an async iterator in javascript?",
  "Do you remember my name?",
];

describe("LLamaCppCompletionLanguageModel", () => {
  let model: LLamaCppChatLanguageModel;

  // Create a mock prompt and options
  const prompt: LanguageModelV1Prompt = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Do you remember my name?",
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
    const mock = new LLamaCppBindings(modelPath);
    // Create a new instance of the LLamaCppCompletionLanguageModel before each test
    model = new LLamaCppChatLanguageModel(mock);
  });

  describe("doGenerate", () => {
    it("should generate completion text", async () => {
      // Call the doGenerate method
      const asyncIterator = async function* (
        items: string[]
      ): AsyncGenerator<string | undefined, void> {
        const history: LanguageModelV1Prompt = [];

        for (let i = 0; i < items.length; i++) {
          history.push({
            role: "user",
            content: [
              {
                type: "text",
                text: items[i],
              },
            ],
          });

          const result = await model.doGenerate({
            mode: { type: "regular" },
            prompt: history,
            inputFormat: "prompt",
          });

          history.push({
            role: "assistant",
            content: [
              {
                type: "text",
                text: result.text || "",
              },
            ],
          });

          yield result.text;
        }
      };

      let lastResult: string | undefined;
      for await (const result of asyncIterator(chatLog)) {
        console.log(result);
        lastResult = result;
      }

      // Assert the expected result
      expect(lastResult).toContain("Nick");
    }, 20000);
  });
});
