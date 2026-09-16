"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { templateContent } from "@/data/template-content";
import { translations } from "@/data/translations";
import styles from "./MusicControl.module.css";

const { musicRing } = templateContent.assets;

/**
 * Every way a guest first touches the page. Browsers only let sound start on
 * some of them — a tap, click or key press, not a bare scroll or wheel — and
 * which ones differs by browser, so playback is tried on each until one works.
 */
const INTERACTIONS = [
  "pointerdown",
  "pointerup",
  "touchstart",
  "touchend",
  "mousedown",
  "click",
  "keydown",
  "scroll",
  "wheel",
] as const;

/** Capture on `window` sees scrolls of inner elements and runs before React. */
const LISTENER_OPTIONS = { capture: true, passive: true } as const;

/**
 * Background music, off until the browser lets it start.
 *
 * The control only appears once the file really loads, so a template shipped
 * without an audio asset simply shows no button. Playback starts on the
 * guest's first interaction with the page — listening begins before the track
 * has downloaded, so an early tap is never lost — and never fights an explicit
 * pause.
 */
export function MusicControl({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const controlRef = useRef<HTMLButtonElement>(null);
  const stoppedByGuest = useRef(false);
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
    const audio = audioRef.current;
    if (!audio) return;

    const kick = (event: Event) => {
      if (stoppedByGuest.current || !audio.paused) {
        detach();
        return;
      }
      // The music button runs its own toggle; starting here as well would
      // have that same tap pause the track again.
      if (event.target instanceof Node && controlRef.current?.contains(event.target)) return;
      // A refused attempt (e.g. a scroll before any tap) just waits for the next one.
      void audio.play().catch(() => undefined);
    };

    const detach = () => {
      for (const event of INTERACTIONS) window.removeEventListener(event, kick, LISTENER_OPTIONS);
      audio.removeEventListener("playing", detach);
    };

    for (const event of INTERACTIONS) window.addEventListener(event, kick, LISTENER_OPTIONS);
    audio.addEventListener("playing", detach);
    return detach;
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      stoppedByGuest.current = false;
      start();
    } else {
      stoppedByGuest.current = true;
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
        <button
          ref={controlRef}
          type="button"
          className={styles.control}
          onClick={toggle}
          aria-label={label}
        >
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
