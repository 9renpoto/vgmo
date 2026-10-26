import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import type { StorybookConfig } from "@storybook/preact-vite";

const require = createRequire(import.meta.url);

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],

  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-vitest"),
  ],

  framework: {
    name: getAbsolutePath("@storybook/preact-vite"),
    options: {},
  },
};

export default config;

function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, "package.json")));
}
