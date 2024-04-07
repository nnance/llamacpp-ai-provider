# llamacpp-ai-provider

Vercel AI Provider for running Large Language Models locally using LLamaCpp without a server

## :construction::construction: WARNING! Under Construction :construction::construction:

This project is under active construction and current depends on the node-llama-cpp library. This will be replaced by a low level API with direct integration to LLamaC++ library. See the roadmap section for more details.

## Features

- Vercel AI full stack support
- Run local LLMs directly without server dependency
- Supported by most of the models that are supported by the LLamaC++ library

## Roadmap

- [x] Direct integration with LLamaC++
- [x] Support Completion Language Model

## Installation

```bash
npm install --save ai llamacpp-ai-provider
```

The example below expects the llama-2 model file installed in the `models` folder in the project root folder. You can download a GGUF compatible file from [Hugging Face](https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/tree/main).

## Usage

```typescript
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
```

> For more examples, see the [getting started guide](https://github.com/nnance/llamacpp-ai-provider/tree/main/guides)
