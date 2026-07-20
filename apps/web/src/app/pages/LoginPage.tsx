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
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">登录</h1>
        <p className="mt-1 text-sm text-muted-foreground">业主装修管家 · 暖巢</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium">
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
          <label htmlFor="password" className="text-sm font-medium">
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
  );
}
