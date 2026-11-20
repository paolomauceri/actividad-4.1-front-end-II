import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globalSetup: './tests/global-setup.js',
    // Los tests comparten la base torneos_test: se ejecutan en serie.
    fileParallelism: false,
    testTimeout: 15000,
    hookTimeout: 60000,
  },
});
