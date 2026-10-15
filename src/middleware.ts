import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE, getSessionSecret } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "未登录" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    try {
      await jwtVerify(token, getSessionSecret());
      return NextResponse.next();
    } catch {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "登录已过期" }, { status: 401 });
      }
      const res = NextResponse.redirect(new URL("/admin/login", request.url));
      res.cookies.delete(SESSION_COOKIE);
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
