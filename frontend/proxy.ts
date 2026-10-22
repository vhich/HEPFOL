// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "./app/auth/callback/route";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  // const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage = request.nextUrl.pathname.startsWith("/login");
  //   const isCallbackPage = request.nextUrl.pathname.startsWith("/auth");

  if (!user && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api/webhooks/stripe|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
