import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    // 98.css ships an invalid `@media (not(hover))` query that the default
    // lightningcss minifier hard-rejects; esbuild tolerates it.
    cssMinify: 'esbuild',
  },
  test: {
    // Unit/integration tests only. The Playwright E2E specs under e2e/ use their
    // own runner (`npm run e2e`) — Vitest must not try to execute them.
    include: ['src/**/*.test.ts'],
  },
});
