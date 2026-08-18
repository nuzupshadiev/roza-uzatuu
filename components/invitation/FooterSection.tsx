import Image from "next/image";
import { invitation } from "@/data/invitation";
import { templateContent } from "@/data/template-content";
import { translations } from "@/data/translations";
import { Reveal } from "./Reveal";
import styles from "./FooterSection.module.css";
import { PriglasiCredit } from "./PriglasiCredit";

const { flourish, footerWash, ornamentRing } = templateContent.assets;

export function FooterSection() {
  const hosts = invitation.weddingDetails.hosts.ky.trim();
  const parents = invitation.people.bride.parents?.ky.trim();
  const showParents = Boolean(parents) && parents !== hosts;

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

      <Reveal motion="up">
        {hosts ? (
          <>
            <p className={`${styles.label} caps`}>{translations.footer.hostsLabel}</p>
            <p className={`${styles.hosts} script bleed`}>{hosts}</p>
          </>
        ) : null}
        {showParents ? (
          <p className={`${styles.parents} caps`}>
            {translations.footer.parentsLabel} {parents}
          </p>
        ) : null}
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
        <div className={styles.blessingBlock}>
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
          <p className={`${styles.blessing} script bleed`}>{translations.footer.blessing}</p>
        </div>
      </Reveal>
      <PriglasiCredit language="ky" />
    </footer>
  );
}
