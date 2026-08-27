import Image from "next/image";
import { invitation } from "@/data/invitation";
import { templateContent } from "@/data/template-content";
import { translations } from "@/data/translations";
import { Ornament } from "./Ornament";
import { Reveal } from "./Reveal";
import styles from "./InvitationMessage.module.css";
import { splitBrideMessage } from "@/lib/bride-message";

const { ornamentDiamond, ornamentRing } = templateContent.assets;

export function InvitationMessage() {
  const bride = invitation.people.bride;
  const hosts = invitation.weddingDetails.hosts.ky.trim();
  // Kyrgyz only: this design has no language switch. The message still carries
  // the name's position, so the halves are read out of it rather than printed
  // with the token showing.
  const { lead, suffix, rest } = splitBrideMessage(
    invitation.weddingDetails.customMessage.ky,
  );

  return (
    <section className={`${styles.section} section-pad`} aria-labelledby="message-heading">
      <Watermark className={styles.watermarkLeft} />
      <Watermark className={styles.watermarkRight} />

      <Reveal motion="up">
        <p className={`${styles.greeting} caps bleed`} id="message-heading">
          {translations.message.greeting}
          <br />
          <br />
          {lead}
        </p>
      </Reveal>

      <Reveal motion="zoom">
        <div className={styles.nameRow}>
          <SideOrnament className={styles.sideLeft} />
          <p className={`${styles.name} script`}>
            {bride.name.ky}
            {suffix}
          </p>
          <SideOrnament className={styles.sideRight} />
        </div>
      </Reveal>

      <Reveal motion="up">
        <p className={`${styles.message} caps bleed`}>
          {rest}
        </p>
      </Reveal>

      {hosts ? (
        <Reveal motion="up">
          <p className={`${styles.hostsLabel} caps`}>{translations.message.hostsLabel}</p>
          <p className={`${styles.hosts} script bleed`}>{hosts}</p>
        </Reveal>
      ) : null}

      <div className={styles.closingOrnament}>
        <Ornament />
      </div>
    </section>
  );
}

function SideOrnament({ className }: { className: string }) {
  return (
    <Image
      className={`${styles.sideOrnament} ${className}`}
      src={ornamentDiamond.src}
      width={ornamentDiamond.width}
      height={ornamentDiamond.height}
      sizes="126px"
      alt=""
      aria-hidden="true"
    />
  );
}

function Watermark({ className }: { className: string }) {
  return (
    <Image
      className={`watermark ${className}`}
      src={ornamentRing.src}
      width={ornamentRing.width}
      height={ornamentRing.height}
      sizes="324px"
      alt=""
      aria-hidden="true"
    />
  );
}
