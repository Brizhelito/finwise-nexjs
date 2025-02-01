import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { refreshSession } from "@/lib/session";
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

  const refreshTokenValue = request.cookies.get("refreshToken")?.value;
  const isAuthenticated = request.cookies.has("authVerified");

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
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
