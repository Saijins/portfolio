import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const inter = localFont({
  src: "../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  weight: "100 900",
  display: "optional",
  variable: "--font-inter",
});

const instrumentSerif = localFont({
  src: "../node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2",
  weight: "400",
  style: "italic",
  display: "swap",
  adjustFontFallback: "Times New Roman",
  variable: "--font-instrument-serif",
});

export const metadata: Metadata = {
  title: "Digitale Produkte · Portfolio",
  description: "Webdesign, Webanwendungen und Automatisierung. Entdecke das Angebot und erzähl mir von deiner Idee.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de" className={`${inter.variable} ${instrumentSerif.variable}`}><body>{children}</body></html>;
}
