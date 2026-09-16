import { templateContent } from "@/data/template-content";
import { translations } from "@/data/translations";
import { appendRow, isSheetsConfigured } from "@/lib/google-sheets";

/**
 * Saves one RSVP as a row in the Google Sheet named by `GOOGLE_SHEET_ID`.
 *
 * Everything the form sends is validated again here — the browser checks are
 * only a convenience — and the sheet credentials never leave the server.
 */

const errors = translations.rsvp.errors;
const { minGuests, maxGuests } = templateContent.rsvp;
const MAX_BODY_BYTES = 2048;
const MAX_NAME_LENGTH = 120;

const HEADER = ["Жөнөтүлгөн убакыт", "Аты-жөнү", "Жообу", "Коноктордун саны"];

const timestamp = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Bishkek",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function reply(status: number, message?: string) {
  return Response.json(
    status === 200 ? { success: true } : { success: false, message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

/** Blocks other websites from posting into the sheet through a guest's browser. */
function isCrossSite(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

export async function POST(request: Request) {
  if (isCrossSite(request)) return reply(403, errors.server);
  if (!isSheetsConfigured()) return reply(503, errors.config);

  const raw = await request.text().catch(() => "");
  if (Buffer.byteLength(raw) > MAX_BODY_BYTES) return reply(413, errors.server);

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) throw new Error();
    body = parsed as Record<string, unknown>;
  } catch {
    return reply(400, errors.server);
  }

  // Hidden field only bots fill in: pretend it worked and store nothing.
  if (typeof body.website === "string" && body.website.trim()) return reply(200);

  const guestName =
    typeof body.guestName === "string"
      ? body.guestName.replace(/[\p{Cc}\p{Cf}]/gu, "").replace(/\s+/g, " ").trim()
      : "";
  if (!guestName || guestName.length > MAX_NAME_LENGTH) return reply(400, errors.name);

  const attendance = body.attendance;
  if (attendance !== "yes" && attendance !== "no") return reply(400, errors.attendance);

  const guestCount = attendance === "no" ? 0 : body.guestCount;
  if (
    attendance === "yes" &&
    (typeof guestCount !== "number" ||
      !Number.isInteger(guestCount) ||
      guestCount < minGuests ||
      guestCount > maxGuests)
  ) {
    return reply(400, errors.guestCount);
  }

  const answer =
    attendance === "no" ? "Келе албайт" : guestCount === 1 ? "Келет" : "Жубайы менен келет";

  try {
    await appendRow(HEADER, [timestamp.format(new Date()), guestName, answer, guestCount as number]);
  } catch (error) {
    console.error("RSVP could not be saved to Google Sheets", error);
    return reply(502, errors.server);
  }

  return reply(200);
}
