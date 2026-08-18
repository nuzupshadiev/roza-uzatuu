"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { templateContent } from "@/data/template-content";
import { translations } from "@/data/translations";
import styles from "./IntroScreen.module.css";

const { heart } = templateContent.assets;

/**
 * Opening screen: a beating gold heart over cream that lifts once the page is
 * ready, mirroring the reference's preloader. It never blocks the invitation —
 * a hard 2.6s cap hides it even if `load` never fires.
 */
export function IntroScreen() {
  const [done, setDone] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const finish = () => setDone(true);
    const onLoad = () => window.setTimeout(finish, 500);

    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    const cap = window.setTimeout(finish, 2600);
    return () => {
      window.removeEventListener("load", onLoad);
      window.clearTimeout(cap);
    };
  }, []);

  useEffect(() => {
    if (!done) {
      document.body.style.overflow = "hidden";
      return;
    }
    document.body.style.overflow = "";
    const timer = window.setTimeout(() => setRemoved(true), 1200);
    return () => window.clearTimeout(timer);
  }, [done]);

  useEffect(() => () => {
    document.body.style.overflow = "";
  }, []);

  if (removed) return null;

  return (
    <div
      data-intro=""
      className={`${styles.screen}${done ? ` ${styles.hidden}` : ""}`}
      role="status"
      aria-live="polite"
      aria-label={translations.intro.label}
      aria-hidden={done}
    >
      <Image
        className={`${styles.heart} heartbeat`}
        src={heart.src}
        width={heart.width}
        height={heart.height}
        sizes="60px"
        alt=""
        aria-hidden="true"
        loading="eager"
        fetchPriority="high"
      />
    </div>
  );
}
