import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/AdminHeader";
import { SharePanel } from "@/components/SharePanel";
import { headers } from "next/headers";

export default async function AdminHomePage() {
  const surveys = await prisma.survey.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { responses: true, questions: true } },
    },
  });

  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const forwardedProto = h.get("x-forwarded-proto");
  const proto =
    forwardedProto ||
    (host.includes("lhr.life") || host.includes("loca.lt") ? "https" : "http");
  const origin = `${proto}://${host}`;

  return (
    <>
      <AdminHeader />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">我的问卷</h1>
            <p className="mt-1 text-[var(--muted)]">创建、发布并分享填写链接</p>
          </div>
          <Link
            href="/admin/surveys/new"
            className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
          >
            新建问卷
          </Link>
        </div>

        {surveys.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-[var(--line)] bg-[var(--bg-elevated)] px-6 py-16 text-center">
            <p className="text-[var(--muted)]">还没有问卷，先创建一份吧</p>
            <Link
              href="/admin/surveys/new"
              className="mt-4 inline-block text-sm font-semibold text-[var(--accent)]"
            >
              新建问卷 →
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {surveys.map((s) => {
              const publicUrl = `${origin}/s/${s.slug}`;
              return (
                <li
                  key={s.id}
                  className="rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-lg font-semibold">{s.title}</h2>
                        <StatusBadge status={s.status} />
                      </div>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {s._count.questions} 题 · {s._count.responses} 份答卷
                      </p>
                      {s.status === "published" && (
                        <p className="mt-2 truncate font-mono text-xs text-[var(--muted)]">
                          {publicUrl}
                        </p>
                      )}
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/surveys/${s.id}`}
                          className="rounded-md border border-[var(--line)] bg-white px-3 py-1.5 text-sm font-medium hover:border-[var(--accent)]"
                        >
                          编辑
                        </Link>
                        <Link
                          href={`/admin/surveys/${s.id}/responses`}
                          className="rounded-md border border-[var(--line)] bg-white px-3 py-1.5 text-sm font-medium hover:border-[var(--accent)]"
                        >
                          查看答卷
                        </Link>
                      </div>
                      {s.status === "published" && (
                        <SharePanel url={publicUrl} title={s.title} />
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const published = status === "published";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        published
          ? "bg-[var(--accent-soft)] text-[var(--accent)]"
          : "bg-[var(--line)] text-[var(--muted)]"
      }`}
    >
      {published ? "已发布" : "草稿"}
    </span>
  );
}
