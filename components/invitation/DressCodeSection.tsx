import { invitation } from "@/data/invitation";
import { templateContent } from "@/data/template-content";
import { translations } from "@/data/translations";
import { Ornament } from "./Ornament";
import { Reveal } from "./Reveal";
import styles from "./DressCodeSection.module.css";

/**
 * Rendered only when the invitation carries a dress code — an empty value hides
 * the whole section, heading and ornament included.
 */
export function DressCodeSection() {
  const dressCode = invitation.weddingDetails.dressCode?.ky.trim();
  if (!dressCode) return null;

  const lookbookUrl = templateContent.dressCode.lookbookUrl.trim();

  return (
    <section className={`${styles.section} section-pad`} aria-labelledby="dresscode-heading">
      <Reveal motion="zoom">
        <h2 id="dresscode-heading" className={`${styles.heading} script`}>
          {translations.dressCode.heading}
        </h2>
      </Reveal>

      <Reveal motion="up">
        <p className={`${styles.value} caps bleed`}>{dressCode}</p>
        {lookbookUrl ? (
          <a
            className={`${styles.button} pill`}
            href={lookbookUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {translations.dressCode.lookbookButton}
          </a>
        ) : null}
      </Reveal>

      <div className={styles.closingOrnament}>
        <Ornament />
      </div>
    </section>
  );
}
