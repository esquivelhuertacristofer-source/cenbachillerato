/**
 * Patches @opennextjs/cloudflare's turbopack.js to fix the empty requireChunk bug.
 *
 * Root cause: patchTurbopackRuntime generates requireChunk() from tracedFiles,
 * but tracedFiles only contains nft.json entries (external deps). Turbopack SSR
 * chunks are not in nft.json, so the switch is always empty → ChunkLoadError
 * at runtime → 500 on every route.
 *
 * Fix: when tracedFiles has no SSR chunks, scan the actual SSR directory using
 * the filePath parameter passed to the patchCode callback.
 *
 * This script is run as a postinstall step so the fix survives npm install.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const turbopackPath = path.join(
  __dirname,
  "..",
  "node_modules",
  "@opennextjs",
  "cloudflare",
  "dist",
  "cli",
  "build",
  "patches",
  "plugins",
  "turbopack.js"
);

if (!fs.existsSync(turbopackPath)) {
  console.error(`turbopack.js not found at ${turbopackPath}`);
  process.exit(1);
}

let content = fs.readFileSync(turbopackPath, "utf-8");

// Check if already patched
if (content.includes("Turbopack SSR chunks are not in nft.json")) {
  console.log("turbopack.js already patched. Skipping.");
  process.exit(0);
}

const OLD_GET = `function getInlinableChunks(tracedFiles) {
    const chunks = new Set();
    for (const file of tracedFiles) {
        if (file === "[turbopack]_runtime.js") {
            continue;
        }
        if (file.includes(".next/server/chunks/")) {
            chunks.add(file);
        }
    }
    return Array.from(chunks);
}
function inlineChunksFn(tracedFiles) {
    // From the outputs, we extract every chunks
    const chunks = getInlinableChunks(tracedFiles);`;

const NEW_GET = `function getInlinableChunks(tracedFiles, filePath) {
    const chunks = new Set();
    for (const file of tracedFiles) {
        if (file === "[turbopack]_runtime.js") {
            continue;
        }
        if (file.includes(".next/server/chunks/")) {
            chunks.add(file);
        }
    }
    // Fallback: Turbopack SSR chunks are not in nft.json (tracedFiles only has external deps).
    // Scan the actual SSR directory using the runtime file's path.
    if (chunks.size === 0 && filePath) {
        const ssrDir = path.dirname(filePath);
        if (fs.existsSync(ssrDir)) {
            for (const entry of fs.readdirSync(ssrDir)) {
                if (entry === "[turbopack]_runtime.js")
                    continue;
                if (entry.endsWith(".js") || entry.endsWith(".mjs")) {
                    // Normalize to forward slashes so the regex in inlineChunksFn works cross-platform.
                    chunks.add(path.join(ssrDir, entry).replace(/\\\\/g, "/"));
                }
            }
        }
    }
    return Array.from(chunks);
}
function inlineChunksFn(tracedFiles, filePath) {
    // From the outputs, we extract every chunks
    const chunks = getInlinableChunks(tracedFiles, filePath);`;

const OLD_CALL = `return \`\${patched}
\${inlineChunksFn(tracedFiles)}\\n\${loadWasmChunkFn(tracedFiles)}\`;`;

const NEW_CALL = `return \`\${patched}
\${inlineChunksFn(tracedFiles, filePath)}\\n\${loadWasmChunkFn(tracedFiles)}\`;`;

if (!content.includes(OLD_GET)) {
  console.error("ERROR: getInlinableChunks pattern not found. turbopack.js may have changed.");
  process.exit(1);
}
if (!content.includes(OLD_CALL)) {
  console.error("ERROR: inlineChunksFn call pattern not found. turbopack.js may have changed.");
  process.exit(1);
}

content = content.replace(OLD_GET, NEW_GET);
content = content.replace(OLD_CALL, NEW_CALL);
fs.writeFileSync(turbopackPath, content, "utf-8");
console.log("Patched turbopack.js: requireChunk now scans SSR directory when tracedFiles has no chunks.");
