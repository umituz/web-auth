import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "dom",
          environment: "jsdom",
          setupFiles: ["./src/test/dom-setup.ts"],
          include: ["src/**/*.test.tsx"],
        },
      },
      {
        test: {
          name: "node",
          environment: "node",
          include: ["src/**/*.test.ts"],
        },
      },
    ],
  },
});
