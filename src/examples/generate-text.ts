import { experimental_generateText } from "ai";
import { LLamaCpp } from "../index.js";
import { fileURLToPath } from "url";
import path from "path";

const modelPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../models",
  "llama-2-7b-chat.Q4_K_M.gguf"
);

const llamacpp = new LLamaCpp(modelPath);

experimental_generateText({
  model: llamacpp.completion(),
  prompt: "Invent a new holiday and describe its traditions.",
}).then(({ text, usage, finishReason }) => {
  console.log(`AI: ${text}`);
});
