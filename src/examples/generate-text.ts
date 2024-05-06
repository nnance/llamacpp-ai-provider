import { experimental_generateText } from "ai";
import { LLamaCpp } from "../index.js";

const model = process.argv[2];
if (!model) {
  throw new Error("Missing model path argument");
}

const llamacpp = new LLamaCpp(model);

experimental_generateText({
  model: llamacpp.completion(),
  prompt: "Invent a new holiday and describe its traditions.",
}).then(({ text, usage, finishReason }) => {
  console.log(`AI: ${text}`);
});
