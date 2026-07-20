import { API_ERROR_CODES } from "@reno/shared";
import { expect, test, vi } from "vite-plus/test";
import { ApiError, apiRequest, getApiBaseUrl } from "./api-client";

test("code=0 返回 data", async () => {
  const fetchImpl = vi.fn(
    async () =>
      new Response(JSON.stringify({ code: 0, message: "ok", data: { id: "1" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
  ) as unknown as typeof fetch;

  const data = await apiRequest<{ id: string }>("/projects", undefined, fetchImpl);
  expect(data).toEqual({ id: "1" });
  expect(fetchImpl).toHaveBeenCalled();
});

test("code≠0 throw 带 message", async () => {
  const fetchImpl = vi.fn(
    async () =>
      new Response(JSON.stringify({ code: 400, message: "坏请求", data: null }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
  ) as unknown as typeof fetch;

  await expect(apiRequest("/x", undefined, fetchImpl)).rejects.toMatchObject({
    name: "ApiError",
    code: 400,
    message: "坏请求",
  });
});

test("401 可识别", async () => {
  const fetchImpl = vi.fn(
    async () =>
      new Response(
        JSON.stringify({
          code: API_ERROR_CODES.UNAUTHORIZED,
          message: "未登录",
          data: null,
        }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      ),
  ) as unknown as typeof fetch;

  try {
    await apiRequest("/me", undefined, fetchImpl);
    expect.fail("should throw");
  } catch (e) {
    expect(e).toBeInstanceOf(ApiError);
    expect((e as ApiError).isUnauthorized).toBe(true);
  }
});

test("getApiBaseUrl 默认 /api", () => {
  expect(getApiBaseUrl().length).toBeGreaterThan(0);
});
