import { Portfolio } from "@/components/portfolio";

const services = [
  ["Webdesign", "Ich gestalte und entwickle deine Website. Dabei plane ich Design und Funktion zusammen. Die Seite passt zu dir, deine Inhalte sind klar gegliedert und Besucher finden auf dem Handy genauso gut zum Ziel wie am Computer."],
  ["Webanwendungen", "Ich entwickle deine Anwendung für den Browser und richte die Bedienung nach deinen Abläufen aus. Du bekommst die Funktionen, die du dafür brauchst, etwa um Daten zu erfassen, zu finden oder zu bearbeiten."],
  ["Automatisierung", "Ich verbinde die Programme, die du bereits nutzt, und richte Abläufe ein, die dir wiederkehrende Arbeit abnehmen. So lassen sich etwa Daten übertragen oder Benachrichtigungen verschicken, ohne dass du jeden Schritt von Hand erledigst."],
];

function SectionHeader({ id, label, title, accent, description }: {
  id: string;
  label: string;
  title: string;
  accent: string;
  description: string;
}) {
  return (
    <header className="section-header">
      <p className="section-label">{label}</p>
      <h2 id={id} className="section-title">{title} <em>{accent}</em></h2>
      <p className="section-description">{description}</p>
    </header>
  );
}

export default function Home() {
  return (
    <Portfolio>
      <section id="leistungen" className="panel wrap" tabIndex={-1} aria-labelledby="services-title">
        <SectionHeader
          id="services-title" label="Leistungen" title="Was ich für dich" accent="umsetze"
          description="Bevor ich loslege, klären wir, wer das Ergebnis nutzt und welche Aufgabe es erfüllen soll."
        />
        <ol className="services">
          {services.map(([title, description], index) => (
            <li key={title}>
              <span className="service-number" aria-hidden="true">0{index + 1}</span>
              <h3>{title}</h3><p>{description}</p>
            </li>
          ))}
        </ol>
      </section>
      <section id="projekte" className="panel wrap" tabIndex={-1} aria-labelledby="projects-title">
        <SectionHeader
          id="projects-title" label="Projekte" title="Ausgewählte" accent="Arbeiten"
          description="Hier zeige ich künftig, warum ich eine Seite so aufgebaut oder eine Funktion so umgesetzt habe."
        />
        <div className="projects">
          {["A", "B"].map((id) => (
            <article className="project-card" key={id}>
              <div className="project-media" aria-hidden="true" />
              <div className="project-copy">
                <small>Projektplatzhalter</small>
                <h3>Projekt {id}</h3>
                <p>Hier folgt ein Einblick in das Projekt.</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </Portfolio>
  );
}
