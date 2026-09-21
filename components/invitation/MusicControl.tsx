"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { templateContent } from "@/data/template-content";
import { translations } from "@/data/translations";
import styles from "./MusicControl.module.css";

const { musicRing } = templateContent.assets;

/**
 * Background music, off until the browser lets it start.
 *
 * The control only appears once the file really loads, so a template shipped
 * without an audio asset simply shows no button. Playback is attempted on the
 * guest's first interaction — the reference does the same — and never fights
 * an explicit pause.
 */
export function MusicControl({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const stoppedByGuest = useRef(false);
  // Separate from the flag above: this one records that the tab going away is
  // what silenced the track, and only such a pause is ever undone.
  const pausedByHiddenTab = useRef(false);
  const [available, setAvailable] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState(src);

  /*
   * Browsers defer media fetches until playback begins, which both hid the
   * control (canplay never fired) and made the first tap wait on the network.
   * Downloading the track directly answers availability and hands the element
   * a local copy, so the tap starts the music instantly.
   */
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | null = null;
    fetch(src, { signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return null;
        setAvailable(response.ok);
        return response.ok ? response.blob() : null;
      })
      .then((blob) => {
        if (!blob || controller.signal.aborted) return;
        // A swap mid-play would restart the track; the network copy is fine.
        if (audioRef.current && !audioRef.current.paused) return;
        objectUrl = URL.createObjectURL(blob);
        setResolvedSrc(objectUrl);
      })
      .catch(() => undefined);
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  const start = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    void audio.play().catch(() => setPlaying(false));
  }, []);

  useEffect(() => {
    if (!available) return;

    const kick = () => {
      if (!stoppedByGuest.current) start();
    };
    const events = ["pointerdown", "keydown", "touchstart", "scroll"] as const;
    for (const event of events) {
      window.addEventListener(event, kick, { once: true, passive: true });
    }
    return () => {
      for (const event of events) window.removeEventListener(event, kick);
    };
  }, [available, start]);

  /*
   * A tab the guest has left plays to nobody, so the track pauses with it and
   * resumes from the same spot when they return — `play()` straight on the
   * element, since `start` is the entry point for a fresh playback. Music the
   * guest stopped, or that never started, stays quiet.
   */
  useEffect(() => {
    const onVisibilityChange = () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (document.hidden) {
        if (audio.paused) return;
        pausedByHiddenTab.current = true;
        audio.pause();
        return;
      }

      if (!pausedByHiddenTab.current) return;
      pausedByHiddenTab.current = false;
      if (stoppedByGuest.current) return;
      void audio.play().catch(() => setPlaying(false));
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      stoppedByGuest.current = false;
      pausedByHiddenTab.current = false;
      start();
    } else {
      stoppedByGuest.current = true;
      pausedByHiddenTab.current = false;
      audio.pause();
    }
  };

  const label = playing ? translations.music.pause : translations.music.play;

  return (
    <>
      <audio
        ref={audioRef}
        src={resolvedSrc}
        loop
        preload="auto"
        onCanPlay={() => setAvailable(true)}
        onError={() => setAvailable(false)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      {available ? (
        <button type="button" className={styles.control} onClick={toggle} aria-label={label}>
          <Image
            className={styles.ring}
            src={musicRing.src}
            width={musicRing.width}
            height={musicRing.height}
            alt=""
            aria-hidden="true"
            unoptimized
          />
          <span className={styles.icon} aria-hidden="true">
            {playing ? <PauseIcon /> : <PlayIcon />}
          </span>
        </button>
      ) : null}
    </>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none" focusable="false">
      <circle cx="24" cy="24" r="22.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M20.4 30.6V18.9l11.1-2.4v11.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse cx="18.1" cy="30.9" rx="2.5" ry="2.1" fill="currentColor" />
      <ellipse cx="29.2" cy="28.5" rx="2.5" ry="2.1" fill="currentColor" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none" focusable="false">
      <circle cx="24" cy="24" r="22.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="18" y="16" width="4.2" height="16" rx="2.1" fill="currentColor" />
      <rect x="25.8" y="16" width="4.2" height="16" rx="2.1" fill="currentColor" />
    </svg>
  );
}
