// Vitest 全局测试环境:注册 @testing-library/jest-dom 自定义匹配器
// (toBeInTheDocument / toHaveClass / ...)
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vite-plus/test";

afterEach(() => {
  cleanup();
});
