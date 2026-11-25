import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { chromium } from "playwright";

const url = process.env.PORTFOLIO_TEST_URL ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({
  channel: process.env.PORTFOLIO_BROWSER_CHANNEL ?? (existsSync(chromium.executablePath()) ? "chromium" : "chrome"),
});
try {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(url);
  const nav = page.getByRole("navigation", { name: "Hauptnavigation" });
  const heroContact = page.locator(".hero").getByRole("link", { name: "Kontakt aufnehmen" });
  const heroProjects = page.locator(".hero").getByRole("link", { name: "Projekte ansehen", exact: true });
  assert.equal(await page.locator(".actions [data-slot='button']").count(), 2);
  assert.equal(await heroProjects.evaluate(el => getComputedStyle(el).boxShadow), "none");
  assert.equal(await nav.getByText("Waldemar Haar").count(), 0);
  assert.equal(await page.getByRole("heading", { name: "Was ich für dich umsetze", exact: true }).count(), 1);
  assert.equal(await page.getByRole("heading", { name: "Ausgewählte Arbeiten", exact: true }).count(), 1);
  for (const title of await page.locator(".section-title em").all()) {
    assert.equal(await title.evaluate(el => getComputedStyle(el).fontStyle), "italic");
  }

  for (const [width, height] of [[1440, 900], [768, 1024], [360, 800], [640, 360], [320, 450]]) {
    await page.setViewportSize({ width, height });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    const mobileMenu = width <= 700;
    assert.equal(await nav.getByRole("button", { name: "Menü" }).count(), mobileMenu ? 1 : 0);
    assert.equal(await nav.getByRole("link").count(), mobileMenu ? 0 : 4);
    const navContent = await nav.locator(mobileMenu ? ".menu-toggle" : ".nav-links").boundingBox();
    assert.ok(Math.abs(navContent.x + navContent.width / 2 - width / 2) < 1);
    if (mobileMenu) {
      const menu = nav.getByRole("button", { name: "Menü", exact: true });
      assert.equal(await menu.innerText(), "Menü");
      assert.equal(await menu.evaluate(el => getComputedStyle(el).borderTopWidth), "0px");
      assert.equal(await heroProjects.evaluate(el => getComputedStyle(el).textDecorationLine), "none");
      const contact = await heroContact.boundingBox();
      const projects = await heroProjects.boundingBox();
      assert.ok(projects.y >= contact.y + contact.height);
    }
    assert.equal(await page.getByRole("heading", { level: 1, name: "Digitale Produkte", exact: true }).count(), 1);
    assert.equal(await page.locator(".name").innerText(), "WALDEMAR HAAR");
    const wordTops = await page.locator(".hero-word").evaluateAll(words => words.map(word => word.getBoundingClientRect().top));
    assert.equal(wordTops[1] > wordTops[0], width <= 700);
    const cueColors = await page.locator(".name, .section-label, .hero-description, .scroll-cue").evaluateAll(els => els.map(el => getComputedStyle(el).color));
    assert.equal(new Set(cueColors).size, 1);
    assert.equal(await page.locator(".lead-prefix").innerText(), "Dein Ansprechpartner für");
    assert.equal(await page.locator(".terms").innerText(), "Webdesign · Webanwendungen · Automatisierung");
    assert.equal(await page.locator(".terms").evaluate(el => getComputedStyle(el).display), "inline");
    assert.equal(await page.locator(".typed-service").count(), 0);
    assert.equal(await page.locator(".hero-backdrop canvas").count(), 0);
    assert.equal(await page.locator(".shader-plane").evaluate(el => getComputedStyle(el).backgroundImage), "none");
    assert.equal(await page.locator(".hero").evaluate(el => getComputedStyle(el).backgroundColor), "rgb(0, 0, 0)");
    await heroProjects.click();
    assert.equal(new URL(page.url()).hash, "#projekte");
    assert.equal(await page.locator(".project-card").count(), 2);
    assert.equal(await page.locator(".project-card :is(a,button)").count(), 0);
    const cardLayout = await page.locator(".project-card").evaluateAll(([a,b]) =>
      b.getBoundingClientRect().top >= a.getBoundingClientRect().bottom);
    assert.equal(cardLayout, width <= 700);
    if (width > 700) {
      const bottoms = await page.locator(".project-copy").evaluateAll(copies => copies.map(el => el.getBoundingClientRect().bottom));
      assert.ok(Math.abs(bottoms[0] - bottoms[1]) < 1);
    }
  }

  await page.setViewportSize({ width: 360, height: 800 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction(() => !document.querySelector(".topnav").hasAttribute("data-scrolled"));
  const mobileGlass = () => nav.locator(".nav-bar").evaluate(el => {
    const glass = getComputedStyle(el, "::before");
    return { opacity: glass.opacity, width: glass.width, blur: glass.backdropFilter.includes("blur") };
  });
  assert.equal((await mobileGlass()).opacity, "0");
  await heroContact.focus();
  await page.keyboard.press("Enter");
  assert.equal(new URL(page.url()).hash, "#kontakt");
  await page.waitForFunction(() => document.querySelector(".topnav").hasAttribute("data-scrolled"));
  assert.deepEqual(await mobileGlass(), { opacity: "1", width: "96px", blur: true });
  assert.equal(await page.locator("#kontakt").getByRole("button", { name: "Kontakt aufnehmen" }).isDisabled(), true);
  assert.equal(await page.locator("form, input, textarea, #brief").count(), 0);
  const menu = page.getByRole("button", { name: "Menü" });
  await menu.click();
  assert.equal(await nav.getByRole("button", { name: "Schließen", exact: true }).count(), 1);
  assert.equal(await nav.locator("#nav-links").evaluate(el => getComputedStyle(el).transitionDuration), "0s");
  await page.keyboard.press("Escape");
  assert.equal(await menu.evaluate((el) => el === document.activeElement), true);
  await menu.click();
  await page.getByRole("navigation").getByRole("link", { name: "Kontakt", exact: true }).click();
  assert.equal(await menu.getAttribute("aria-expanded"), "false");
  assert.equal(await page.locator("#kontakt").evaluate(el => el === document.activeElement), true);
  assert.equal(await page.locator("#kontakt").evaluate(el => getComputedStyle(el).outlineStyle), "none");
  assert.equal(await page.locator("footer").getByRole("link", { name: "Kontakt", exact: true }).getAttribute("href"), "#kontakt");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => { document.documentElement.style.zoom = "2"; });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.evaluate(() => { document.documentElement.style.zoom = ""; window.scrollTo(0, 0); });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(url);
  assert.equal(await nav.getAttribute("data-scrolled"), null);
  const home = nav.getByRole("link", { name: "Home", exact: true });
  assert.equal(await home.getAttribute("href"), "#seitenanfang");
  assert.equal(await nav.getByRole("link", { name: "Kontakt aufnehmen" }).count(), 0);
  const letters = page.locator(".hero-letter");
  assert.equal(await letters.allTextContents().then(chars => chars.join("")), "DigitaleProdukte");
  assert.equal(await page.locator(".hero-slice").count(), (await letters.count()) * 3);
  const firstGlyph = page.locator(".hero-glyph").first();
  assert.equal(await firstGlyph.evaluate(el => getComputedStyle(el).animationName), "letter-focus");
  const sliceDelays = await letters.first().locator(".hero-slice").evaluateAll(slices =>
    slices.map(el => parseFloat(getComputedStyle(el).animationDelay)));
  assert.deepEqual(sliceDelays, [0, .1, .2]);
  assert.equal(await firstGlyph.evaluate(el => getComputedStyle(el).animationDelay), "0.3s");
  const animationWindow = el => {
    const style = getComputedStyle(el);
    const start = parseFloat(style.animationDelay);
    return { start, end: start + parseFloat(style.animationDuration) };
  };
  const nameReveal = await page.locator(".name").evaluate(animationWindow);
  assert.equal(nameReveal.end, .4);
  for (const part of await page.locator(".hero-backdrop, .topnav").all()) {
    const reveal = await part.evaluate(animationWindow);
    assert.equal(reveal.start, sliceDelays[0]);
    assert.ok(reveal.end >= .8);
  }
  const typed = page.locator(".typed-service");
  await typed.waitFor();
  assert.equal(await typed.evaluate((el) => getComputedStyle(el, "::after").animationName), "caret");
  await page.evaluate(() => document.fonts.ready);
  const prefixLeft = () => page.locator(".lead-prefix").evaluate(el => el.getBoundingClientRect().left);
  const fixedLeft = await prefixLeft();
  for (const word of ["Webdesign", "Webanwendungen", "Automatisierung", "Webdesign"]) {
    await page.waitForFunction((word) => document.querySelector(".typed-service")?.textContent === word, word);
    assert.equal(await prefixLeft(), fixedLeft);
    await page.waitForFunction(() => document.querySelector(".typed-service")?.textContent === "");
    assert.equal(await prefixLeft(), fixedLeft);
  }
  await page.locator(".hero-backdrop canvas").first().waitFor({ state: "attached" });
  const wheelAnimation = () => page.locator(".scroll-mouse").evaluate((el) =>
    getComputedStyle(el, "::after").animationName);
  assert.equal(await wheelAnimation(), "scroll-wheel");
  const navProjects = nav.getByRole("link", { name: "Projekte", exact: true });
  assert.equal(await navProjects.evaluate(el => getComputedStyle(el).fontStyle), "normal");
  await navProjects.hover();
  assert.equal(await navProjects.evaluate(el => getComputedStyle(el).textDecorationLine), "none");
  assert.ok(await navProjects.locator(".rolling-label > span").first().evaluate(el =>
    el.getAnimations().some(animation => animation.transitionProperty === "transform") || getComputedStyle(el).transform !== "none"));
  await heroProjects.hover();
  await page.waitForFunction(() => getComputedStyle(document.querySelector(".work-link .rolling-label > span:last-child")).transform === "none");
  assert.equal(await heroProjects.evaluate(el => getComputedStyle(el).backgroundColor), "rgba(255, 255, 255, 0.098)");
  assert.equal(await heroProjects.evaluate(el => getComputedStyle(el).outlineStyle), "none");
  const contactSurface = () => heroContact.evaluate(el => {
    const style = getComputedStyle(el);
    return { color: style.backgroundColor, shadow: style.boxShadow };
  });
  const idleContactSurface = await contactSurface();
  assert.equal(idleContactSurface.color, "rgb(245, 243, 235)");
  const contactArrow = heroContact.locator(".pill-arrow svg");
  assert.ok(await contactArrow.evaluate(el => new DOMMatrix(getComputedStyle(el).transform).b > .7));
  await heroContact.hover();
  await page.waitForFunction(() => getComputedStyle(document.querySelector(".actions .pill-arrow svg")).transform === "none");
  assert.deepEqual(await contactSurface(), idleContactSurface);
  assert.equal(await heroContact.evaluate(el => getComputedStyle(el).outlineStyle), "none");
  await page.waitForFunction(() => document.querySelector(".shader-plane").style.transform !== "");
  const expandedHomeLeft = (await home.boundingBox()).x;
  await page.evaluate(() => window.scrollTo({ top: 240, behavior: "instant" }));
  await page.waitForFunction(left => {
    const bar = document.querySelector(".nav-bar");
    const glass = getComputedStyle(bar, "::before");
    return bar.querySelector('a[href="#seitenanfang"]').getBoundingClientRect().left > left + 15
      && parseFloat(glass.width) < bar.clientWidth - 100
      && glass.opacity === "1" && glass.backdropFilter.includes("blur");
  }, expandedHomeLeft);
  await page.waitForFunction(() => parseFloat(document.querySelector(".hero-copy").style.opacity) < .95);
  const media = page.locator(".project-media").first();
  await media.evaluate(el => el.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForFunction(() => document.querySelector('.nav-links a[href="#projekte"]').getAttribute("aria-current") === "location");
  await page.waitForFunction(() => parseFloat(document.querySelector(".project-media").style.backgroundPositionY) > 0);
  const position = await media.evaluate(el => parseFloat(el.style.backgroundPositionY));
  await page.evaluate(() => window.scrollBy({ top: 120, behavior: "instant" }));
  await page.waitForFunction(previous => parseFloat(document.querySelector(".project-media").style.backgroundPositionY) > previous, position);
  await page.waitForFunction(() =>
    [...document.querySelectorAll("#projekte .section-header, .project-card")].every(el => getComputedStyle(el).opacity === "1"));
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(await wheelAnimation(), "none");
  assert.equal(await firstGlyph.evaluate(el => getComputedStyle(el).animationName), "none");
  assert.equal(await page.locator(".hero-shutter").first().isVisible(), false);
  await page.waitForFunction(() => document.querySelector(".project-media").style.backgroundPositionY === "");
  assert.equal(await page.locator(".hero-copy").evaluate(el => el.style.opacity), "");
  assert.equal(await page.locator(".footer-wordmark").count(), 0);
  await home.click();
  assert.equal(new URL(page.url()).hash, "#seitenanfang");
  await page.waitForFunction(() => window.scrollY === 0);
  await page.locator(".hero-backdrop canvas").first().waitFor({ state: "detached" });
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await menu.click();
  const close = nav.getByRole("button", { name: "Schließen", exact: true });
  assert.equal(await close.getAttribute("aria-expanded"), "true");
  const panel = nav.locator("#nav-links");
  assert.ok((await panel.boundingBox()).width < 280);
  const arrow = panel.locator(".menu-arrow").first();
  assert.equal(await arrow.evaluate(el => getComputedStyle(el).width), "12px");
  assert.equal(await arrow.locator("path").getAttribute("stroke-width"), ".8");
  await page.waitForFunction(() => getComputedStyle(document.querySelector("#nav-links")).opacity === "1");
  assert.equal(await close.locator(".rolling-label").evaluate(el => getComputedStyle(el).overflow), "hidden");
  const outgoing = close.locator(".rolling-label > span").first();
  assert.equal(await outgoing.evaluate(el => getComputedStyle(el).transitionProperty), "transform");
  await page.waitForFunction(() => {
    const label = document.querySelector(".menu-toggle .rolling-label > span");
    return Math.abs(new DOMMatrix(getComputedStyle(label).transform).m42 - label.getBoundingClientRect().height) < .1;
  });
  assert.ok(await panel.evaluate(el => getComputedStyle(el).transitionProperty.includes("opacity")));
  await close.click();
  assert.equal(await menu.getAttribute("aria-expanded"), "false");
  assert.equal(await panel.evaluate(el => el.inert), true);
  await panel.waitFor({ state: "hidden" });
  await page.waitForFunction(() => {
    const label = document.querySelector(".menu-toggle .rolling-label > span:last-child");
    return Math.abs(new DOMMatrix(getComputedStyle(label).transform).m42 + label.getBoundingClientRect().height) < .1;
  });
  assert.equal(await nav.getByRole("link").count(), 0);
  await heroProjects.hover();
  await page.waitForFunction(() => getComputedStyle(document.querySelector(".work-link .rolling-label > span:last-child")).transform === "none");
  assert.equal(await heroProjects.evaluate(el => getComputedStyle(el).backgroundColor), "rgba(0, 0, 0, 0)");
  assert.equal(await heroProjects.evaluate(el => getComputedStyle(el).outlineStyle), "none");
  await heroContact.hover();
  await page.waitForFunction(() => getComputedStyle(document.querySelector(".actions .pill-arrow svg")).transform === "none");
  assert.equal(await heroContact.evaluate(el => getComputedStyle(el).outlineStyle), "none");

  const touchPage = await browser.newPage({ viewport: { width: 393, height: 720 }, isMobile: true, hasTouch: true });
  touchPage.on("pageerror", error => errors.push(error.message));
  await touchPage.addInitScript(() => {
    const adapter = new Promise(resolve => { window.finishShaderRequest = () => resolve(null); });
    Object.defineProperty(navigator, "gpu", { value: { requestAdapter: () => adapter } });
  });
  let releaseFonts;
  const fontsHeld = new Promise(resolve => { releaseFonts = resolve; });
  await touchPage.route("**/*.woff2", async route => {
    await fontsHeld;
    await route.continue();
  });
  const heroLayout = () => touchPage.locator(".hero-copy, .hero-word, .lead-prefix, .actions").evaluateAll(elements =>
    elements.map(el => {
      const { x, y, width, height } = el.getBoundingClientRect();
      return [x, y, width, height];
    }));
  let layoutBeforeFonts;
  try {
    await touchPage.goto(url, { waitUntil: "domcontentloaded" });
    await touchPage.locator(".hero-backdrop canvas").waitFor({ state: "attached" });
    assert.equal(await touchPage.locator(".hero-glyph").first().evaluate(el => getComputedStyle(el).animationPlayState), "paused");
    assert.equal(await touchPage.locator(".hero-backdrop").evaluate(el => getComputedStyle(el).opacity), "0");
    assert.equal(await touchPage.locator(".hero").evaluate(el => getComputedStyle(el, "::before").opacity), "1");
    await touchPage.evaluate(() => window.finishShaderRequest());
    const copyAnimationNames = await touchPage.locator(".hero-lead, .hero-description").evaluateAll(elements =>
      elements.map(el => getComputedStyle(el).animationName));
    assert.deepEqual(copyAnimationNames, ["copy-arrive", "copy-arrive"]);
    assert.deepEqual(await touchPage.locator(".actions").evaluate(el => {
      const style = getComputedStyle(el);
      return [style.animationName, style.animationDuration, style.animationTimingFunction];
    }), ["fade-in", "0.85s", "ease-in-out"]);
    await touchPage.waitForFunction(() =>
      [...document.querySelectorAll(".name, .hero-lead, .hero-description, .actions, .hero-glyph")]
        .every(el => getComputedStyle(el).opacity === "1"));
    layoutBeforeFonts = await heroLayout();
  } finally {
    releaseFonts();
  }
  await touchPage.evaluate(() => document.fonts.ready);
  assert.deepEqual(await heroLayout(), layoutBeforeFonts);
  assert.equal(await touchPage.locator(".hero").getAttribute("data-title-fallback"), "true");
  const mobileIntro = touchPage.locator(".hero-copy :is(.hero-glyph, .hero-lead, .hero-description, .actions)");
  assert.ok(await mobileIntro.evaluateAll(elements => elements.every(el => getComputedStyle(el).willChange === "opacity")));
  assert.equal(await touchPage.evaluate(() => window.scrollY), 0);
  const heroHeight = await touchPage.locator(".hero").evaluate(el => el.clientHeight);
  await touchPage.evaluate(() => window.scrollTo({ top: 160, behavior: "instant" }));
  await touchPage.waitForFunction(() => {
    const shader = getComputedStyle(document.querySelector(".shader-media"));
    return new DOMMatrix(shader.transform).m42 > 0;
  });
  assert.equal(await touchPage.locator(".hero-copy").evaluate(el => getComputedStyle(el).opacity), "1");
  assert.equal(await touchPage.locator(".hero").evaluate(el => el.clientHeight), heroHeight);
  await touchPage.getByRole("button", { name: "Menü", exact: true }).tap();
  await touchPage.getByRole("navigation").getByRole("link", { name: "Leistungen", exact: true }).tap();
  assert.equal(new URL(touchPage.url()).hash, "#leistungen");
  assert.equal(await touchPage.locator("#leistungen").evaluate(el => getComputedStyle(el).outlineStyle), "none");
  const footerLinks = await touchPage.locator("footer a").evaluateAll(links => links.map(link => link.getBoundingClientRect().height));
  assert.ok(footerLinks.every(height => height >= 44));
  await touchPage.close();

  const noGpuPage = await browser.newPage();
  noGpuPage.on("pageerror", error => errors.push(error.message));
  await noGpuPage.addInitScript(() => Object.defineProperty(navigator, "gpu", { value: undefined }));
  await noGpuPage.route("**/*.woff2", async route => {
    await new Promise(resolve => setTimeout(resolve, 850));
    await route.continue();
  });
  await noGpuPage.goto(url, { waitUntil: "domcontentloaded" });
  await noGpuPage.locator(".typed-service").waitFor();
  assert.equal(await noGpuPage.locator(".hero-backdrop canvas").count(), 0);
  const titleHasLoadedFont = await noGpuPage.locator("#headline").evaluate(el => {
    const family = getComputedStyle(el).fontFamily.split(",")[0].replaceAll('"', "");
    return [...document.fonts].some(face => face.family.replaceAll('"', "") === family && face.status === "loaded");
  });
  assert.equal(titleHasLoadedFont, true);
  await noGpuPage.close();
  assert.deepEqual(errors, []);
  console.log("OK: Layout, Glasnavigation, Kontaktbutton, Hero- und Projektparallaxe, Projektanker und reduzierte Bewegung.");
} finally {
  await browser.close();
}
