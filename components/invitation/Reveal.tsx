"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type Motion = "zoom" | "up" | "down" | "right";

interface RevealProps {
  children: ReactNode;
  motion?: Motion;
  /** Seconds. Staggers a group of elements that arrive together. */
  delay?: number;
  className?: string;
}

interface Watcher {
  node: HTMLElement;
  show: () => void;
}

/**
 * One shared scroll pass drives every reveal.
 *
 * A plain rect check is used instead of IntersectionObserver on purpose: the
 * observer's callbacks are tied to frame production, so a throttled or
 * backgrounded tab can leave blocks stuck at `opacity: 0` with no way back.
 * Scroll and resize events always arrive, and each element is measured once and
 * then dropped, so the pass costs nothing after the page has been read through.
 */
const watchers = new Set<Watcher>();
let listening = false;

function sweep() {
  if (watchers.size === 0) {
    stop();
    return;
  }
  // Anything at or above the fold line counts, so a block that was scrolled
  // straight past — or jumped over by an anchor — can never stay hidden.
  const limit = window.innerHeight * 0.94;
  for (const watcher of [...watchers]) {
    const box = watcher.node.getBoundingClientRect();
    if (box.top < limit) {
      watchers.delete(watcher);
      watcher.show();
    }
  }
  if (watchers.size === 0) stop();
}

function start() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", sweep, { passive: true });
  window.addEventListener("resize", sweep, { passive: true });
}

function stop() {
  if (!listening) return;
  listening = false;
  window.removeEventListener("scroll", sweep);
  window.removeEventListener("resize", sweep);
}

export function Reveal({ children, motion = "up", delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const watcher: Watcher = { node, show: () => setVisible(true) };
    watchers.add(watcher);
    start();

    // A beat before the first pass so blocks already on screen still fade in,
    // then once more after late fonts and images have moved things around.
    const first = window.setTimeout(sweep, 60);
    const settle = window.setTimeout(sweep, 400);

    return () => {
      window.clearTimeout(first);
      window.clearTimeout(settle);
      watchers.delete(watcher);
      if (watchers.size === 0) stop();
    };
  }, []);

  return (
    <div
      ref={ref}
      data-motion={motion}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
      className={`reveal${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}
