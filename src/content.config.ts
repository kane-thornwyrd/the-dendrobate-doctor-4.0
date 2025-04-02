import { defineCollection } from 'astro:content';
import wordLoader from 'astro-word-loader';

const edl = defineCollection({
  loader: wordLoader({
    sources: ['./src/content/articles/*.docx'],
    styleMap: ['p[style-name="Section Title"] => h1:fresh']
  })
})

export const collections = { edl };