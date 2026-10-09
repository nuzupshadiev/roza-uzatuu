import "server-only";
import { createSign } from "node:crypto";

/**
 * Appends RSVP answers to the hosts' Google Sheet as a service account.
 *
 * Talks to the Sheets REST API directly — a signed JWT exchanged for an access
 * token — so the deployment carries no Google SDK. The credentials are plain
 * server environment variables and never reach the browser; the sheet only has
 * to be shared with `GOOGLE_CLIENT_EMAIL` as an editor.
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SHEETS_URL = "https://sheets.googleapis.com/v4/spreadsheets";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";
/** A guest waiting on the form should never wait on Google for long. */
const TIMEOUT_MS = 10_000;

/** Written once, into row 1 of the first tab, when the sheet is still empty. */
const HEADER = ["Жөнөтүлгөн убакыт", "Аты-жөнү", "Жооп", "Коноктордун саны"];

export interface SheetCredentials {
  clientEmail: string;
  privateKey: string;
  sheetId: string;
}

export interface GuestRow {
  guestName: string;
  attendance: "yes" | "no";
  guestCount: number;
}

/** `null` until all three variables are set, so the form can say so. */
export function sheetCredentials(): SheetCredentials | null {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim();
  const sheetId = process.env.GOOGLE_SHEET_ID?.trim();
  // Dashboards often store the key on one line with literal `\n`s, and some
  // keep the quotes it was pasted with.
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.trim()
    .replace(/^"|"$/g, "")
    .replace(/\\n/g, "\n");
  if (!clientEmail || !sheetId || !privateKey) return null;
  return { clientEmail, privateKey, sheetId };
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function accessToken({ clientEmail, privateKey }: SheetCredentials): Promise<string> {
  // Reused across warm invocations, with a minute's margin before it lapses.
  if (cachedToken && cachedToken.expiresAt - 60_000 > Date.now()) return cachedToken.value;

  const now = Math.floor(Date.now() / 1000);
  const unsigned = [
    { alg: "RS256", typ: "JWT" },
    { iss: clientEmail, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 },
  ]
    .map((part) => Buffer.from(JSON.stringify(part)).toString("base64url"))
    .join(".");
  const signature = createSign("RSA-SHA256").update(unsigned).sign(privateKey, "base64url");

  const result = await google<{ access_token: string; expires_in: number }>(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
  });
  cachedToken = { value: result.access_token, expiresAt: Date.now() + result.expires_in * 1000 };
  return result.access_token;
}

let headerWritten: Promise<void> | null = null;

/**
 * Labels the columns the first time this instance writes. Row 1 is only
 * written while it is blank, so a sheet the hosts already arranged is left as
 * it is.
 */
function ensureHeader(token: string, sheetId: string): Promise<void> {
  headerWritten ??= (async () => {
    const range = encodeURIComponent("A1:D1");
    const current = await google<{ values?: string[][] }>(
      `${SHEETS_URL}/${sheetId}/values/${range}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (current.values?.length) return;
    await google(`${SHEETS_URL}/${sheetId}/values/${range}?valueInputOption=RAW`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [HEADER] }),
    });
  })().catch((error: unknown) => {
    headerWritten = null;
    throw error;
  });
  return headerWritten;
}

export async function appendGuest(credentials: SheetCredentials, guest: GuestRow): Promise<void> {
  const token = await accessToken(credentials);
  await ensureHeader(token, credentials.sheetId);

  const row = [
    bishkekTimestamp(new Date()),
    guest.guestName,
    guest.attendance === "yes" ? "Келет" : "Келбейт",
    guest.guestCount,
  ];
  const range = encodeURIComponent("A:D");
  // RAW stores every value as typed, so a name like `=IMPORTXML(…)` stays text
  // instead of becoming a formula in the hosts' sheet.
  await google(
    `${SHEETS_URL}/${credentials.sheetId}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [row] }),
    },
  );
}

/** `2026-11-13 16:00:05` in Bishkek time — readable, and sorts as plain text. */
function bishkekTimestamp(date: Date): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Bishkek",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

async function google<T = unknown>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) {
    // Google's error body names the cause (sharing, a disabled API, a bad key);
    // it is for the server log only and never sent to the guest.
    const detail = await response.text().catch(() => "");
    throw new Error(`Google API ${response.status} for ${new URL(url).pathname}: ${detail.slice(0, 500)}`);
  }
  return (await response.json()) as T;
}
