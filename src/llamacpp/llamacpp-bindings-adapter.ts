import { createRequire } from "module";
import { LLamaCppAdapter, LLamaCppPromptOptions } from "./llamacpp-adapter.js";
import ILLAMABindings from "../llamacpp-bindings.js";

const require = createRequire(import.meta.url);
const addon: ILLAMABindings = require("../../llamacpp/build/Release/llamacpp-bindings.node");

export class LLamaCppBindings implements LLamaCppAdapter {
  constructor(modelPath: string) {
    console.log(addon.systemInfo());
  }

  async evaluate(
    query: string,
    options?: LLamaCppPromptOptions | undefined
  ): Promise<string> {
    throw new Error("Method not implemented.");
  }
  prompt(
    text: string,
    options?: LLamaCppPromptOptions | undefined
  ): Promise<string> {
    throw new Error("Method not implemented.");
  }
  decode(batch: number[]): string {
    throw new Error("Method not implemented.");
  }
}
