import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    name: "server",
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: {
      DATABASE_URL: "postgresql://reno:reno@localhost:5432/reno_test",
      JWT_SECRET: "reno-test-secret-at-least-16-characters",
      ENABLE_REGISTRATION: "false",
    },
  },
});
