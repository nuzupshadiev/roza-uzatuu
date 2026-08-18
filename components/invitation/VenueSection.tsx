import Image from "next/image";
import { invitation } from "@/data/invitation";
import { templateContent } from "@/data/template-content";
import { translations } from "@/data/translations";
import { Divider, Ornament } from "./Ornament";
import { Reveal } from "./Reveal";
import styles from "./VenueSection.module.css";

const { mapPin, ornamentRing } = templateContent.assets;

export function VenueSection() {
  const { venue } = invitation;
  const suffix = templateContent.venue.suffix.trim();

  return (
    <section className={`${styles.section} section-pad`} aria-labelledby="venue-heading">
      <Image
        className={`watermark ${styles.watermarkLeft}`}
        src={ornamentRing.src}
        width={ornamentRing.width}
        height={ornamentRing.height}
        sizes="324px"
        alt=""
        aria-hidden="true"
      />

      <Divider />

      <Reveal motion="zoom">
        <h2 id="venue-heading" className={`${styles.heading} script`}>
          {translations.venue.heading}
        </h2>
      </Reveal>

      <Reveal motion="up">
        <Image
          className={`${styles.pin} float`}
          src={mapPin.src}
          width={mapPin.width}
          height={mapPin.height}
          sizes="73px"
          alt=""
          aria-hidden="true"
        />
        <p className={`${styles.address} caps bleed`}>{venue.address.ky}</p>
        <p className={`${styles.venue} caps`}>{venue.name.ky}</p>
        {suffix ? <p className={`${styles.suffix} caps`}>{suffix}</p> : null}
      </Reveal>

      <Reveal motion="down">
        <a
          className={`${styles.mapCard} bleed`}
          href={venue.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            className={styles.mapRing}
            src={ornamentRing.src}
            width={ornamentRing.width}
            height={ornamentRing.height}
            sizes="405px"
            alt=""
            aria-hidden="true"
          />
          <p className={`${styles.mapName} caps`}>{venue.name.ky}</p>
          <p className={`${styles.mapHint} caps`}>{translations.venue.mapCardLabel}</p>
          <span className={`${styles.mapButton} pill`}>{translations.venue.mapButton}</span>
        </a>
      </Reveal>

      <div className={styles.closingOrnament}>
        <Ornament />
      </div>
    </section>
  );
}
