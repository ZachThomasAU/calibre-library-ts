import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
    pool: "forks",
    poolOptions: {
      forks: { // We need to run tests sequentially as calibredb only supports one instance running at a time.
        singleFork: true
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        "src/"
      ],
      exclude: [
        '**/*.d.ts',
        '**/__tests__/**'
      ]
    }
  }
});
