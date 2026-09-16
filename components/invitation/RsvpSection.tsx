"use client";

import Image from "next/image";
import { useId, useRef, useState, type FormEvent } from "react";
import { templateContent } from "@/data/template-content";
import { translations } from "@/data/translations";
import { RsvpError, submitRsvp, type Attendance } from "@/lib/rsvp";
import { Reveal } from "./Reveal";
import styles from "./RsvpSection.module.css";

const { birds, ornamentRing } = templateContent.assets;
const { minGuests, maxGuests } = templateContent.rsvp;
const copy = translations.rsvp;

type Choice = "alone" | "couple" | "declined";
type Status = "idle" | "invalid" | "submitting" | "success" | "error";

const attendanceOf: Record<Choice, Attendance> = {
  alone: "yes",
  couple: "yes",
  declined: "no",
};

/**
 * `configured` is read on the server from the Google Sheets variables, so a
 * deployment that was never given them says so instead of pretending to submit.
 */
export function RsvpSection({ configured }: { configured: boolean }) {
  const [guestName, setGuestName] = useState("");
  const [website, setWebsite] = useState("");
  const [choice, setChoice] = useState<Choice | null>(null);
  const [guestCount, setGuestCount] = useState(2);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; choice?: string }>({});
  const pending = useRef(false);

  const nameId = useId();
  const nameErrorId = `${nameId}-error`;
  const choiceErrorId = `${nameId}-choice-error`;
  const counterId = `${nameId}-count`;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending.current) return;

    const errors: { name?: string; choice?: string } = {};
    if (!guestName.trim()) errors.name = copy.errors.name;
    if (!choice) errors.choice = copy.errors.attendance;
    setFieldErrors(errors);
    if (errors.name || errors.choice || !choice) {
      setStatus("invalid");
      setMessage("");
      return;
    }

    const count = choice === "couple" ? guestCount : 1;
    if (attendanceOf[choice] === "yes" && (count < minGuests || count > maxGuests)) {
      setFieldErrors({});
      setStatus("invalid");
      setMessage(copy.errors.guestCount);
      return;
    }

    pending.current = true;
    setStatus("submitting");
    setMessage("");

    try {
      await submitRsvp(
        { guestName, attendance: attendanceOf[choice], guestCount: count, website },
        copy.errors,
      );
      setStatus("success");
      setMessage(copy.success);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof RsvpError ? error.message : copy.errors.server);
    } finally {
      pending.current = false;
    }
  };

  const submitting = status === "submitting";
  const sent = status === "success";

  return (
    <section className={`${styles.section} section-pad`} aria-labelledby="rsvp-heading">
      <Image
        className={`watermark ${styles.watermarkRight}`}
        src={ornamentRing.src}
        width={ornamentRing.width}
        height={ornamentRing.height}
        sizes="324px"
        alt=""
        aria-hidden="true"
      />

      <Reveal motion="up">
        <h2 id="rsvp-heading" className={`${styles.heading} caps bleed`}>
          {copy.heading}
        </h2>
      </Reveal>

      <Reveal motion="right">
        <form className={`${styles.form} bleed`} onSubmit={submit} noValidate>
          {!configured ? (
            <p className={`${styles.configWarning} caps`} role="alert">
              {copy.errors.config}
            </p>
          ) : null}
          <div className={styles.field}>
            <label className="visually-hidden" htmlFor={nameId}>
              {copy.nameLabel}
            </label>
            <input
              id={nameId}
              className={`${styles.input} caps`}
              type="text"
              name="guestName"
              autoComplete="name"
              maxLength={120}
              placeholder={copy.namePlaceholder}
              value={guestName}
              disabled={sent}
              aria-invalid={fieldErrors.name ? "true" : undefined}
              aria-describedby={fieldErrors.name ? nameErrorId : undefined}
              onChange={(event) => setGuestName(event.target.value)}
            />
            <Image
              className={styles.birds}
              src={birds.src}
              width={birds.width}
              height={birds.height}
              sizes="46px"
              alt=""
              aria-hidden="true"
            />
            {fieldErrors.name ? (
              <p className={`${styles.fieldError} caps`} id={nameErrorId}>
                {fieldErrors.name}
              </p>
            ) : null}
          </div>

          {/* Honeypot: hidden from guests and assistive technology, filled only by bots. */}
          <div className="visually-hidden" aria-hidden="true">
            <input
              type="text"
              name="rsvp-extra"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </div>

          <fieldset className={styles.group}>
            <legend className={`${styles.legend} caps`}>{copy.attendanceLegend}</legend>
            <div
              className={styles.options}
              aria-describedby={fieldErrors.choice ? choiceErrorId : undefined}
            >
              {(["alone", "couple", "declined"] as const).map((value) => (
                <label key={value} className={`${styles.option} caps`}>
                  <input
                    className={styles.radio}
                    type="radio"
                    name="attendance"
                    value={value}
                    checked={choice === value}
                    disabled={sent}
                    onChange={() => {
                      setChoice(value);
                      setFieldErrors((current) => ({ ...current, choice: undefined }));
                    }}
                  />
                  {copy.options[value]}
                </label>
              ))}
            </div>
            {fieldErrors.choice ? (
              <p className={`${styles.fieldError} caps`} id={choiceErrorId}>
                {fieldErrors.choice}
              </p>
            ) : null}

            {choice === "couple" ? (
              <div className={styles.counter}>
                <span className={`${styles.counterLabel} caps`} id={counterId}>
                  {copy.guestCountLabel}
                </span>
                <button
                  type="button"
                  className={styles.step}
                  onClick={() => setGuestCount((count) => Math.max(2, count - 1))}
                  disabled={sent || guestCount <= 2}
                  aria-label={copy.guestCountDecrease}
                >
                  −
                </button>
                <output className={`${styles.count} round`} aria-labelledby={counterId}>
                  {guestCount}
                </output>
                <button
                  type="button"
                  className={styles.step}
                  onClick={() => setGuestCount((count) => Math.min(maxGuests, count + 1))}
                  disabled={sent || guestCount >= maxGuests}
                  aria-label={copy.guestCountIncrease}
                >
                  +
                </button>
              </div>
            ) : null}
          </fieldset>

          {!sent ? (
            <div className={styles.submitRow}>
              <button type="submit" className={`${styles.submit} pill`} disabled={submitting}>
                {submitting ? copy.submitting : status === "error" ? copy.retry : copy.submit}
              </button>
            </div>
          ) : null}

          <p
            className={`${styles.status} caps ${sent ? styles.success : styles.error}`}
            role="status"
            aria-live="polite"
            aria-label={copy.statusLabel}
          >
            {message}
          </p>
        </form>
      </Reveal>
    </section>
  );
}
