// Shared helpers for the Golden Years guide gate (Cloudflare Pages Functions).
// No dependencies. Uses WebCrypto, available in Workers and Node 18+.

const enc = new TextEncoder();
const dec = new TextDecoder();

export const COOKIE_PENDING = 'gy_p';   // after name+mobile saved (1 hour)
export const COOKIE_TAPPED = 'gy_t';    // after the WhatsApp button was tapped (1 hour)
export const COOKIE_SESSION = 'gy_s';   // guide unlocked (30 days)
export const SESSION_DAYS = 30;

// ---------- base64url ----------
export function b64uFromBytes(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function bytesFromB64u(str) {
  const pad = str.length % 4 ? '='.repeat(4 - (str.length % 4)) : '';
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/') + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

// ---------- HMAC ----------
async function hmacKey(secret) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
export async function hmacBytes(secret, data) {
  const key = await hmacKey(secret);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

// ---------- signed tokens (stateless) ----------
export async function signToken(secret, payload) {
  const body = b64uFromBytes(enc.encode(JSON.stringify(payload)));
  const sig = b64uFromBytes(await hmacBytes(secret, body));
  return body + '.' + sig;
}
export async function verifyToken(secret, token, expectedType) {
  if (!secret || !token || typeof token !== 'string') return null;
  const i = token.indexOf('.');
  if (i < 1) return null;
  const body = token.slice(0, i);
  const sig = token.slice(i + 1);
  const key = await hmacKey(secret);
  let ok = false;
  try {
    ok = await crypto.subtle.verify('HMAC', key, bytesFromB64u(sig), enc.encode(body));
  } catch (e) { return null; }
  if (!ok) return null;
  let p;
  try { p = JSON.parse(dec.decode(bytesFromB64u(body))); } catch (e) { return null; }
  if (!p || (expectedType && p.t !== expectedType)) return null;
  if (p.exp && Date.now() > p.exp) return null;
  return p;
}

// ---------- cookies ----------
export function readCookie(request, name) {
  const h = request.headers.get('Cookie') || '';
  for (const part of h.split(/;\s*/)) {
    const eq = part.indexOf('=');
    if (eq > 0 && part.slice(0, eq) === name) return part.slice(eq + 1);
  }
  return null;
}
export function setCookie(name, value, maxAgeSec) {
  return `${name}=${value}; Path=/; Max-Age=${maxAgeSec}; HttpOnly; Secure; SameSite=Lax`;
}

// ---------- phone / name ----------
export function normPhone(v) {
  let d = String(v == null ? '' : v).replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}
export function cleanName(v) {
  let s = String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f​-‏‪-‮⁦-⁩<>]/g, '').replace(/\s+/g, ' ').trim();
  if (s.length < 2 || s.length > 60) return null;
  if (/^[=+\-@]/.test(s)) s = "'" + s;   // stop spreadsheet formula injection
  return s;
}

// ---------- opaque referral code (reversible, stateless) ----------
// 34-bit Feistel permutation of the 10-digit mobile, keyed by the secret.
// The share link carries this code, never the raw number.
async function round(secret, r, x) {
  const h = await hmacBytes(secret, r + ':' + x);
  return ((h[0] << 16) | (h[1] << 8) | h[2]) & 0x1ffff;
}
export async function refEncode(secret, mobile10) {
  const n = BigInt(mobile10);
  let L = Number((n >> 17n) & 0x1ffffn);
  let R = Number(n & 0x1ffffn);
  for (let r = 0; r < 4; r++) {
    const f = await round(secret, r, R);
    [L, R] = [R, L ^ f];
  }
  return ((BigInt(L) << 17n) | BigInt(R)).toString(36);
}
export async function refDecode(secret, code) {
  if (!/^[0-9a-z]{1,8}$/.test(code || '')) return null;
  let v;
  try { v = BigInt(parseInt(code, 36)); } catch (e) { return null; }
  if (v >= (1n << 34n)) return null;
  let L = Number((v >> 17n) & 0x1ffffn);
  let R = Number(v & 0x1ffffn);
  for (let r = 3; r >= 0; r--) {
    const f = await round(secret, r, L);
    [L, R] = [R ^ f, L];
  }
  const n = ((BigInt(L) << 17n) | BigInt(R)).toString();
  return normPhone(n);
}

// ---------- next session label (IST) ----------
export function nextSessionLabel(env, now = new Date()) {
  if (env && env.NEXT_SESSION_TEXT) return String(env.NEXT_SESSION_TEXT);
  const ist = new Date(now.getTime() + 5.5 * 3600 * 1000);
  let add = (6 - ist.getUTCDay() + 7) % 7;
  if (add === 0 && ist.getUTCHours() >= 20) add = 7;      // Saturday evening: show next week
  const d = new Date(ist.getTime() + add * 86400000);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `Saturday, ${d.getUTCDate()} ${months[d.getUTCMonth()]}`;
}

// ---------- Apps Script bridge ----------
export async function callSheet(env, body) {
  if (!env.GUIDE_APPS_SCRIPT_URL || !env.GUIDE_APPS_SCRIPT_SECRET) throw new Error('sheet not configured');
  const r = await fetch(env.GUIDE_APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...body, secret: env.GUIDE_APPS_SCRIPT_SECRET }),
    redirect: 'follow',
  });
  const text = await r.text();
  let j;
  try { j = JSON.parse(text); } catch (e) { throw new Error('sheet bad response'); }
  if (!j || !j.ok) throw new Error('sheet error: ' + (j && j.error));
  return j;
}

// ---------- responses ----------
export function json(obj, status = 200, extraHeaders = {}) {
  const h = new Headers({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extraHeaders });
  return new Response(JSON.stringify(obj), { status, headers: h });
}
export function jsonWithCookies(obj, cookies, status = 200) {
  const h = new Headers({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  for (const c of cookies) h.append('Set-Cookie', c);
  return new Response(JSON.stringify(obj), { status, headers: h });
}
export function inlineConfig(htmlStr, cfg) {
  // safe for embedding in <script>: escape < and U+2028/9
  const j = JSON.stringify(cfg).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return htmlStr.replace('/*GY_CONFIG*/{}', j);
}
export function htmlResponse(body, extra = {}) {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      'Referrer-Policy': 'no-referrer',
      ...extra,
    },
  });
}
