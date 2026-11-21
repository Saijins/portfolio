import type { Metadata } from "next";
import "@fontsource-variable/inter/wght.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Digitale Produkte · Portfolio",
  description: "Webdesign, Webanwendungen und Automatisierung. Entdecke das Angebot und erzähl mir von deiner Idee.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de"><body>{children}</body></html>;
}
