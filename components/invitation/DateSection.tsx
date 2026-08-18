import Image from "next/image";
import { invitation } from "@/data/invitation";
import { templateContent } from "@/data/template-content";
import { translations } from "@/data/translations";
import { eventDay, formatTime, monthGrid, monthName } from "@/lib/date";
import { Reveal } from "./Reveal";
import styles from "./DateSection.module.css";

const { sparkleRing } = templateContent.assets;

export function DateSection() {
  const { date, startTime } = invitation.event;
  const cells = monthGrid(date);
  const day = eventDay(date);

  return (
    <section className={`${styles.section} section-pad`} aria-labelledby="date-heading">
      <Reveal motion="up">
        <h2 id="date-heading" className={`${styles.label} caps`}>
          {translations.date.label}
        </h2>
      </Reveal>

      <Reveal motion="zoom">
        <div className={`${styles.card} bleed round`} role="img" aria-label={translations.date.calendarLabel}>
          <p className={styles.month}>{monthName(date)}</p>

          <div className={`${styles.grid} ${styles.weekdays}`} aria-hidden="true">
            {translations.date.weekdays.map((weekday) => (
              <span key={weekday}>{weekday}</span>
            ))}
          </div>

          <div className={`${styles.grid} ${styles.days}`} aria-hidden="true">
            {cells.map((cell, index) => (
              <span
                key={index}
                className={[
                  styles.day,
                  cell.weekday === 6 ? styles.sunday : "",
                  cell.day === day ? styles.today : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {cell.day ?? ""}
                {cell.day === day ? (
                  <Image
                    className={`${styles.ring} spin-slow`}
                    src={sparkleRing.src}
                    width={sparkleRing.width}
                    height={sparkleRing.height}
                    sizes="60px"
                    alt=""
                    aria-hidden="true"
                  />
                ) : null}
              </span>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal motion="zoom">
        <p className={`${styles.time} caps`}>
          {translations.date.timePrefix} {formatTime(startTime)}
        </p>
      </Reveal>
    </section>
  );
}
