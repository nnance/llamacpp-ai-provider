import { experimental_streamText } from "ai";
import { LLamaCpp } from "../index.js";
import { fileURLToPath } from "url";
import path from "path";
import { stdout } from "process";

const modelPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../models",
  "llama-2-7b-chat.Q4_K_M.gguf"
);

const llamacpp = new LLamaCpp(modelPath);

experimental_streamText({
  model: llamacpp.completion(),
  prompt: "Invent a new holiday and describe its traditions.",
}).then(async (result) => {
  stdout.write("\nAssistant: ");
  for await (const delta of result.textStream) {
    stdout.write(delta);
  }
});
