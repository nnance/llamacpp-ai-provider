# Create Your Own Local Chatbot with Next.js, Llama.cpp, and Vercel AI

Building a [Next.js](https://nextjs.org/) chatbot that runs on your computer. We'll use [Llama.cpp](https://github.com/ggerganov/llama.cpp) to serve the [OpenHermes 2.5 Mistral](https://huggingface.co/teknium/OpenHermes-2.5-Mistral-7B) LLM (large language model) locally, the [Vercel AI SDK](https://github.com/vercel/ai) to handle stream forwarding and rendering, and [llamacpp-ai-provider](https://github.com/nnance/llamacpp-ai-provider) to integrate Llama.cpp with the Vercel AI SDK. The chatbot will be able to generate responses to user messages in real-time.

This guide explains step by step how to build the chatbot. Let's get started!

## Creating the Next.js Project

Start by creating the foundational structure of our chatbot using [Next.js](https://nextjs.org/). Next.js will be used to build our chatbot application's frontend and API routes.

Here are the steps to create the Next.js project:

1. Execute the following command in your terminal to create a new Next.js project:

   ```sh
   npx create-next-app@latest llamacpp-nextjs-chatbot
   ```

2. You will be prompted to configure various aspects of your Next.js application. Here are the settings for our chatbot project:

   ```
   Would you like to use TypeScript? Yes
   Would you like to use ESLint? Yes
   Would you like to use Tailwind CSS? Yes
   Would you like to use `src/` directory? Yes
   Would you like to use App Router? (recommended) Yes
   Would you like to customize the default import alias? No
   ```

   These settings enable TypeScript for robust type-checking, ESLint for code quality, and Tailwind CSS for styling. Using the src/ directory and App Router enhances the project structure and routing capabilities.

3. Once the project is initialized, navigate to the project directory:

   ```sh
   cd llamacpp-nextjs-chatbot
   ```

By following these steps, you have successfully created and configured your Next.js project. This forms the base of our chatbot application, where we will later integrate the AI functionalities using Llama.cpp and ModelFusion. The next part of the tutorial will guide you through installing additional libraries and setting up the backend logic for the chatbot.

:::tip
You can verify your setup by running `npm run dev` in your terminal and navigating to [http://localhost:3000](http://localhost:3000) in your browser. You should see the default Next.js page.
:::

## Installing the Required Libraries

We will need two libraries to build our chatbot:

- **Vercel AI SDK**: The [Vercel AI SDK](https://github.com/vercel/ai) provides React hooks for creating chats (`useChat`) as well as streams that forward AI responses to the frontend (`StreamingTextResponse`).
- **LlamaCPP Vercel AI Provider**: The [Llama.cpp integration](https://modelfusion.dev/integration/model-provider/llamacpp) that we will use to access the Llama 2 model.

You can run the following command in the chatbot project directory to install all libraries:

```sh
npm install --save ai llamacpp-ai-provider
```

You have now installed all the libraries required for building the chatbot. The next section of the tutorial will guide you through creating an API route for handling chat interactions.

## Creating an API Route for the Chatbot

Creating the API route for the [Next.js app router](https://nextjs.org/docs/app) is the next step in building our chatbot. The API route will handle the chat interactions between the user and the AI.

Create the `api/chat/` directory in `src/app/` directory of your project and create a new file named `route.ts` to serve as our API route file.

The API route requires several important imports from the `ai` and `llamacpp-ai-provider` libraries. These imports bring in necessary classes and functions for streaming AI responses and processing chat messages.

```ts
import {
  ExperimentalMessage,
  Message,
  StreamingTextResponse,
  experimental_streamText,
} from "ai";
import { LLamaCpp } from "llamacpp-ai-provider";
```

We need a helper function to convert the standard Vercel AI chat messages:

```ts
function asExperimentalMessages(messages: Message[]): ExperimentalMessage[] {
  return messages.map(({ role, content }) => ({
    role: role === "user" ? "user" : "assistant",
    content,
  }));
}
```

Initialize and load the model via LlamaCpp. _NOTE_: this is using a module global and this pattern isn't recommended for production applications.

```ts
const llamacpp = new LLamaCpp();
const model = llamacpp.chat();
```

The route itself is a POST request that takes a list of messages as input:

```ts
export async function POST(req: Request) {
  // useChat will send a JSON with a messages property:
  const { messages }: { messages: Message[] } = await req.json();

  // ...
}
```

We initialize Vercel AI text streaming in the POST handler:

```ts
const result = await experimental_streamText({
  model,
  system: "You are an AI chatbot. Follow the user's instructions carefully.",
  messages: asExperimentalMessages(messages),
});
```

Finally you can return the streaming text response fromn the POST handler with the Vercel AI SDK:

```ts
// Return the result using the Vercel AI SDK:
return new StreamingTextResponse(result.textStream);
```

## Adding the Chat Interface

We need to create a dedicated chat page to bring our chatbot to life on the frontend. This page will be located at `src/app/page.tsx` and will leverage the useChat hook from the Vercel AI SDK. The `useChat` hook calls the `/api/chat` route and processes the streaming response as an array of messages, rendering each token as it arrives.

```tsx
// src/app/page.tsx
"use client";

import { useChat } from "ai/react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((message) => (
        <div
          key={message.id}
          className="whitespace-pre-wrap"
          style={{ color: message.role === "user" ? "black" : "green" }}
        >
          <strong>{`${message.role}: `}</strong>
          {message.content}
          <br />
          <br />
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
```

It's important to clean up the global styles for a more visually appealing chat interface. By default, the Next.js page is dark. We clean up `src/app/globals.css` to make it readable:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Getting a model file

We recommend you to get a GGUF model from the TheBloke on Hugging Face.

We recommend you to start by getting a small model that doesn't have a lot of parameters just to ensure everything works, so try downloading a 7B parameters model first (search for models with both 7B and GGUF in their name).

For improved download speeds, you can use ipull to download the model:

```bash
npx ipull <model-file-ul>
```

## Downloading LLama 2 7B Chat GGUF

You'll need to pull the specific LLM we will be using for this project, [Llama 2](https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF).

1. [Download the Llama 2 model from HuggingFace](https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/tree/main). I'll use `llama-2-7b-chat.Q4_K_M.gguf` in this tutorial.

2. Move the model file into the `models/` directory of this project.

3. Define a NextJS environment variable for the model location:

```bash
# .env.local
MODEL_PATH=/path/to/your/model
```

## Running the Chatbot Application

With the chat page in place, it's time to run our chatbot app and see the result of our hard work.

You can launch the development server by running the following command in your terminal:

```sh
npm run dev
```

You can now navigate to [http://localhost:3000](http://localhost:3000) in your browser to see the chat page. You can interact with the chatbot by typing messages into the input field. The chatbot will respond to your messages in real-time.

## Conclusion

And there you have it—a fully functional local chatbot built with Next.js, Llama.cpp, and ModelFusion at your fingertips. We've traversed the path from setting up our development environment, integrating a robust language model, and spinning up a user-friendly chat interface.

The code is intended as a starting point for your projects. Have fun exploring!
