import { expect, test } from "vite-plus/test";
import { nestTokens } from "./theme";

test("Nest background 为米纸色 #FAF8F5", () => {
  expect(nestTokens.background.toUpperCase()).toBe("#FAF8F5");
});

test("Nest primary 为交互青绿 #0F766E", () => {
  expect(nestTokens.primary.toUpperCase()).toBe("#0F766E");
});

test("Nest foreground 为墨色 #1C1917", () => {
  expect(nestTokens.foreground.toUpperCase()).toBe("#1C1917");
});

test("Nest 语义色 success / warning / danger 已定义", () => {
  expect(nestTokens.success.toUpperCase()).toBe("#15803D");
  expect(nestTokens.warning.toUpperCase()).toBe("#D97706");
  expect(nestTokens.danger.toUpperCase()).toBe("#DC2626");
});
