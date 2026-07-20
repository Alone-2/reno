import { expect, test } from "vite-plus/test";
import { testClient } from "hono/testing";
import { app } from "../src/app.js";

// hono/testing 在当前版本对复杂 app 的类型推断为 unknown，运行期仍可用
const client = testClient(app) as any;

test("GET /api/health 返回 ok", async () => {
  const res = await client.api.health.$get();
  expect(res.status).toBe(200);
  const json = await res.json();
  expect(json.status).toBe("ok");
  expect(json.message).toBe("Reno API Server is running");
});

test("GET /api/projects 返回项目列表", async () => {
  const res = await client.api.projects.$get();
  expect(res.status).toBe(200);
  const json = await res.json();
  expect(json).toHaveLength(2);
  expect(json[0]).toHaveProperty("name");
});

test("GET /api/materials 返回材料列表", async () => {
  const res = await client.api.materials.$get();
  expect(res.status).toBe(200);
  const json = await res.json();
  expect(json.length).toBeGreaterThan(0);
});

test("未知路由返回 404", async () => {
  const res = await client.api.unknown.$get();
  expect(res.status).toBe(404);
});
