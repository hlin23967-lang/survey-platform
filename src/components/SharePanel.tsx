"use client";

import { useState } from "react";
import { CopyLinkButton } from "./CopyLinkButton";

export function SharePanel({ url, title }: { url: string; title?: string }) {
  const [open, setOpen] = useState(false);
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`;

  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      <CopyLinkButton url={url} />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-md border border-[var(--line)] bg-white px-3 py-1.5 text-sm font-medium hover:border-[var(--accent)]"
      >
        {open ? "收起二维码" : "二维码"}
      </button>
      {open && (
        <div className="basis-full rounded-xl border border-[var(--line)] bg-white p-4">
          {title && <p className="mb-2 text-sm font-medium">{title}</p>}
          <img
            src={qrSrc}
            alt="问卷二维码"
            width={220}
            height={220}
            className="mx-auto"
          />
          <p className="mt-3 break-all text-center font-mono text-xs text-[var(--muted)]">
            {url}
          </p>
        </div>
      )}
    </div>
  );
}
