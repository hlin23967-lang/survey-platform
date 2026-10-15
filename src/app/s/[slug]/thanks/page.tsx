type Params = { params: Promise<{ slug: string }> };

export default async function ThanksPage({ params }: Params) {
  await params;
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6 py-16 text-center">
      <p className="text-sm font-medium text-[var(--accent)]">提交成功</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">感谢填写</h1>
      <p className="mt-3 text-[var(--muted)]">你的答卷已收到，可以关闭此页面。</p>
    </main>
  );
}
