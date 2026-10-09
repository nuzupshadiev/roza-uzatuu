/**
 * Design-owned content: asset paths, decoration, and the few pieces of wording
 * that describe the template rather than the customer. Invitation Admin never
 * rewrites this file, so anything a customer can change belongs in
 * `data/invitation.ts` instead.
 */
export const templateContent = {
  assets: {
    hero: { src: "/assets/images/hero-yurt.webp", width: 776, height: 1379 },
    footerWash: { src: "/assets/images/footer-wash.webp", width: 999, height: 354 },
    ornamentDiamond: { src: "/assets/icons/ornament-diamond.webp", width: 279, height: 279 },
    ornamentRing: { src: "/assets/icons/ornament-ring.webp", width: 480, height: 477 },
    sparkleRing: { src: "/assets/icons/sparkle-ring.webp", width: 138, height: 130 },
    heart: { src: "/assets/icons/heart.webp", width: 240, height: 210 },
    mapPin: { src: "/assets/icons/map-pin.webp", width: 162, height: 234 },
    flourish: { src: "/assets/icons/flourish.webp", width: 402, height: 87 },
    birds: { src: "/assets/icons/birds.webp", width: 188, height: 160 },
    divider: { src: "/assets/icons/divider.svg", width: 251, height: 16 },
    musicRing: { src: "/assets/icons/music-ring.svg", width: 70, height: 73 },
  },

  venue: {
    /**
     * Printed under the venue name, the way the reference names its restaurant.
     * Set to an empty string when the venue is not a restaurant — the line then
     * disappears instead of showing a wrong word.
     */
    suffix: "рестораны",
  },

  dressCode: {
    /**
     * Optional inspiration board (Pinterest, Instagram…) for guests' outfits.
     * The button only appears while this is a real link.
     */
    lookbookUrl: "",
  },

  rsvp: {
    /** Guest counts the form is allowed to send. The central API accepts 1–20. */
    minGuests: 1,
    maxGuests: 20,
  },
} as const;
