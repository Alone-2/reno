import { defineConfig } from "vite-plus";

export default defineConfig({
  // `vp test` — Vitest(node 环境,测试 Hono 路由)
  test: {
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
  },
  lint: {
    options: { typeAware: true, typeCheck: true },
  },
  fmt: {},
});
