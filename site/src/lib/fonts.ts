import { IBM_Plex_Mono, Inter } from "next/font/google";

export const sans = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter",
});

export const mono = IBM_Plex_Mono({
  display: "swap",
  preload: false,
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
});
