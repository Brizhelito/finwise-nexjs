import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function createAccessToken(userId: number) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("2h")
    .sign(secret);

  return token;
}

export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.userId;
  } catch (error) {
    return new Error("Token inválido o expirado: " + (error as Error).message);
  }
}

export async function createRefreshToken(userId: number) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);

  return token;
}
export async function verifyRefreshToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.userId;
  } catch (error) {
    return new Error("Token inválido o expirado: " + (error as Error).message);
  }
}
export async function createSession(userId: number) {
  const accessToken = await createAccessToken(userId);
  const refreshToken = await createRefreshToken(userId);
  const cookieStore = await cookies();
  cookieStore.set("authVerified", "true");
  cookieStore.set("x-user-id", userId.toString());
  cookieStore.set("accessToken", accessToken);
  cookieStore.set("refreshToken", refreshToken);
  return { accessToken, refreshToken };
}
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("authVerified");
  cookieStore.delete("x-user-id");
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
}
export async function refreshSession(refreshToken: string) {
  const userId = (await verifyRefreshToken(refreshToken)) as number;
  const accessToken = await createAccessToken(userId as number);
  const cookieStore = await cookies();
  cookieStore.set("authVerified", "true");
  cookieStore.set("x-user-id", userId.toString());
  cookieStore.set("accessToken", accessToken);
  cookieStore.set("refreshToken", refreshToken);
  return { accessToken, refreshToken };
}
export async function getSession() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  return { accessToken, refreshToken };
}
export async function verifySession() {
  const cookieStore = await cookies();
  const authVerified = cookieStore.get("authVerified")?.value;
  return authVerified === "true";
}
export async function verifySessionAndRefresh() {
  const cookieStore = await cookies();
  const authVerified = cookieStore.get("authVerified")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (!authVerified || !refreshToken) {
    return false;
  }
  try {
    await verifyRefreshToken(refreshToken);
    return true;
  } catch {
    return false;
  }
}
