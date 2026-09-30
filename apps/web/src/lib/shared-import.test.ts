import { expect, test } from "vite-plus/test";
import { PROJECT_STATUS, PROJECT_STATUS_LABEL, yuanToFen } from "@reno/shared";

test("PROJECT_STATUS 可从 @reno/shared 导入且为 PRD r1.7 五态", () => {
  expect(PROJECT_STATUS).toHaveLength(5);
  expect(PROJECT_STATUS).toEqual(["planning", "active", "accepting", "done", "archived"]);
});

test("yuanToFen(1) === 100", () => {
  expect(yuanToFen(1)).toBe(100);
});

test('PROJECT_STATUS_LABEL.active === "进行中"', () => {
  expect(PROJECT_STATUS_LABEL.active).toBe("进行中");
});
