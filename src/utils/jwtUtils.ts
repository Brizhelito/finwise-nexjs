// utils/jwt.ts

export async function verifyJWT(
  token: string,
  secretKey: Uint8Array
): Promise<Record<string, unknown> | null> {
  try {
    const [, payload, signature] = token
      .split(".")
      .map((part) =>
        Buffer.from(part.replace(/-/g, "+").replace(/_/g, "/"), "base64")
      );

    const data = `${token.split(".")[0]}.${token.split(".")[1]}`;
    const key = await crypto.subtle.importKey(
      "raw",
      secretKey,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      new TextEncoder().encode(data)
    );
    
    return isValid ? JSON.parse(new TextDecoder().decode(payload)) : null;
  } catch (error) {
    console.error("Error verifying JWT:", error);
    return null;
  }
}
