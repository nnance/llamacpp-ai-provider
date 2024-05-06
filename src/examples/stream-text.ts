import { experimental_streamText } from "ai";
import { LLamaCpp } from "../index.js";
import { stdout } from "process";

const model = process.argv[2];
if (!model) {
  throw new Error("Missing model path argument");
}

const llamacpp = new LLamaCpp(model);

experimental_streamText({
  model: llamacpp.completion(),
  prompt: "Invent a new holiday and describe its traditions.",
}).then(async (result) => {
  stdout.write("\nAssistant: ");
  for await (const delta of result.textStream) {
    stdout.write(delta);
  }
});
