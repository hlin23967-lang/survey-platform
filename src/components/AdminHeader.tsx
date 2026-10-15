import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

export function AdminHeader() {
  return (
    <header className="border-b border-[var(--line)] bg-[var(--bg-elevated)]/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/admin" className="text-lg font-semibold tracking-tight">
          问卷管理
        </Link>
        <LogoutButton />
      </div>
    </header>
  );
}
