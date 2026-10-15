import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium tracking-wide text-[var(--accent)]">Survey Platform</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">
        问卷小平台
      </h1>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-[var(--muted)]">
        创建问卷、生成分享链接、手机填写、后台查看与导出答卷。
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/admin"
          className="rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
        >
          进入管理后台
        </Link>
        <Link
          href="/admin/login"
          className="rounded-lg border border-[var(--line)] bg-[var(--bg-elevated)] px-5 py-3 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--accent)]"
        >
          管理员登录
        </Link>
      </div>
    </main>
  );
}
