import { createHmac, timingSafeEqual } from "node:crypto";

function b64url(input: Buffer | string) {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf.toString("base64").replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function b64urlDecode(input: string) {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

/** Mint a short-lived HMAC-signed JWT-ish token. */
export function signToken(payload: Record<string, unknown>, ttlSeconds: number): string {
  const secret = process.env.LINK_SIGNING_SECRET;
  if (!secret) throw new Error("LINK_SIGNING_SECRET missing");
  const header = { alg: "HS256", typ: "JWT" };
  const body = { ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const h = b64url(JSON.stringify(header));
  const p = b64url(JSON.stringify(body));
  const sig = b64url(createHmac("sha256", secret).update(`${h}.${p}`).digest());
  return `${h}.${p}.${sig}`;
}

export function verifyToken<T = Record<string, unknown>>(token: string): T | null {
  const secret = process.env.LINK_SIGNING_SECRET;
  if (!secret) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  const expected = b64url(createHmac("sha256", secret).update(`${h}.${p}`).digest());
  const a = Buffer.from(s);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const body = JSON.parse(b64urlDecode(p).toString("utf8")) as { exp?: number };
    if (body.exp && body.exp < Math.floor(Date.now() / 1000)) return null;
    return body as T;
  } catch {
    return null;
  }
}

/** Normalise an Indian phone to E.164 (+91XXXXXXXXXX). Returns null if invalid. */
export function normalizeIndianPhone(raw: string): string | null {
  const digits = raw.replace(/\D+/g, "");
  if (digits.length === 10 && /^[6-9]/.test(digits)) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91") && /^[6-9]/.test(digits.slice(2))) return `+${digits}`;
  if (digits.length === 13 && digits.startsWith("091")) return `+${digits.slice(1)}`;
  return null;
}

export function maskPhone(phone: string): string {
  const last4 = phone.slice(-4);
  return `•••• ${last4}`;
}