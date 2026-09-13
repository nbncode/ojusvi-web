/**
 * Minimal transactional email helper (Resend REST API, edge/Worker safe).
 *
 * Requires the RESEND_API_KEY secret. The sending domain (ojusvi.app) must be
 * verified in Resend's dashboard before mail actually delivers.
 */

const FROM = "Ojusvi Alerts <alerts@ojusvi.app>";

export type SendEmailResult = { sent: boolean; error?: string };

export async function sendEmail({
  to,
  subject,
  body,
}: {
  to: string | string[];
  subject: string;
  body: string;
}): Promise<SendEmailResult> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    console.error("[email] RESEND_API_KEY is not set");
    return { sent: false, error: "RESEND_API_KEY is not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: FROM,
        to: Array.isArray(to) ? to : [to],
        subject,
        text: body,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`[email] Resend send failed [${res.status}]: ${errorBody}`);
      return { sent: false, error: `Resend failed [${res.status}]: ${errorBody}` };
    }

    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[email] Resend request threw: ${message}`);
    return { sent: false, error: message };
  }
}
