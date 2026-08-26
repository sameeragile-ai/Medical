import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  const isProtectedArea =
    (pathname.startsWith("/admin") && pathname !== "/admin/login") ||
    (pathname.startsWith("/inquiry") && pathname !== "/inquiry/login");

  if (isProtectedArea) {
    const cookie = req.cookies.get("mt_admin");
    if (!cookie || cookie.value !== "ok") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/inquiry/:path*"],
};
