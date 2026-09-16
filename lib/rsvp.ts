export type Attendance = "yes" | "no";

/**
 * Same-origin route that writes the answer to Google Sheets. The sheet
 * credentials stay on the server; the browser only ever talks to this path.
 */
const RSVP_ENDPOINT = "/api/rsvp";

export interface RsvpPayload {
  guestName: string;
  attendance: Attendance;
  guestCount: number;
  /** Honeypot — always empty for real guests. */
  website: string;
}

/**
 * Thrown when the guest can still fix the problem by trying again — the caller
 * keeps the form filled in and shows `message`.
 */
export class RsvpError extends Error {
  constructor(
    message: string,
    readonly kind: "config" | "network" | "server",
  ) {
    super(message);
    this.name = "RsvpError";
  }
}

export interface SubmitInput {
  guestName: string;
  attendance: Attendance;
  guestCount: number;
  website: string;
}

interface RsvpMessages {
  network: string;
  server: string;
}

export async function submitRsvp(
  input: SubmitInput,
  messages: RsvpMessages,
  signal?: AbortSignal,
): Promise<void> {
  const payload: RsvpPayload = {
    guestName: input.guestName.trim(),
    attendance: input.attendance,
    guestCount: input.attendance === "no" ? 0 : input.guestCount,
    website: input.website,
  };

  let response: Response;
  try {
    response = await fetch(RSVP_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });
  } catch {
    throw new RsvpError(messages.network, "network");
  }

  const result: unknown = await response.json().catch(() => null);
  if (!response.ok || !isSuccess(result)) {
    const kind = response.status === 503 ? "config" : "server";
    throw new RsvpError(serverMessage(result) ?? messages.server, kind);
  }
}

function isSuccess(result: unknown): boolean {
  return (
    typeof result === "object" &&
    result !== null &&
    (result as { success?: unknown }).success === true
  );
}

function serverMessage(result: unknown): string | null {
  if (typeof result !== "object" || result === null) return null;
  const message = (result as { message?: unknown }).message;
  return typeof message === "string" && message.trim() ? message : null;
}
