import type { ApiResponse } from "@reno/shared";
import { API_ERROR_CODES } from "@reno/shared";

export class ApiError extends Error {
  readonly code: number;
  readonly status: number;

  constructor(code: number, message: string, status = 400) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }

  get isUnauthorized(): boolean {
    return this.code === API_ERROR_CODES.UNAUTHORIZED || this.status === 401;
  }
}

export function getApiBaseUrl(): string {
  const env = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return (env && env.replace(/\/$/, "")) || "/api";
}

type FetchLike = typeof fetch;

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
  fetchImpl: FetchLike = fetch,
): Promise<T> {
  const url = path.startsWith("http")
    ? path
    : `${getApiBaseUrl()}${path.startsWith("/") ? "" : "/"}${path}`;
  const res = await fetchImpl(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers instanceof Headers
        ? Object.fromEntries(init.headers.entries())
        : Array.isArray(init?.headers)
          ? Object.fromEntries(init.headers)
          : (init?.headers ?? {})),
    },
  });

  let body: ApiResponse<T> | null = null;
  try {
    body = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(
      res.status === 401 ? API_ERROR_CODES.UNAUTHORIZED : API_ERROR_CODES.INTERNAL,
      res.statusText || "Invalid JSON response",
      res.status,
    );
  }

  if (body.code !== API_ERROR_CODES.OK) {
    throw new ApiError(body.code, body.message || "Request failed", res.status);
  }

  return body.data;
}
