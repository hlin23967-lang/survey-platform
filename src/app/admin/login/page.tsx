"use client";

import { FormEvent, useState } from "react";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "登录失败");
        return;
      }

      if (data.token) {
        const secure = window.location.protocol === "https:" ? "; Secure" : "";
        document.cookie = `${SESSION_COOKIE}=${data.token}; Path=/; Max-Age=${SESSION_MAX_AGE}; SameSite=Lax${secure}`;
      }

      window.location.href = "/admin";
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">管理员登录</h1>
      <p className="mt-2 text-[var(--muted)]">
        演示密码：
        <code className="rounded bg-[var(--line)] px-1.5 py-0.5">admin123</code>
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">密码</span>
          <input
            type="text"
            inputMode="text"
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg-elevated)] px-3 py-2.5 outline-none focus:border-[var(--accent)]"
            placeholder="admin123"
            autoFocus
            required
          />
        </label>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
        >
          {loading ? "登录中…" : "登录"}
        </button>
      </form>
    </main>
  );
}
