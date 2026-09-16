import type { Metadata, Viewport } from "next";
import { Comfortaa } from "next/font/google";
import localFont from "next/font/local";
import { invitation } from "@/data/invitation";
import { translations } from "@/data/translations";
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

/**
 * Only set when the platform tells us where the invitation lives, so no
 * customer URL is ever baked into the repository.
 */
const deploymentUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined);

export const metadata: Metadata = {
  ...(deploymentUrl ? { metadataBase: new URL(deploymentUrl) } : {}),
  title: `${brideName} — ${translations.hero.kind}`,
  description: `${brideName} кызыбыздын узатуу тоюна чакыруу`,
  openGraph: {
    type: "website",
    locale: "ky_KG",
    title: `${brideName} — ${translations.hero.kind}`,
    description: `${brideName} кызыбыздын узатуу тоюна чакыруу`,
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
