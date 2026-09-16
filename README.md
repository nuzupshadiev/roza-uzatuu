# Saikal — kyz uzatuu invitation

A single-page Kyrgyz **кыз узатуу** invitation built with the Next.js App Router.
The design is a fixed 320-unit column — a full-bleed yurt photograph, gold
Kyrgyz ornament, a live month calendar, a flip-card countdown, the venue with a
map link, an optional dress code, and an RSVP form that saves every answer to a
Google Sheet.

The template ships in Kyrgyz only. Every localized value in `data/invitation.ts`
still carries the `ru` and `ky` keys the Invitation Admin contract expects;
components read `.ky`.

## Local development

```bash
npm install
cp .env.example .env.local     # fill in the Google Sheets credentials
npm run dev                    # http://localhost:3000
```

## Checks and production build

```bash
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm run build       # next build
npm start           # serve the production build
```

## Invitation data contract

`data/invitation.ts` exports one object literal named exactly `invitation`.
Invitation Admin parses this file and replaces the customer-owned values in
place, so the variable must keep its name, stay a direct object literal, and
never be loaded from JSON, an API or a database.

| Field | Used by |
| --- | --- |
| `slug` | Identifies the invitation |
| `type` | Must stay `"kyz_uzatuu"` — this template has no groom |
| `people.bride.name` | Hero title and the script name in the invitation message |
| `event.date`, `event.startTime` | Calendar card, start time, countdown target |
| `venue.name`, `venue.address` | Venue section and the map card |
| `venue.mapUrl` | Map card and “картадан көрүү” button |
| `weddingDetails.customMessage` | Invitation text under the bride's name |
| `weddingDetails.hosts` | Footer “той ээлери:” |
| `weddingDetails.dressCode` | Dress-code section — the whole section disappears when it is empty |
| `music` | Public path of the background track (see below) |

Optional values may be absent entirely: without
`weddingDetails.dressCode` the matching blocks are not rendered — no empty
headings, cards or gaps are left behind.

Design copy — labels, schedule wording, ornament paths, the restaurant suffix,
the dress-code lookbook link — lives in `data/template-content.ts`, and every
interface string lives in `data/translations.ts`. Invitation Admin never touches
either file.

## RSVP integration

The form posts to `app/api/rsvp/route.ts` on the same deployment, which
validates the answer again and appends one row to the Google Sheet:

| Жөнөтүлгөн убакыт | Аты-жөнү | Жообу | Коноктордун саны |
| --- | --- | --- | --- |
| `2026-10-01 18:42:07` (Bishkek time) | guest's name | Келет · Жубайы менен келет · Келе албайт | 1–20, or 0 |

The header row is written automatically while the sheet is still empty.

Guests answer with the three options the design calls for — “Келем” (1 guest),
“Жубайым менен келем” (2 guests, adjustable up to 20 with the stepper) and
“Келе албайм”, which is saved with a guest count of 0.

### Security

- The service-account credentials are read only in `lib/google-sheets.ts`,
  which imports `server-only`; none of the variables are `NEXT_PUBLIC_`, so
  nothing reaches the browser bundle.
- No Google SDK is bundled — the route signs its own JWT with `node:crypto`
  and calls the Sheets REST API with an 8-second timeout.
- Name, answer and guest count are re-validated on the server, the body is
  capped at 2 KB, cross-site browser posts are rejected, a hidden honeypot
  field silently drops bot submissions, and values are written as `RAW` so a
  typed formula is stored as plain text.
- Google errors are logged on the server only; guests see a generic retry
  message.

When the variables are missing, the RSVP section shows a visible configuration
error instead of pretending to submit.

## Deploying to Vercel

1. Google Cloud Console → enable the **Google Sheets API**, create a service
   account and download a JSON key.
2. Share the spreadsheet with the service account's email as an **Editor**.
3. Vercel → Project → Settings → Environment Variables, add the variables from
   `.env.example` for Production and Preview:
   - `GOOGLE_CLIENT_EMAIL` — `client_email` from the key
   - `GOOGLE_PRIVATE_KEY` — `private_key` from the key, pasted as-is
     (literal `\n` sequences and real newlines both work)
   - `GOOGLE_SHEET_ID` — the id from the sheet URL
   - `GOOGLE_SHEET_NAME` — optional tab name; the first tab otherwise
   - `NEXT_PUBLIC_SITE_URL` — optional, only for a custom domain
4. Redeploy so the new variables are picked up.

### Link previews

`app/opengraph-image.jpg` (1200×630, under 300 KB so WhatsApp accepts it) and
`app/opengraph-image.alt.txt` become `og:image` / `twitter:image`. The title and
description in `app/layout.tsx` are built from `data/invitation.ts`. Preview
URLs must be absolute, so they use `NEXT_PUBLIC_SITE_URL` when set and Vercel's
production domain otherwise.

WhatsApp caches a link's preview the first time it is shared — check the
preview before sending the link out, and keep Vercel Deployment Protection off
for the production domain so its crawler can read the page.

## Assets

```
public/assets/
  images/   hero-yurt.webp, footer-wash.webp
  icons/    ornament-diamond, ornament-ring, sparkle-ring, heart, map-pin,
            flourish, birds (webp) + divider.svg, music-ring.svg
  audio/    (empty — drop music.mp3 here to enable the music control)

app/fonts/  kz-monumenta-pro · kz-asylbek-shelley · kz-champion-script (woff2)
```

### Fonts

The three faces the reference uses, self-hosted through `next/font/local`:

| Variable | Face | Used for |
| --- | --- | --- |
| `--font-serif` | KZ PF Monumenta Pro | the small-caps serif of every label, address and line |
| `--font-script` | AsylbekM02Shelley.kz | section headings, hosts, the submit button |
| `--font-display` | KZ PF Champion Script Pro | the hero name |
| `--font-round` | Comfortaa (`next/font/google`) | calendar and countdown, as in the reference |

Each file is subset to Latin + Cyrillic and verified to carry `ң`, `ө` and `ү`,
which keeps all three under 30 KB. Nothing is fetched from the reference site at
runtime. The three KZ faces are commercial typefaces, so confirm you hold a
licence for them before publishing — swapping in an OFL alternative only means
replacing the files in `app/fonts/` and the `src` paths in `app/layout.tsx`.

### Replacing assets safely

1. Drop the new file into the matching `public/assets/…` folder using a
   lowercase kebab-case name.
2. Update the entry in `data/template-content.ts` — `width` and `height` must be
   the file's real pixel size so `next/image` reserves the right box and nothing
   shifts while loading.
3. Keep transparency (webp/svg/png) for decorative art; the cream page shows
   through it.
4. Re-run `npm run build` and check the section at 320px and at 1440px.

### Background music

No audio ships with the template. Add a file at
`public/assets/audio/music.mp3` (or let Invitation Admin install a library
track — it writes over the path in `invitation.music`) and the gold music
control appears in the hero on its own. Until then the control stays hidden and
the invitation works exactly as before: playback starts on the guest's first
interaction and never autoplays unmuted.

## Accessibility and motion

Semantic headings, labelled form fields, validation messages tied to their
inputs, an `aria-live` RSVP status, visible focus rings, and decorative imagery
hidden from assistive technology. Every animation — the reveals, the turning
ornaments, the floating pin, the beating heart — stops under
`prefers-reduced-motion: reduce`, and a `<noscript>` rule keeps all content
visible when JavaScript never runs.
