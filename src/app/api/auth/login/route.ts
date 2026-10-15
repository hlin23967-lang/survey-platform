import { NextResponse } from "next/server";
import { checkAdminPassword, createSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";

  if (!checkAdminPassword(password)) {
    return NextResponse.json(
      { error: "密码错误，请输入 admin123" },
      { status: 401 }
    );
  }

  const token = await createSessionToken();
  // Also return token so the browser can set the cookie itself (more reliable behind tunnels)
  return NextResponse.json({ ok: true, token });
}
