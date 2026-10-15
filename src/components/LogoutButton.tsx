"use client";

import { SESSION_COOKIE } from "@/lib/session";

export function LogoutButton() {
  return (
    <button
      type="button"
      className="text-sm text-[var(--muted)] hover:text-[var(--ink)]"
      onClick={async () => {
        document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        window.location.href = "/admin/login";
      }}
    >
      退出
    </button>
  );
}
