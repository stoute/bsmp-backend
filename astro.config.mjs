import { defineConfig } from "astro/config";
import db from "@astrojs/db";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import solidJs from "@astrojs/solid-js";
import node from "@astrojs/node";
import vercel from "@astrojs/vercel";
import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  site: "https://bob-stoute.firebaseapp.com",

  // Use 'server' for SSR, 'static' is default - for SSG
  output: "server",

  base: "/",
  adapter: netlify(),
  // fixme: add node adapter firebase
  // adapter: node({
  //   mode: "middleware",
  // }),
  // adapter: vercel(),
  integrations: [
    mdx(),
    sitemap(),
    react({
      include: ["**/react/*"],
      experimentalReactChildren: true,
    }), // solidJs(),
    icon(),
    db(),
  ],

  experimental: {
    svg: true,
    responsiveImages: true,
  },

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: netlify(),
});
