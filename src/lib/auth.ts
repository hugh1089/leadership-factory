import { prisma } from "./db";
import { cookies } from "next/headers";

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + process.env.NEXTAUTH_SECRET);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
  const h = await hashPassword(password);
  return h === hashed;
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;
  if (!sessionToken) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(sessionToken, "base64").toString("utf-8")
    );
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return null;
    return { user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  } catch {
    return null;
  }
}

export function createSessionToken(userId: string): string {
  return Buffer.from(JSON.stringify({ userId, ts: Date.now() })).toString("base64");
}
