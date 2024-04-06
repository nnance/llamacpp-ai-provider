import { createRequire } from "module";
const require = createRequire(import.meta.url);
const addon = require("../build/Release/llamacpp-bindings.node");

interface IllamacppBindingsNative {
  greet(strName: string): string;
}

export class LLamacppBindings {
  // private members
  private _addonInstance: IllamacppBindingsNative;

  constructor(name: string) {
    this._addonInstance = new addon.llamacppBindings(name);
  }

  greet(strName: string) {
    return this._addonInstance.greet(strName);
  }
}
