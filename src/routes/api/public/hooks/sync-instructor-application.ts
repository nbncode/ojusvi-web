import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { timingSafeEqual } from "crypto";

const SPREADSHEET_ID = "1KZo3pksGwc0JzBhgzmgD3Dew0jB74ExZ1H9faMjmBI4";
const SHEET_GID = 151806191;
const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_sheets/v4";

const recordSchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().min(1).max(200),
  social: z.string().min(1).max(300),
  whatsapp: z.string().min(1).max(40),
  email: z.string().min(3).max(320),
  skill: z.string().min(1).max(200),
  availability: z.string().min(1).max(100),
  created_at: z.string().min(1).max(64),
});

const bodySchema = z.object({
  secret: z.string().min(1).max(512),
  record: recordSchema,
});

let cachedTabName: string | null = null;

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

function gatewayHeaders() {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
  if (!GOOGLE_SHEETS_API_KEY) throw new Error("GOOGLE_SHEETS_API_KEY is not configured");
  return {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    "X-Connection-Api-Key": GOOGLE_SHEETS_API_KEY,
    "Content-Type": "application/json",
  } as Record<string, string>;
}

async function resolveTabName(): Promise<string> {
  if (cachedTabName) return cachedTabName;
  const url = `${GATEWAY_URL}/spreadsheets/${SPREADSHEET_ID}?fields=sheets.properties`;
  const res = await fetch(url, { headers: gatewayHeaders() });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Failed to read spreadsheet metadata [${res.status}]: ${text}`);
  }
  const json = JSON.parse(text) as {
    sheets?: Array<{ properties?: { sheetId?: number; title?: string } }>;
  };
  const match = json.sheets?.find((s) => s.properties?.sheetId === SHEET_GID);
  const title = match?.properties?.title;
  if (!title) {
    throw new Error(`No sheet found with gid=${SHEET_GID} in spreadsheet ${SPREADSHEET_ID}`);
  }
  cachedTabName = title;
  return title;
}

async function appendRow(record: z.infer<typeof recordSchema>) {
  const tab = await resolveTabName();
  const range = `${tab}!A:H`;
  const url = `${GATEWAY_URL}/spreadsheets/${SPREADSHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const row = [
    record.created_at,
    record.name,
    record.email,
    record.whatsapp,
    record.social,
    record.skill,
    record.availability,
    record.id,
  ];
  const res = await fetch(url, {
    method: "POST",
    headers: gatewayHeaders(),
    body: JSON.stringify({ values: [row] }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Google Sheets append failed [${res.status}]: ${text}`);
  }
  return text;
}

export const Route = createFileRoute("/api/public/hooks/sync-instructor-application")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const SECRET = process.env.INSTRUCTOR_SYNC_SECRET;
        if (!SECRET) {
          return Response.json({ error: "INSTRUCTOR_SYNC_SECRET not configured" }, { status: 500 });
        }

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const parsed = bodySchema.safeParse(raw);
        if (!parsed.success) {
          return Response.json(
            { error: "Invalid payload", details: parsed.error.flatten() },
            { status: 400 },
          );
        }

        if (!safeEqual(parsed.data.secret, SECRET)) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
          await appendRow(parsed.data.record);
          return Response.json({ ok: true });
        } catch (err) {
          console.error("sync-instructor-application failed:", err);
          const message = err instanceof Error ? err.message : String(err);
          return Response.json({ ok: false, error: message }, { status: 502 });
        }
      },
    },
  },
});
