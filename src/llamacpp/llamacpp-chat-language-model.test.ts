import { LanguageModelV1Prompt } from "ai/spec";
import { convertLanguageModelPromptToMessages } from "./llamacpp-chat-language-model.js";
import { Message } from "ai";

describe("convertLanguageModelPromptToMessages", () => {
  it("should convert LanguageModelV1Prompt to Messages", () => {
    const prompt: LanguageModelV1Prompt = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Hello",
          },
        ],
      },
      { role: "assistant", content: [{ type: "text", text: "Hi" }] },
    ];

    const expected: Message[] = [
      { id: "0", role: "user", content: "Hello" },
      { id: "1", role: "assistant", content: "Hi" },
    ];

    const result = convertLanguageModelPromptToMessages(prompt);

    expect(result).toEqual(expected);
  });

  it("should handle empty prompt", () => {
    const prompt: LanguageModelV1Prompt = [];

    const expected: Message[] = [];

    const result = convertLanguageModelPromptToMessages(prompt);

    expect(result).toEqual(expected);
  });

  it("should handle prompt with non-text content", () => {
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
      {
        role: "assistant",
        content: [],
      },
    ];

    const expected: Message[] = [
      { id: "0", role: "user", content: "hello" },
      { id: "1", role: "assistant", content: "" },
    ];

    const result = convertLanguageModelPromptToMessages(prompt);

    expect(result).toEqual(expected);
  });
});
