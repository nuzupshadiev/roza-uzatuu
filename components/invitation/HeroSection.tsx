import Image from "next/image";
import { invitation } from "@/data/invitation";
import { templateContent } from "@/data/template-content";
import { translations } from "@/data/translations";
import { MusicControl } from "./MusicControl";
import styles from "./HeroSection.module.css";

const { hero } = templateContent.assets;

export function HeroSection() {
  return (
    <section className={styles.hero} aria-labelledby="hero-name">
      <Image
        className={styles.photo}
        src={hero.src}
        width={hero.width}
        height={hero.height}
        sizes="(max-width: 560px) 131vw, 562px"
        alt={translations.alt.hero}
        preload
        fetchPriority="high"
      />

      <div className={styles.titles}>
        <h1 id="hero-name" className={`${styles.name} display`}>
          {invitation.people.bride.name.ky}
        </h1>
        <p className={`${styles.kind} caps`}>{translations.hero.kind}</p>
      </div>

      <div className={styles.scrollHint} aria-hidden="true">
        <span className={`${styles.dot} scroll-dot`} />
        {/* <span className={`${styles.hintText} caps`}>
          {translations.hero.scrollHint}
        </span> */}
      </div>

      <MusicControl src={invitation.music} />
    </section>
  );
}
