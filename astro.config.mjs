import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import { emoteMap } from "./src/config/emotes.mjs";
import { remarkEmotes } from "./src/plugins/remarkEmotes.mjs";

export default defineConfig({
  site: "https://adrianmartinez.ch/",
  integrations: [sitemap(), icon()],
  markdown: {
    remarkPlugins: [[remarkEmotes, emoteMap]],
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  build: {
    inlineStylesheets: "always",
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
