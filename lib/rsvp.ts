import { invitation } from "@/data/invitation";
import { LANGUAGE } from "@/data/translations";

export type Attendance = "yes" | "no";

/** Path segment appended to the configured API base. */
const RSVP_PATH = "api/rsvp";

export interface RsvpPayload {
  invitationSlug: string;
  guestName: string;
  attendance: Attendance;
  guestCount: number;
  language: typeof LANGUAGE;
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

/**
 * Central RSVP API base. Vercel receives it as `NEXT_PUBLIC_RSVP_API_URL`; the
 * value Invitation Admin writes into `invitation.rsvp.endpoint` is only a
 * fallback for deployments configured before the variable existed.
 */
export function rsvpEndpoint(): string | null {
  const base = process.env.NEXT_PUBLIC_RSVP_API_URL?.trim().replace(/\/+$/, "");
  if (base) return `${base}/${RSVP_PATH}`;

  const configured: string = invitation.rsvp.endpoint;
  const fallback = configured.trim().replace(/\/+$/, "");
  if (!fallback) return null;
  return fallback.endsWith(RSVP_PATH) ? fallback : `${fallback}/${RSVP_PATH}`;
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
  const endpoint = rsvpEndpoint();
  if (!endpoint) throw new RsvpError(messages.config, "config");

  const payload: RsvpPayload = {
    invitationSlug: invitation.slug,
    guestName: input.guestName.trim(),
    attendance: input.attendance,
    guestCount: input.attendance === "no" ? 0 : input.guestCount,
    language: LANGUAGE,
  };

  let response: Response;
  try {
    response = await fetch(endpoint, {
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
