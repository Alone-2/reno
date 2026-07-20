import { expect, test } from "vite-plus/test";
import { PROJECT_STATUS, PROJECT_STATUS_LABEL, yuanToFen } from "@reno/shared";

test("PROJECT_STATUS 可从 @reno/shared 导入且为 PRD 六态", () => {
  expect(PROJECT_STATUS).toHaveLength(6);
  expect(PROJECT_STATUS).toEqual([
    "planning",
    "purchasing",
    "constructing",
    "accepting",
    "done",
    "archived",
  ]);
});

test("yuanToFen(1) === 100", () => {
  expect(yuanToFen(1)).toBe(100);
});

test('PROJECT_STATUS_LABEL.planning === "规划中"', () => {
  expect(PROJECT_STATUS_LABEL.planning).toBe("规划中");
});
