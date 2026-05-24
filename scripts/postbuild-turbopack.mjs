/**
 * Post-build patch for OpenNext + Turbopack on Cloudflare Workers.
 *
 * OpenNext's patchTurbopackRuntime generates requireChunk() from tracedFiles,
 * but tracedFiles only contains nft.json entries (external deps) — it never
 * includes Turbopack SSR chunks. The result is an empty switch that throws
 * "Not found" at runtime (ChunkLoadError → 500 on every route).
 *
 * This script patches handler.mjs AFTER the OpenNext build by replacing the
 * broken requireChunk with a proper switch that has a case for every SSR chunk.
 * The require() calls use paths relative to handler.mjs so wrangler's esbuild
 * step picks them up and bundles the chunks into the final worker.
 *
 * Run after `npx @opennextjs/cloudflare build`:
 *   node scripts/postbuild-turbopack.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const handlerPath = path.join(
  root,
  ".open-next",
  "server-functions",
  "default",
  "handler.mjs"
);
const ssrDir = path.join(
  root,
  ".open-next",
  "server-functions",
  "default",
  ".next",
  "server",
  "chunks",
  "ssr"
);

if (!fs.existsSync(handlerPath)) {
  console.error(`ERROR: handler.mjs not found at ${handlerPath}`);
  console.error("Run `npm run pages:build` first.");
  process.exit(1);
}

if (!fs.existsSync(ssrDir)) {
  console.error(`ERROR: SSR chunks directory not found at ${ssrDir}`);
  process.exit(1);
}

const chunks = fs
  .readdirSync(ssrDir)
  .filter((f) => f.endsWith(".js") && f !== "[turbopack]_runtime.js");

if (chunks.length === 0) {
  console.error("ERROR: No SSR chunk files found in", ssrDir);
  process.exit(1);
}

// Build switch cases.
// Case key: the .next-relative path the turbopack runtime requests.
// Require path: relative to handler.mjs so wrangler's esbuild can resolve it.
const cases = chunks
  .map((f) => `case "server/chunks/ssr/${f}":return require("./.next/server/chunks/ssr/${f}");`)
  .join("");

const patchedFn = `function requireChunk(chunkPath){switch(chunkPath){${cases}default:throw new Error(\`Not found \${chunkPath}\`)}}`;

const BROKEN = `function requireChunk(chunkPath){throw new Error(\`Not found \${chunkPath}\`)}`;

let content = fs.readFileSync(handlerPath, "utf-8");

if (!content.includes(BROKEN)) {
  // The turbopack.js fix is working — requireChunk already has switch cases.
  console.log("requireChunk already contains switch cases. No patch needed.");
  process.exit(0);
}

content = content.replace(BROKEN, patchedFn);
fs.writeFileSync(handlerPath, content, "utf-8");

console.log(`Patched requireChunk with ${chunks.length} SSR chunk cases in handler.mjs`);
