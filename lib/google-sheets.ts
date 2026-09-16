import "server-only";
import { createSign } from "node:crypto";

/**
 * Minimal Google Sheets writer for the RSVP route.
 *
 * Signs a service-account JWT with `node:crypto` and calls the Sheets REST API
 * directly, so no Google SDK is bundled. Credentials come only from server
 * environment variables — none of them carry the `NEXT_PUBLIC_` prefix, so they
 * never reach the browser.
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SHEETS_URL = "https://sheets.googleapis.com/v4/spreadsheets";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const TIMEOUT_MS = 8000;

interface Credentials {
  clientEmail: string;
  privateKey: string;
  sheetId: string;
  /** Tab to write to; the first tab when unset. */
  sheetName: string;
}

function readCredentials(): Credentials | null {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim();
  const sheetId = process.env.GOOGLE_SHEET_ID?.trim();
  // Vercel and most .env files store the PEM on one line with literal `\n`.
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\\n/g, "\n");
  if (!clientEmail || !sheetId || !privateKey) return null;
  return {
    clientEmail,
    privateKey,
    sheetId,
    sheetName: process.env.GOOGLE_SHEET_NAME?.trim() ?? "",
  };
}

export function isSheetsConfigured(): boolean {
  return readCredentials() !== null;
}

let cachedToken: { value: string; expiresAt: number } | null = null;

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

async function accessToken(credentials: Credentials): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt - 60 > now) return cachedToken.value;

  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: credentials.clientEmail,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );
  const signature = createSign("RSA-SHA256")
    .update(`${header}.${claims}`)
    .sign(credentials.privateKey)
    .toString("base64url");

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claims}.${signature}`,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  const result = (await response.json().catch(() => null)) as {
    access_token?: string;
    expires_in?: number;
  } | null;
  if (!response.ok || !result?.access_token) {
    throw new Error(`Google token request failed with ${response.status}`);
  }

  cachedToken = { value: result.access_token, expiresAt: now + (result.expires_in ?? 3600) };
  return cachedToken.value;
}

function range(credentials: Credentials, cells: string): string {
  const tab = credentials.sheetName.replace(/'/g, "''");
  return encodeURIComponent(tab ? `'${tab}'!${cells}` : cells);
}

async function sheetsRequest(
  credentials: Credentials,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = await accessToken(credentials);
  const response = await fetch(`${SHEETS_URL}/${encodeURIComponent(credentials.sheetId)}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Google Sheets request failed with ${response.status}: ${detail.slice(0, 300)}`);
  }
  return response;
}

/** The header row is written once per warm instance, and only on an empty sheet. */
let headerChecked = false;

export type SheetRow = (string | number)[];

/**
 * Appends one row, writing `header` first when the sheet is still empty.
 *
 * Values go in as `RAW`, so a guest typing `=IMPORTXML(…)` stores plain text
 * instead of a live formula.
 */
export async function appendRow(header: SheetRow, row: SheetRow): Promise<void> {
  const credentials = readCredentials();
  if (!credentials) throw new Error("Google Sheets is not configured");

  const rows: SheetRow[] = [row];
  if (!headerChecked) {
    const response = await sheetsRequest(credentials, `/values/${range(credentials, "A1:A1")}`);
    const existing = (await response.json()) as { values?: unknown[][] };
    if (!existing.values?.length) rows.unshift(header);
    headerChecked = true;
  }

  await sheetsRequest(
    credentials,
    `/values/${range(credentials, "A1")}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    { method: "POST", body: JSON.stringify({ values: rows }) },
  );
}
