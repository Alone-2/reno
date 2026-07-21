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

function errorHttpStatus(code: number): number {
  switch (code) {
    case ErrorCode.VALIDATION_ERROR:
    case ErrorCode.INVALID_PARAMS:
      return 400;
    case ErrorCode.UNAUTHORIZED:
    case ErrorCode.TOKEN_EXPIRED:
    case ErrorCode.TOKEN_INVALID:
    case ErrorCode.LOGIN_FAILED:
      return 401;
    case ErrorCode.REGISTRATION_DISABLED:
    case ErrorCode.FORBIDDEN:
      return 403;
    case ErrorCode.NOT_FOUND:
      return 404;
    case ErrorCode.ALREADY_EXISTS:
      return 409;
    default:
      return 500;
  }
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
  return c.json(
    {
      code,
      message: message ?? ErrorMessage[code] ?? "未知错误",
      data: null,
    },
    errorHttpStatus(code),
  );
}

// ── 分页参数 schema ──
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
