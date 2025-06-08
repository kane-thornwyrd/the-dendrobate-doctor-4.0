// @ts-check
import mdx from "@astrojs/mdx"
import react from "@astrojs/react"
import sitemap from "@astrojs/sitemap"
import tailwindcss from "@tailwindcss/vite"
import icon from "astro-icon"
// import opengraphImages, { presets } from "astro-opengraph-images"
import pageInsight from "astro-page-insight"
import pagefind from "astro-pagefind"
import { defineConfig } from "astro/config"

// https://astro.build/config
export default defineConfig({
  experimental: {
    svg: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  // site: "https://www.the-dendrobate-doctor.fr",
  base: "",
  trailingSlash: "never",
  integrations: [
    mdx({
      shikiConfig: {
        themes: {
          light: "catppuccin-macchiato",
          dark: "catppuccin-latte",
        },
      },
    }),
    sitemap(),
    react(),
    icon(),
    pagefind(),
    // opengraphImages({
    //   options: {
    //     fonts: [
    //       {
    //         name: "Roboto",
    //         weight: 400,
    //         style: "normal",
    //         data: fs.readFileSync("node_modules/@fontsource/roboto/files/roboto-latin-400-normal.woff"),
    //       },
    //     ],
    //   },
    //   render: presets.blackAndWhite,
    // }),
    // ,
    pageInsight(),
  ],
})
