import { z } from "zod";
import { ErrorCode, ErrorMessage } from "./error-codes";

// ── 统一响应格式 ──
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T | null;
}

// ── 分页响应 ──
export interface PaginatedData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ── 成功响应 ──
export function success<T>(c: any, data: T, message?: string): Response {
  return c.json({
    code: ErrorCode.SUCCESS,
    message: message ?? ErrorMessage[ErrorCode.SUCCESS],
    data,
  });
}

// ── 分页响应 ──
export function paginated<T>(
  c: any,
  list: T[],
  total: number,
  page: number,
  pageSize: number,
): Response {
  return c.json({
    code: ErrorCode.SUCCESS,
    message: ErrorMessage[ErrorCode.SUCCESS],
    data: { list, total, page, pageSize },
  });
}

// ── 错误响应 ──
export function error(c: any, code: number, message?: string): Response {
  return c.json({
    code,
    message: message ?? ErrorMessage[code] ?? "未知错误",
    data: null,
  });
}

// ── 分页参数 schema ──
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
