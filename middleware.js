import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  const isAdminArea = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isInquiryArea = pathname.startsWith("/inquiry") && pathname !== "/inquiry/login";

  if (isAdminArea) {
    const cookie = req.cookies.get("mt_admin");
    if (!cookie || cookie.value !== "ok") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (isInquiryArea) {
    const cookie = req.cookies.get("mt_rep");
    if (!cookie || cookie.value !== "ok") {
      const url = req.nextUrl.clone();
      url.pathname = "/inquiry/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/inquiry/:path*"],
};
