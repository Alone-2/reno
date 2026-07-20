// 统一错误码定义
export const ErrorCode = {
  // 成功
  SUCCESS: 0,

  // 参数校验 1xxx
  VALIDATION_ERROR: 1001,
  INVALID_PARAMS: 1002,

  // 认证 2xxx
  UNAUTHORIZED: 2001,
  TOKEN_EXPIRED: 2002,
  TOKEN_INVALID: 2003,
  LOGIN_FAILED: 2004,
  REGISTRATION_DISABLED: 2005,

  // 权限 3xxx
  FORBIDDEN: 3001,

  // 资源 4xxx
  NOT_FOUND: 4001,
  ALREADY_EXISTS: 4002,

  // 服务器 5xxx
  INTERNAL_ERROR: 5001,
  DATABASE_ERROR: 5002,
  FILE_UPLOAD_ERROR: 5003,
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export const ErrorMessage = {
  [ErrorCode.SUCCESS]: "ok",
  [ErrorCode.VALIDATION_ERROR]: "参数校验失败",
  [ErrorCode.INVALID_PARAMS]: "参数无效",
  [ErrorCode.UNAUTHORIZED]: "未登录",
  [ErrorCode.TOKEN_EXPIRED]: "Token 已过期",
  [ErrorCode.TOKEN_INVALID]: "Token 无效",
  [ErrorCode.LOGIN_FAILED]: "用户名或密码错误",
  [ErrorCode.REGISTRATION_DISABLED]: "注册已关闭",
  [ErrorCode.FORBIDDEN]: "无权限",
  [ErrorCode.NOT_FOUND]: "资源不存在",
  [ErrorCode.ALREADY_EXISTS]: "资源已存在",
  [ErrorCode.INTERNAL_ERROR]: "服务器内部错误",
  [ErrorCode.DATABASE_ERROR]: "数据库错误",
  [ErrorCode.FILE_UPLOAD_ERROR]: "文件上传失败",
};
