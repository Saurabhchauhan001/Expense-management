import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const protectedPaths = ["/dashboard", "/transactions", "/budget-planner", "/profile"];

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (!protectedPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // If user is not authenticated, redirect to signin
  if (!token) {
    const signInUrl = new URL("/auth/signin", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/transactions/:path*", "/budget-planner/:path*", "/profile/:path*"],
};