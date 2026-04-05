import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(scriptDir, "..");
const generatedRoot = resolve(webRoot, "convex", "_generated");
const mobileGeneratedRoot = resolve(webRoot, "..", "vertix-mobile", "convex", "_generated");

const filesToCopy = ["api.d.ts", "api.js", "dataModel.d.ts", "server.d.ts", "server.js"];

if (!existsSync(generatedRoot)) {
  throw new Error(`Missing Convex generated folder at ${generatedRoot}`);
}

mkdirSync(dirname(mobileGeneratedRoot), { recursive: true });
mkdirSync(mobileGeneratedRoot, { recursive: true });

for (const file of filesToCopy) {
  cpSync(resolve(generatedRoot, file), resolve(mobileGeneratedRoot, file));
}

console.log(`Synced Convex generated files to ${mobileGeneratedRoot}`);
