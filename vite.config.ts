import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // 98.css ships an invalid `@media (not(hover))` query that the default
    // lightningcss minifier hard-rejects; esbuild tolerates it.
    cssMinify: 'esbuild',
  },
});
