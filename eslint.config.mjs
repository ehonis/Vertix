import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores([
    "**/node_modules",
    "**/.next",
    "**/build",
    "**/dist",
    "**/coverage",
    "**/public",
    "lib/testPrisma.js",
    "lib/updateSchema.js",
]), {
    extends: [...nextCoreWebVitals, ...compat.extends("prettier")],
}, {
    files: ["**/*.ts", "**/*.tsx"],

    extends: [
        ...nextCoreWebVitals,
        ...compat.extends("plugin:@typescript-eslint/recommended"),
        ...compat.extends("prettier")
    ],

    rules: {
        "@typescript-eslint/no-unused-vars": "warn",
        "@typescript-eslint/no-this-alias": "error",
        "@typescript-eslint/no-require-imports": "error",
        "@typescript-eslint/no-explicit-any": "off",
        "no-prototype-builtins": "error",
    },
}, {
    files: ["**/*.js", "**/*.jsx"],
    extends: [...nextCoreWebVitals, ...compat.extends("prettier")],

    rules: {
        "no-unused-vars": "warn",
    },
}]);