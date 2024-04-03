# Building a simple Chatbot CLI with LLamaCpp and Vercel AI

## Installation

```bash
npm install --save ai llamacpp-ai-provider
```

The example below expects the llama-2 model file installed in the `models` folder in the project root folder. You can download a GGUF compatible file from [Hugging Face](https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/tree/main).

## Usage

```typescript
import * as readline from "node:readline/promises";
import { fileURLToPath } from "url";
import path from "path";

import { ExperimentalMessage, experimental_streamText } from "ai";
import { LLamaCpp } from "llamacpp-ai-provider";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelPath = path.join(
  __dirname,
  "../models",
  "llama-2-7b-chat.Q4_K_M.gguf"
);

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const messages: ExperimentalMessage[] = [];

async function main() {
  const llamacpp = new LLamaCpp({ modelPath });
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

main().catch(console.error);
```
