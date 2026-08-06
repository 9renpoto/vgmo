import preact from "@astrojs/preact";
import tailwind from "@astrojs/tailwind";
import codecovAstroPlugin from "@codecov/astro-plugin";
import { defineConfig } from "astro/config";
// https://astro.build/config
export default defineConfig({
  integrations: [
    preact(),
    tailwind(),
    codecovAstroPlugin({
      enableBundleAnalysis: true,
      bundleName: "vgmo-web",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
});
