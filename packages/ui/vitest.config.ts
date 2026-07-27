import path from "node:path";
import { fileURLToPath } from "node:url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      reporters: ["default", "junit"],
      outputFile: path.join(dirname, "junit.xml"),
      coverage: {
        exclude: ["src/**/*.stories.{ts,tsx}"],
        include: ["src/**/*.{ts,tsx}"],
        provider: "v8",
        reporter: ["text", "json", "lcov"],
        reportsDirectory: path.join(dirname, "coverage"),
      },
      projects: [
        {
          extends: true,
          optimizeDeps: {
            include: ["@testing-library/dom", "preact/jsx-dev-runtime"],
          },
          plugins: [
            storybookTest({
              configDir: path.join(dirname, ".storybook"),
            }),
          ],
          test: {
            name: "storybook",
            browser: {
              enabled: true,
              headless: true,
              provider: playwright({}),
              instances: [{ browser: "chromium" }],
            },
          },
        },
      ],
    },
  }),
);
