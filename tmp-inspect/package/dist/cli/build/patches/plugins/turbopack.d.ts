import type { CodePatcher } from "@opennextjs/aws/build/patch/codePatcher.js";
/**
 * Replace Turbopack's `loadWebAssemblyModule` with a call to our generated `loadWasmChunk`.
 *
 * The original implementation uses `WebAssembly.compileStreaming`, which is not available
 * in workerd. `loadWasmChunk` resolves the chunk via a static `import()` switch so the
 * bundler can statically discover and bundle each `.wasm` chunk.
 */
export declare const replaceLoadWebAssemblyModuleRule = "\nrule:\n  kind: function_declaration\n  has:\n    field: name\n    regex: \"^loadWebAssemblyModule$\"\nfix: |-\n  function loadWebAssemblyModule(chunkPath, _edgeModule) {\n    return loadWasmChunk(chunkPath);\n  }\n";
/**
 * Replace Turbopack's `loadWebAssembly` with a synchronous-instantiation variant.
 *
 * The original implementation uses `WebAssembly.instantiateStreaming`, which is not
 * available in workerd. We load the compiled module via `loadWasmChunk` and then call
 * the synchronous `WebAssembly.instantiate` to produce the instance's exports.
 */
export declare const replaceLoadWebAssemblyRule = "\nrule:\n  kind: function_declaration\n  has:\n    field: name\n    regex: \"^loadWebAssembly$\"\nfix: |-\n  async function loadWebAssembly(chunkPath, _edgeModule, imports) {\n    const mod = await loadWasmChunk(chunkPath);\n    const { exports } = await WebAssembly.instantiate(mod, imports);\n    return exports;\n  }\n";
export declare const patchTurbopackRuntime: CodePatcher;
/**
 * Generate a `loadWasmChunk` function that maps a `.next`-relative chunk path to a
 * statically-importable `.wasm` module.
 *
 * The replacement rules for Turbopack's `loadWebAssembly{,Module}` delegate to this
 * function. Because the imports are emitted as string literals, the bundler can
 * statically discover every wasm chunk and include them in the final build.
 */
export declare function loadWasmChunkFn(tracedFiles: string[]): string;
