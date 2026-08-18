"use client";

import { useEffect, useState } from "react";
import { invitation } from "@/data/invitation";
import { translations } from "@/data/translations";
import { eventTimestamp, remainingUntil, type Remaining } from "@/lib/date";
import { Divider } from "./Ornament";
import { Reveal } from "./Reveal";
import styles from "./Countdown.module.css";

const target = eventTimestamp(invitation.event.date, invitation.event.startTime);

export function Countdown() {
  /** Rendered empty on the server so the markup cannot mismatch the clock. */
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(remainingUntil(target, Date.now()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const units = translations.countdown.units;

  return (
    <section className={`${styles.section} section-pad`} aria-labelledby="countdown-heading">
      <Divider />

      <Reveal motion="zoom">
        <h2 id="countdown-heading" className={`${styles.heading} script bleed`}>
          {translations.countdown.heading}
        </h2>
      </Reveal>

      <Reveal motion="up">
        {remaining?.finished ? (
          <p className={`${styles.done} caps`}>{translations.countdown.started}</p>
        ) : (
          <div className={styles.timer} role="timer" aria-live="off">
            <Group value={remaining?.days} unit={units.days} digits={2} />
            <Group value={remaining?.hours} unit={units.hours} digits={2} />
            <Group value={remaining?.minutes} unit={units.minutes} digits={2} />
            <Group value={remaining?.seconds} unit={units.seconds} digits={2} />
          </div>
        )}
      </Reveal>
    </section>
  );
}

function Group({
  value,
  unit,
  digits,
}: {
  value: number | undefined;
  unit: string;
  digits: number;
}) {
  const text = value === undefined ? "".padStart(digits, "0") : String(value).padStart(digits, "0");

  return (
    <div className={styles.group}>
      <div className={styles.cards} aria-hidden="true">
        {text.split("").map((digit, index) => (
          <span key={index} className={`${styles.card} round`}>
            {digit}
          </span>
        ))}
      </div>
      <span className={`${styles.unit} round`} aria-hidden="true">
        {unit}
      </span>
      <span className="visually-hidden">{`${Number(text)} ${unit}`}</span>
    </div>
  );
}
