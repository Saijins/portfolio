"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "./arrow-up-right";
import { RollingLabel } from "./rolling-label";
import { Hero } from "./hero";

const navigation = [
  ["seitenanfang", "Home"],
  ["leistungen", "Leistungen"],
  ["projekte", "Projekte"],
  ["kontakt", "Kontakt"],
] as const;

export function Portfolio({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [current, setCurrent] = useState("seitenanfang");
  const menuButton = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = root.current!;
    const hero = sections.querySelector<HTMLElement>(".hero")!;
    const mobile = matchMedia("(max-width: 700px)");
    const updateMenu = () => {
      setMobileMenu(mobile.matches);
      setMenuOpen(false);
    };
    updateMenu();
    mobile.addEventListener("change", updateMenu);
    const updateNavigation = () => {
      setScrolled(window.scrollY > 80);
      let active = "seitenanfang";
      for (const [id] of navigation) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= innerHeight * .45) active = id;
      }
      setCurrent(active);
    };
    updateNavigation();
    window.addEventListener("scroll", updateNavigation, { passive: true });
    window.addEventListener("resize", updateNavigation);

    gsap.registerPlugin(ScrollTrigger, CustomEase);
    const motion = gsap.matchMedia(root);
    motion.add({
      animate: "(prefers-reduced-motion: no-preference)",
      touch: "(hover: none) and (pointer: coarse)",
    }, ({ conditions }) => {
      if (!conditions?.animate) return;
      const q = gsap.utils.selector(sections);
      const heroScroll = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: .6 },
      });
      if (conditions.touch) {
        heroScroll.to(q(".shader-media"), { yPercent: 8, scale: 1.08 }, 0);
      } else {
        heroScroll.fromTo(q(".hero-backdrop"), { clipPath: "inset(0% 0% 0% 0% round 0px)" }, {
          clipPath: "inset(7% 3.5% 0% 3.5% round 32px)",
        }, 0)
          .to(q(".shader-media"), { yPercent: 24, scale: 1.24 }, 0)
          .to(q(".hero-copy"), { yPercent: -42, opacity: 0 }, 0);
      }
      heroScroll.to(q(".scroll-cue"), { opacity: 0, duration: .18 }, 0);

      // Reveal timing from Hirael Portfolio (MIT, Mohammad Shehadeh).
      const reveal = { opacity: 0, y: 30, ease: CustomEase.create("", ".25,.1,.25,1") };
      for (const heading of q(".section-header, #contact-title")) {
        gsap.from(heading, {
          ...reveal, duration: 1,
          scrollTrigger: { trigger: heading, start: "clamp(top bottom-=100px)", once: true },
        });
      }
      gsap.from(q(".project-card"), {
        ...reveal, duration: .7, stagger: .12,
        scrollTrigger: { trigger: q(".projects")[0], start: "clamp(top bottom-=80px)", once: true },
      });
      for (const [index, row] of q(".services li").entries()) {
        gsap.from(row, {
          ...reveal, y: 24, duration: .6, delay: index * .08,
          scrollTrigger: { trigger: row, start: "clamp(top bottom-=60px)", once: true },
        });
      }
      for (const item of q(".contact-card > button, .footer-columns > div")) {
        gsap.from(item, {
          ...reveal, y: 24, duration: .6,
          scrollTrigger: { trigger: item, start: "clamp(top bottom-=60px)", once: true },
        });
      }
      for (const media of q(".project-media")) {
        gsap.fromTo(media, { backgroundPositionY: "0%" }, {
          backgroundPositionY: "100%", ease: "none",
          scrollTrigger: { trigger: media.parentElement, start: "top bottom", end: "bottom top", scrub: .6 },
        });
      }
      gsap.fromTo(q(".contact-surface"), { clipPath: "inset(10% 14% 10% 14% round 42px)" }, {
        clipPath: "inset(0% 0% 0% 0% round 24px)", ease: "none",
        scrollTrigger: { trigger: q(".contact-card")[0], start: "top bottom", end: "clamp(center 60%)", scrub: .6 },
      });
    });
    motion.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
      const moveMedia = gsap.quickTo(".shader-plane", "x", { duration: 1.3, ease: "power3.out" });
      const liftMedia = gsap.quickTo(".shader-plane", "y", { duration: 1.3, ease: "power3.out" });
      const move = (event: PointerEvent) => {
        const bounds = hero.getBoundingClientRect();
        moveMedia((.5 - (event.clientX - bounds.left) / bounds.width) * 64);
        liftMedia((.5 - (event.clientY - bounds.top) / bounds.height) * 48);
      };
      const reset = () => {
        moveMedia(0);
        liftMedia(0);
      };
      hero.addEventListener("pointermove", move);
      hero.addEventListener("pointerleave", reset);
      return () => {
        hero.removeEventListener("pointermove", move);
        hero.removeEventListener("pointerleave", reset);
      };
    });
    return () => {
      mobile.removeEventListener("change", updateMenu);
      window.removeEventListener("scroll", updateNavigation);
      window.removeEventListener("resize", updateNavigation);
      motion.revert();
    };
  }, []);

  return (
    <div ref={root}>
      <a className="skip" href="#leistungen">Zum Angebot</a>
      <nav className="topnav" aria-label="Hauptnavigation" data-scrolled={scrolled || undefined}
        onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false); }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && menuOpen) {
            setMenuOpen(false);
            menuButton.current?.focus();
          }
        }}>
        <div className="nav-bar">
          <button type="button" className="menu-toggle" ref={menuButton} aria-label={menuOpen ? "Schließen" : "Menü"}
            aria-expanded={menuOpen} aria-controls="nav-links" onClick={() => setMenuOpen(!menuOpen)}>
            <RollingLabel text="Menü" nextText="Schließen" />
          </button>
          <div id="nav-links" className={menuOpen ? "nav-links expanded" : "nav-links"} inert={mobileMenu && !menuOpen}>
            {navigation.map(([id, label]) => (
              <a key={id} href={`#${id}`} aria-current={current === id ? "location" : undefined} onClick={() => setMenuOpen(false)}>
                <RollingLabel text={label} />
                <ArrowUpRight className="menu-arrow" />
              </a>
            ))}
          </div>
        </div>
      </nav>
      <main>
        <Hero />
        {children}
        <section className="panel wrap contact" id="kontakt" tabIndex={-1} aria-labelledby="contact-title">
          <div className="contact-card">
            <div className="contact-surface" aria-hidden="true" />
            <h2 id="contact-title" className="section-title">Erzähl mir von deiner <em>Idee</em>.</h2>
            <Button className="pill" disabled>Kontakt aufnehmen <span className="pill-arrow"><ArrowUpRight /></span></Button>
          </div>
        </section>
      </main>
      <footer>
        <div className="wrap">
          <div className="footer-columns">
            <div className="footer-brand">
              <strong>Waldemar Haar</strong>
              <p>Webdesign, Webanwendungen und Automatisierung.</p>
              <ul className="footer-socials" aria-label="Soziale Medien">
                {["Instagram", "LinkedIn", "TikTok"].map((platform) => (
                  <li key={platform}>
                    <img src={`${process.env.NEXT_PUBLIC_PAGES_BASE_PATH ?? ""}/social/${platform.toLowerCase()}.svg`} width="18" height="18" alt={platform} />
                  </li>
                ))}
              </ul>
            </div>
            <div className="footer-group">
              <h2>Portfolio</h2>
              <a href="#leistungen">Leistungen</a>
              <a href="#projekte">Projekte</a>
              <a href="#kontakt">Kontakt</a>
            </div>
            <div className="footer-group">
              <h2>Rechtliches</h2>
              <span>Impressum · Platzhalter</span>
              <span>Datenschutz · Platzhalter</span>
            </div>
          </div>
          <div className="footer-base"><small>© Waldemar Haar</small><a href="#seitenanfang">Nach oben ↑</a></div>
        </div>
      </footer>
    </div>
  );
}
