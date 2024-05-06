import * as readline from "node:readline/promises";

import { ExperimentalMessage, experimental_streamText } from "ai";
import { LLamaCpp } from "../index.js";

const model = process.argv[2];
if (!model) {
  throw new Error("Missing model path argument");
}

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const messages: ExperimentalMessage[] = [];

async function main(modelPath: string) {
  const llamacpp = new LLamaCpp(modelPath);
  const model = llamacpp.chat();

  while (true) {
    const userInput = await terminal.question("You: ");

    messages.push({ role: "user", content: userInput });

    const result = await experimental_streamText({
      model,
      system: `You are a helpful, respectful and honest assistant.`,
      messages,
    });

    let fullResponse = "";
    process.stdout.write("\nAssistant: ");

    for await (const delta of result.textStream) {
      fullResponse += delta;
      process.stdout.write(delta);
    }
    process.stdout.write("\n\n");

    messages.push({ role: "assistant", content: fullResponse });
  }
}

main(model).catch(console.error);
