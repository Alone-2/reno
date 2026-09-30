import { expect, test } from "vite-plus/test";
import { buildTodoItems } from "../src/modules/todo/service.js";
import {
  canTransitionViolation,
  violationActionLabel,
} from "../src/modules/inspection/workflow.js";
import { canTransitionAcceptance } from "../src/modules/acceptance/workflow.js";

test("r1.7 待办聚合覆盖行动、问题、采购到货、付款、阶段和验收", () => {
  const items = buildTodoItems(
    "project-a",
    {
      actions: [
        {
          id: "t1",
          title: "确认厨房插座位置",
          type: "decision",
          priority: "urgent",
          status: "todo",
          dueDate: "2026-08-06",
        },
      ],
      issues: [
        {
          id: "i1",
          title: "卫生间墙砖空鼓",
          severity: "high",
          status: "fixing",
          dueDate: "2026-08-10",
        },
        {
          id: "i2",
          title: "柜门收口",
          severity: "medium",
          status: "resolved",
          dueDate: null,
        },
      ],
      materials: [
        { id: "m1", name: "地砖", quantity: "20", unit: "箱", category: "主材", status: "todo" },
        {
          id: "m2",
          name: "木地板",
          quantity: "30",
          unit: "㎡",
          category: "主材",
          status: "ordered",
          expectedArrivalDate: "2026-08-09",
        },
      ],
      payments: [
        {
          id: "pay1",
          title: "水电阶段款",
          payableAmount: 20000,
          paidAmount: 10000,
          status: "partial",
          dueDate: "2026-08-10",
          conditionStatus: "met",
        },
      ],
      phases: [
        {
          id: "p1",
          phaseName: "拆改",
          status: "ongoing",
          isPrimaryCurrent: true,
          progressPercent: 60,
          plannedEnd: "2026-08-20",
        },
        {
          id: "p2",
          phaseName: "水电",
          status: "pending",
          isPrimaryCurrent: false,
          progressPercent: 0,
          plannedEnd: "2026-08-01",
        },
      ],
      acceptances: [
        { id: "a1", type: "phase", result: "rectification", notes: "补齐防水记录" },
        { id: "a2", type: "final", result: "passed", notes: null },
      ],
    },
    new Date("2026-08-07T00:00:00.000Z"),
  );

  expect(items.map((item) => item.id)).toEqual([
    "action:t1",
    "issue:i1",
    "phase:p2",
    "acceptance:a1",
    "issue:i2",
    "delivery:m2",
    "payment:pay1",
    "material:m1",
    "phase:p1",
  ]);
  expect(items.find((item) => item.id === "issue:i2")?.title).toContain("待复核");
  expect(items.find((item) => item.id === "payment:pay1")?.subtitle).toContain("付款条件已有依据");
});

test("整改问题只能按 pending → resolved → rechecked 闭环", () => {
  expect(canTransitionViolation("pending", "resolved")).toBe(true);
  expect(canTransitionViolation("resolved", "rechecked")).toBe(true);
  expect(canTransitionViolation("pending", "rechecked")).toBe(false);
  expect(canTransitionViolation("rechecked", "pending")).toBe(false);
  expect(violationActionLabel("pending")).toBe("标记已整改");
  expect(violationActionLabel("resolved")).toBe("确认复查通过");
  expect(violationActionLabel("rechecked")).toBeNull();
});

test("验收整改只能进入通过或驳回", () => {
  expect(canTransitionAcceptance("rectification", "passed")).toBe(true);
  expect(canTransitionAcceptance("rectification", "rejected")).toBe(true);
  expect(canTransitionAcceptance("passed", "rectification")).toBe(false);
  expect(canTransitionAcceptance("rejected", "passed")).toBe(false);
});
