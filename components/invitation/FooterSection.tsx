import Image from "next/image";
import { templateContent } from "@/data/template-content";
import { translations } from "@/data/translations";
import { Reveal } from "./Reveal";
import styles from "./FooterSection.module.css";
import { PriglasiCredit } from "./PriglasiCredit";

const { flourish, footerWash, ornamentRing } = templateContent.assets;

/** The flourishes and wash, the guests' message, and the Priglasi credit row. */
export function FooterSection() {
  return (
    <footer className={`${styles.footer} section-pad`}>
      <Reveal motion="zoom">
        <Image
          className={`${styles.flourish} ${styles.flourishTop}`}
          src={flourish.src}
          width={flourish.width}
          height={flourish.height}
          sizes="180px"
          alt=""
          aria-hidden="true"
        />
      </Reveal>

      <Reveal motion="zoom">
        <Image
          className={`${styles.flourish} ${styles.flourishBottom}`}
          src={flourish.src}
          width={flourish.width}
          height={flourish.height}
          sizes="180px"
          alt=""
          aria-hidden="true"
        />
      </Reveal>

      <Reveal motion="down">
        <div className={styles.messageBlock}>
          <Image
            className={styles.ring}
            src={ornamentRing.src}
            width={ornamentRing.width}
            height={ornamentRing.height}
            sizes="324px"
            alt=""
            aria-hidden="true"
          />
          <Image
            className={styles.wash}
            src={footerWash.src}
            width={footerWash.width}
            height={footerWash.height}
            sizes="(max-width: 460px) 100vw, 447px"
            alt=""
            aria-hidden="true"
          />
          <p className={`${styles.message} script bleed`}>{translations.footer.message}</p>
        </div>
      </Reveal>
      <PriglasiCredit language="ky" />
    </footer>
  );
}
