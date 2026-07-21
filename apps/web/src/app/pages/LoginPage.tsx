import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LoginInput } from "@reno/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthSession } from "@/stores/auth-session";

export function LoginPage({ onSuccess }: { onSuccess?: () => void }) {
  const login = useAuthSession((s) => s.login);
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginInput>({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = login(form.username, form.password);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setError(null);
    onSuccess?.();
    void navigate("/", { replace: true });
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-[0_8px_24px_rgba(28,25,23,0.08)] sm:p-8">
        <div className="mb-7">
          <p className="text-sm font-bold tracking-tight">
            Reno <span className="text-primary">Nest</span>
          </p>
          <h1 className="mt-5 text-2xl font-bold tracking-[-0.02em]">欢迎回家</h1>
          <p className="mt-1 text-sm text-muted-foreground">登录暖巢，继续整理你的装修计划</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-semibold">
              用户名
            </label>
            <Input
              id="username"
              name="username"
              autoComplete="username"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold">
              密码
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full">
            登录
          </Button>
        </form>
      </div>
    </main>
  );
}
