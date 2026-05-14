import preact from "@astrojs/preact";
import codecovAstroPlugin from "@codecov/astro-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
// https://astro.build/config
export default defineConfig({
  integrations: [
    preact(),
    codecovAstroPlugin({
      enableBundleAnalysis: true,
      bundleName: "vgmo-web",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
