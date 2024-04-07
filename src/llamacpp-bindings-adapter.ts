import { createRequire } from "module";
import {
  LLamaCppAdapter,
  LLamaCppEvaluateOptions,
} from "./llamacpp-adapter.js";
import ILLAMABindings, { LLAMAContext } from "./llamacpp-bindings.js";

const require = createRequire(import.meta.url);
const addon: ILLAMABindings = require("../llamacpp/build/Release/llamacpp-bindings.node");

export class LLamaCppBindings implements LLamaCppAdapter {
  private ctx: LLAMAContext;

  constructor(modelPath: string) {
    this.ctx = new addon.LLAMAContext(modelPath);
  }

  async evaluate(
    query: string,
    options?: LLamaCppEvaluateOptions | undefined
  ): Promise<string> {
    async function* evalGenerator(ctx: LLAMAContext, tokens: Uint32Array) {
      let evalTokens = tokens;
      const tokenEos = ctx.tokenEos();

      while (true) {
        // Evaluate to get the next token.
        const nextToken = await ctx.evaluate(evalTokens);

        // the assistant finished answering
        if (nextToken === tokenEos) break;

        yield nextToken;

        // Create tokens for the next eval.
        evalTokens = Uint32Array.from([nextToken]);
      }
    }

    let results = "";
    const evalIterator = evalGenerator(this.ctx, this.ctx.encode(query));

    for await (const chunk of evalIterator) {
      const text = this.ctx.decode(Uint32Array.from([chunk]));
      results += text;
      if (options?.onToken) {
        options.onToken(text);
      }
    }
    return results;
  }
}
