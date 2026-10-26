import { randomBytes, timingSafeEqual } from "node:crypto";

export function verifyPassword(input: string, expected: string): boolean {
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function parseSessionCookie(header: string | undefined): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === "dev-platform-session") return rest.join("=");
  }
  return null;
}
