import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    projects: [
      "apps/web/vite.config.ts",
      "apps/server/vite.config.ts",
      {
        test: {
          name: "shared",
          root: "./packages/shared",
          environment: "node",
          include: ["tests/**/*.test.ts"],
        },
      },
      {
        test: {
          name: "utils",
          root: "./packages/utils",
          environment: "node",
          include: ["tests/**/*.test.ts"],
        },
      },
    ],
  },
  staged: {
    "*": "vp check --fix",
  },
  // `vp fmt` / `vp check` — Oxfmt 统一格式化
  fmt: {
    singleQuote: false,
    semi: true,
    sortPackageJson: true,
    ignorePatterns: ["dist/**", "node_modules/**", "coverage/**", "pnpm-lock.yaml"],
  },
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  // `vp run <task>` — 工作区级任务编排(脚本缓存开启)
  // 注:具体任务在各 package.json 的 scripts 中定义,通过 `vp run -r <name>` 递归执行
  run: {
    cache: true,
  },
});
