import type { Metadata, Viewport } from "next";
import { Comfortaa } from "next/font/google";
import localFont from "next/font/local";
import { invitation } from "@/data/invitation";
import { translations } from "@/data/translations";
import { eventDay, eventYear, formatTime, monthName } from "@/lib/date";
import "./globals.css";

/*
 * The three faces the reference sets its `kazakh` family to, subset to the
 * Latin + Cyrillic ranges this invitation actually types (Kyrgyz ң ө ү
 * included) and self-hosted — nothing is fetched from the reference site.
 */

/** KZ PF Monumenta Pro — the small-caps serif behind every label and line. */
const serif = localFont({
  src: "./fonts/kz-monumenta-pro.woff2",
  display: "swap",
  variable: "--font-serif",
  fallback: ["Cormorant Garamond", "Times New Roman", "serif"],
});

/** AsylbekM02Shelley.kz — calligraphy for the section headings and hosts. */
const script = localFont({
  src: "./fonts/kz-asylbek-shelley.woff2",
  display: "swap",
  variable: "--font-script",
  fallback: ["Segoe Script", "cursive"],
});

/** KZ PF Champion Script Pro — the formal roundhand of the hero name. */
const display = localFont({
  src: "./fonts/kz-champion-script.woff2",
  display: "swap",
  variable: "--font-display",
  fallback: ["Segoe Script", "cursive"],
});

/** Rounded sans — calendar and countdown, as in the reference. */
const round = Comfortaa({
  subsets: ["cyrillic-ext", "cyrillic", "latin"],
  weight: ["300", "400", "500"],
  display: "swap",
  variable: "--font-round",
  fallback: ["Trebuchet MS", "sans-serif"],
});

const brideName = invitation.people.bride.name.ky;
const { date, startTime } = invitation.event;

const title = `${brideName} — ${translations.hero.kind}`;
/** Who, when and where — the line WhatsApp shows under the preview title. */
const description = [
  `${brideName} ${translations.meta.invitation}.`,
  `${eventDay(date)}-${monthName(date).toLowerCase()}, ${eventYear(date)}${translations.meta.yearSuffix},`,
  `${translations.date.timePrefix} ${formatTime(startTime)} · ${invitation.venue.name.ky}`,
].join(" ");

/**
 * Only set when the platform tells us where the invitation lives, so no
 * customer URL is ever baked into the repository.
 */
const deploymentUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined);

/*
 * The preview image is `app/opengraph-image.jpg` (with its `.alt.txt`), which
 * Next.js turns into absolute `og:image` tags against the deployment URL —
 * WhatsApp ignores relative ones. Twitter tags inherit title, description and
 * image from `openGraph`.
 */
export const metadata: Metadata = {
  ...(deploymentUrl ? { metadataBase: new URL(deploymentUrl) } : {}),
  title,
  description,
  openGraph: {
    type: "website",
    locale: "ky_KG",
    siteName: title,
    title,
    description,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: false, follow: false },
  other: { google: "notranslate" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8f5ec",
};

const noScriptStyles = `
.reveal { opacity: 1 !important; transform: none !important; }
[data-intro] { display: none !important; }
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  /**
   * Phones set to Russian auto-translate the Kyrgyz text into Russian, which
   * mangles it. `translate="no"` is the standard opt-out (Chrome, Safari, Edge),
   * the `notranslate` class is the one Google Translate itself looks for, and
   * the `google` meta tag in `metadata` stops Chrome offering to translate.
   */
  return (
    <html lang="ky" translate="no" className="notranslate">
      <body
        className={`${serif.variable} ${script.variable} ${display.variable} ${round.variable}`}
      >
        {/* Without JavaScript there is no observer to reveal blocks and no
            timer to lift the opening screen, so neither may hide anything. */}
        <noscript>
          <style>{noScriptStyles}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
