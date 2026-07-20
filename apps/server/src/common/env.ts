import { z } from "zod";

// 环境变量校验：启动即检查，缺了直接报错
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: z.string().default("2h"),
  JWT_REFRESH_TTL: z.string().default("7d"),
  ENABLE_REGISTRATION: z
    .string()
    .transform((v) => v === "true")
    .default(false),
  PORT: z.coerce.number().default(3000),
  MAX_FILE_SIZE: z.coerce.number().default(20971520),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ 环境变量校验失败:");
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
