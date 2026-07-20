// 敏感字段过滤：未登录时隐藏金额相关字段
const SENSITIVE_FIELDS = [
  "unitPrice",
  "totalPrice",
  "amount",
  "depositAmount",
  "budget",
  "passwordHash",
] as const;

export function filterSensitive<T>(data: T, isAuthenticated: boolean): T {
  if (isAuthenticated) return data;

  if (Array.isArray(data)) {
    return data.map((d) => omitSensitive(d)) as T;
  }
  return omitSensitive(data) as T;
}

function omitSensitive<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };
  for (const field of SENSITIVE_FIELDS) {
    delete result[field];
  }
  return result;
}

// 手机号脱敏：中间四位 ****
export function maskPhone(phone: string | null | undefined): string | null {
  if (!phone || phone.length < 7) return phone ?? null;
  return phone.slice(0, 3) + "****" + phone.slice(-4);
}
