import type { Metadata, Viewport } from "next";
import { Comfortaa } from "next/font/google";
import localFont from "next/font/local";
import { invitation } from "@/data/invitation";
import { templateContent } from "@/data/template-content";
import { translations } from "@/data/translations";
import { formatTime } from "@/lib/date";
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
const venueName = [invitation.venue.name.ky, templateContent.venue.suffix].join(" ").trim();

/** `22.10.2026, саат 16:00 · «Ата» рестораны. Сиздерди сүйүктүү Сайкал…` */
const title = `${brideName} — ${translations.hero.kind}`;
const description = [
  `${date.split("-").reverse().join(".")}, ${translations.date.timePrefix} ${formatTime(startTime)} · ${venueName}.`,
  invitation.weddingDetails.customMessage.ky.replace("{{bride}}", brideName),
].join(" ");

/**
 * Link previews (WhatsApp, Telegram, Instagram) need absolute URLs. A custom
 * domain goes in `NEXT_PUBLIC_SITE_URL`; otherwise Vercel's own production or
 * deployment domain is used, so no customer URL is baked into the repository.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

/* The preview image itself is `app/opengraph-image.jpg` (1200×630), which
   Next.js adds as og:image and twitter:image with its size and alt text. */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    type: "website",
    locale: "ky_KG",
    url: "/",
    siteName: title,
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: false, follow: false },
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
  return (
    <html lang="ky">
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
