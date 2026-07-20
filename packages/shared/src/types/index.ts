// 统一 API 响应 + 领域类型 re-export

export interface ApiResponse<T> {
  /** 0=成功, 非0=错误码 */
  code: number;
  message: string;
  data: T;
}

export interface PaginatedData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;

/** 常见错误码（前后端约定，可扩展） */
export const API_ERROR_CODES = {
  OK: 0,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  /** 非法状态迁移 */
  INVALID_TRANSITION: 422,
  /** 业务约束（如删除被关联空间） */
  BUSINESS_RULE: 42201,
  INTERNAL: 500,
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export * from "./domain.js";
