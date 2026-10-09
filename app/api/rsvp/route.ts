import { templateContent } from "@/data/template-content";
import { translations } from "@/data/translations";
import { appendGuest, sheetCredentials, type GuestRow } from "@/lib/google-sheets";

const { minGuests, maxGuests } = templateContent.rsvp;
const errors = translations.rsvp.errors;

/** A real answer is well under 300 characters; anything far larger is not one. */
const MAX_BODY_LENGTH = 2_000;
const MAX_NAME_LENGTH = 120;

/**
 * Receives the RSVP form and writes the answer to the hosts' Google Sheet.
 *
 * Responds with the `{ success, message? }` shape `lib/rsvp.ts` reads; any
 * `message` is shown to the guest as is, so it is always interface copy and
 * never an upstream error.
 */
export async function POST(request: Request) {
  if (!fromThisSite(request)) return reply(403);

  const credentials = sheetCredentials();
  if (!credentials) return reply(503, errors.config);

  const body = await request.text();
  if (body.length > MAX_BODY_LENGTH) return reply(413);

  const guest = parseGuest(body);
  if (!guest) return reply(400);

  try {
    await appendGuest(credentials, guest);
  } catch (error) {
    console.error("[rsvp] could not save the answer to Google Sheets", error);
    return reply(502);
  }
  return Response.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
}

function reply(status: number, message?: string) {
  return Response.json(
    { success: false, ...(message ? { message } : {}) },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * Browsers attach `Origin` to every POST, so a form on another site can't write
 * into the guest list. Clients that send no `Origin` at all aren't browsers and
 * are left to the validation below.
 */
function fromThisSite(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Mirrors the form's own checks; `null` for anything the form can't send. */
function parseGuest(body: string): GuestRow | null {
  let input: unknown;
  try {
    input = JSON.parse(body);
  } catch {
    return null;
  }
  if (typeof input !== "object" || input === null) return null;
  const { guestName, attendance, guestCount } = input as Record<string, unknown>;

  if (typeof guestName !== "string") return null;
  const name = guestName
    .replace(/[\p{Cc}\p{Cf}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!name || name.length > MAX_NAME_LENGTH) return null;

  if (attendance === "no") return { guestName: name, attendance, guestCount: 0 };
  if (attendance !== "yes") return null;
  if (!Number.isInteger(guestCount)) return null;
  const count = guestCount as number;
  if (count < minGuests || count > maxGuests) return null;
  return { guestName: name, attendance, guestCount: count };
}
