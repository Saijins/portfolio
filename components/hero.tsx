"use client";

import dynamic from "next/dynamic";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "./arrow-up-right";
import { RollingLabel } from "./rolling-label";

const ShaderBackdrop = dynamic(() => import("./shader-backdrop"), { ssr: false });
const services = ["Webdesign", "Webanwendungen", "Automatisierung"];
const headline = "Digitale Produkte";

function TypedService() {
  const [text, setText] = useState(services[0]);

  useEffect(() => {
    let index = 0;
    let length = services[0].length;
    let deleting = true;
    let timer: number;

    function tick() {
      const word = services[index];
      length += deleting ? -1 : 1;
      setText(word.slice(0, length));
      let delay = deleting ? 60 : 105;
      if (length === word.length) {
        deleting = true;
        delay = 1450;
      } else if (length === 0) {
        deleting = false;
        index = (index + 1) % services.length;
        delay = 300;
      }
      timer = window.setTimeout(tick, delay);
    }

    timer = window.setTimeout(tick, 3200);
    return () => window.clearTimeout(timer);
  }, []);

  return <span className="typed-service">{text}</span>;
}

export function Hero() {
  const hero = useRef<HTMLElement>(null);
  const [motionActive, setMotionActive] = useState(false);

  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let inView = true;
    const update = () => setMotionActive(inView && !document.hidden && !preference.matches);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    observer.observe(hero.current!);
    preference.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <section className="hero" id="seitenanfang" ref={hero} tabIndex={-1} aria-labelledby="headline">
      <div className="hero-backdrop" aria-hidden="true">
        <div className="shader-media">
          <div className="shader-plane">{motionActive && <ShaderBackdrop />}</div>
        </div>
      </div>
      <div className="hero-copy">
        <p className="name">Waldemar Haar</p>
        <h1 id="headline" aria-label={headline}>
          {headline.split(" ").map((word, index) => (
            <span key={word} aria-hidden="true">{index > 0 && " "}
              <span className="hero-word">{Array.from(word, (letter, i) => (
                <span className="hero-letter" key={i} style={{ "--delay": `${(headline.indexOf(word) + i) * 40}ms` } as CSSProperties}>
                  <span className="hero-glyph">{letter}</span>
                  <span className="hero-shutter">
                    {[0, 1, 2].map(slice => <span className="hero-slice" data-letter={letter} key={slice} />)}
                  </span>
                </span>
              ))}</span>
            </span>
          ))}
        </h1>
        <p className="hero-lead"><span className="lead-prefix">Dein Ansprechpartner für</span>{" "}
          <span className="terms" aria-hidden="true">
            {motionActive ? <TypedService /> : (
              <span>{services[0]}<span className="reduced-services"> · {services.slice(1).join(" · ")}</span></span>
            )}
          </span>
          <span className="sr-only">{services.slice(0, -1).join(", ")} und {services.at(-1)}</span>
        </p>
        <p className="hero-description">Du hast eine Idee oder willst etwas Bestehendes verbessern? Ich helfe dir bei der Umsetzung.</p>
        <div className="actions">
          <Button className="pill" asChild>
            <a href="#kontakt">
              Kontakt aufnehmen <span className="pill-arrow"><ArrowUpRight /></span>
            </a>
          </Button>
          <Button variant="ghost" className="work-link" asChild>
            <a href="#projekte"><RollingLabel text="Projekte ansehen" /></a>
          </Button>
        </div>
      </div>
      <div className="scroll-cue" aria-hidden="true"><span className="scroll-mouse" /><span className="scroll-label">Scroll</span></div>
    </section>
  );
}
