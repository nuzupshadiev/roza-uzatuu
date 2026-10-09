export type Attendance = "yes" | "no";

/**
 * This deployment's own route (`app/api/rsvp/route.ts`), which writes the
 * answer to the hosts' Google Sheet with server-only credentials.
 */
const RSVP_ENDPOINT = "/api/rsvp";

export interface RsvpPayload {
  guestName: string;
  attendance: Attendance;
  guestCount: number;
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
}

interface RsvpMessages {
  config: string;
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
    throw new RsvpError(serverMessage(result) ?? messages.server, "server");
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
