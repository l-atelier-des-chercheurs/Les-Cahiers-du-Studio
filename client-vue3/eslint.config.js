import { fileURLToPath } from "node:url";
import { defineConfig, includeIgnoreFile } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import pluginVue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

// components are in JavaScript, src/adc/ (API, sockets, session) in TypeScript
export default defineConfig([
  includeIgnoreFile(gitignorePath),
  { languageOptions: { globals: globals.browser } },
  { files: ["*.config.{js,ts}"], languageOptions: { globals: globals.node } },
  js.configs.recommended,
  pluginVue.configs["flat/essential"],
  { files: ["**/*.ts"], extends: [tseslint.configs.recommended] },
  {
    rules: {
      "vue/block-order": ["error", { order: ["template", "script", "style"] }],
    },
  },
  // formatting is Prettier's job: ESLint only reports code issues
  skipFormatting,
]);
