import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// the `@/` alias of tsconfig, so tests can import project modules the same way the site does
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
});
