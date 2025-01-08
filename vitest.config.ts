/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
    ],
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    maxConcurrency: 1,
    maxWorkers: 1,
    testTimeout: 10000,
    hookTimeout: 10000,
    isolate: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@config": path.resolve(__dirname, "./config"),
    },
  },
});
