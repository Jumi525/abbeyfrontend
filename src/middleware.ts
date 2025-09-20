import { NextResponse } from "next/server";
import { auth } from "./lib/auth";

export default auth((req) => {
  const publicRoutes = [/^\/(auth|api)(\/.*)?$/, /^\/$/];

  const { nextUrl } = req;
  const isLoggedIn = req.auth !== null;

  const isPublicRoute = publicRoutes.some((route) =>
    route.test(nextUrl.pathname)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next|api/auth).*)", "/", "/(api|trpc)(.*)"],
};
