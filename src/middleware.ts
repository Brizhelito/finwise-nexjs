import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { refreshSession } from "@/lib/session";
import { rateLimit } from "./utils/rate-limit";
const privateRoutes = [
  "/dashboard",
  "/profile",
  "/transaction",
  "/savinggoals",
];
const publicRoutes = ["/login", "/signup", "/", "/about"];
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = privateRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);
  const isSensitiveApiRoute = path.startsWith("/api/");
  const refreshTokenValue = request.cookies.get("refreshToken")?.value;
  const isAuthenticated = request.cookies.has("authVerified");

  if (isSensitiveApiRoute) {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const method = request.method.toUpperCase(); // Get the method

    try {
      if (method === "GET") {
        // Apply different limit for GET
        await rateLimit({ ip: ip as string, limit: 500, windowMs: 60 * 1000 }); // Higher limit for GET
      } else {
        await rateLimit({ ip: ip as string, limit: 1, windowMs: 60 * 1000 }); // Existing limit for other methods
      }
    } catch {
      const error = "Rate limit exceeded";
      return new NextResponse(`{ "error": ${error}}`, { status: 429 });
    }
  }


  // Verificar el token sólo si está presente
  if (!isAuthenticated && refreshTokenValue) {
    try {
      if (refreshTokenValue) {
        await refreshSession(refreshTokenValue);
      }
    } catch (error) {
      console.error("Error al verificar el refreshToken:", error);
    }
  }
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
 matcher : "/((?!_next/static|_next/image|favicon.ico).*)",
};
