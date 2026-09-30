import { defineConfig } from "vite-plus";

export default defineConfig({
  // `vp pack` — tsdown 打包为库(生成 DTS)
  pack: { deps: { resolveDepSubpath: true }, dts: true, sourcemap: true },
  // `vp test` — Vitest
  test: {
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
  },
  lint: {
    options: { typeAware: true, typeCheck: true },
  },
  fmt: {},
});
