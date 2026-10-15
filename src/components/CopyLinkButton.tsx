"use client";

import { useState } from "react";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("复制链接：", url);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-md border border-[var(--line)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--ink)] hover:border-[var(--accent)]"
    >
      {copied ? "已复制" : "复制链接"}
    </button>
  );
}
