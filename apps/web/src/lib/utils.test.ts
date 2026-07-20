import { expect, test } from "vite-plus/test";
import { cn } from "./utils";

test("cn 合并多个类名", () => {
  expect(cn("px-2", "py-1")).toBe("px-2 py-1");
});

test("cn 通过 tailwind-merge 解决冲突类", () => {
  // 后写的 px-4 应覆盖 px-2
  expect(cn("px-2", "px-4")).toBe("px-4");
});

test("cn 过滤假值", () => {
  expect(cn("px-2", false, null, undefined, "py-1")).toBe("px-2 py-1");
});
