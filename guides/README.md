# Gettting Started Guide

This is a complete list of guides and examples using Vercel AI and the llamacpp-ai-provider:

## Guides

- [llamacpp-chatbot-cli](./llamacpp-chatbot-cli.md): CLI Chatbot
- [llamacpp-nextjs-chatbot](./llamacpp-nextjs-chatbot.md): NextJS Web Chatbot

## Examples

You can run any of the following examples from the project root folder where the {modelPath} is the full path to the LLM to use:

```ssh
npx tsx ./src/examples/{example} {modelPath}
```

- [generate-text.ts](../src/examples/generate-text.ts): Text generation
- [stream-text.ts](../src/examples/stream-text.ts): Streaming text generation
- [streaming-chatbot.ts](../src/examples/streaming-chatbot.ts): Streaming Chatbot CLI
