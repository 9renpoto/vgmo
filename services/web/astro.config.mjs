import preact from "@astrojs/preact";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
// https://astro.build/config
export default defineConfig({
  site: "https://vgmo.pages.dev",
  integrations: [preact()],
  vite: {
    plugins: [tailwindcss()],
  },
});
