declare module "cloudflare:workers" {
  export const env: Record<string, string | undefined>;
  export function waitUntil(p: Promise<unknown>): void;
}
