import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero-basket.jpg";
import soccer from "@/assets/soccer.jpg";
import tennis from "@/assets/tennis.jpg";
import { useEngine } from "@/lib/store";
import { PodCard } from "@/components/ui-bits";
import { FIELDS, STUDENTS } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Rallyo — Arrête de scroller. Va jouer." },
    { name: "description", content: "On forme un pod de 4 à 6 étudiants compatibles et on vous réserve le terrain, à Montréal." },
    { property: "og:title", content: "Rallyo — Arrête de scroller. Va jouer." },
    { property: "og:description", content: "Pods sportifs étudiants à Montréal : soccer, basketball, tennis." },
  ] }),
  component: Index,
});

const PROBLEMS = [
  { n: "01", t: "Hyper-connectés mais isolés", d: "Des centaines d'abonnés, personne pour un match jeudi soir.", img: soccer },
  { n: "02", t: "Organiser prend trop de temps", d: "Le groupe de discussion meurt avant que quelqu'un réserve le terrain.", img: hero },
  { n: "03", t: "Terrains municipaux vides", d: "Montréal a des parcs superbes. Ils restent vides en semaine.", img: tennis },
];
const STEPS = [
  { n: "1", t: "Dis ton sport", d: "Sport, niveau, créneau, quartier. Deux minutes, pas plus." },
  { n: "2", t: "On forme ton pod", d: "4 à 6 personnes compatibles en niveau, intérêts et énergie." },
  { n: "3", t: "Rendez-vous au terrain", d: "Le parc est choisi près de chez la majorité. Tu n'as qu'à venir." },
];

function Index() {
  const { pods } = useEngine();
  const players = STUDENTS.length;
  return (
    <>
      <section className="duotone min-h-[88vh] text-primary-foreground">
        <img src={hero} alt="Match de basketball entre étudiants sur un terrain extérieur à Montréal" width={1600} height={1008} className="absolute inset-0 h-full w-full object-cover" />
        <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-12 pt-24">
          <p className="pill w-fit !border-transparent !bg-accent !text-accent-foreground">Montréal · Saison automne</p>
          <h1 className="mt-5 max-w-4xl text-6xl sm:text-7xl md:text-[8.5rem]">Arrête de scroller. <span className="text-accent">Va jouer.</span></h1>
          <p className="mt-6 max-w-xl text-base opacity-90 md:text-lg">Dis-nous ce que tu veux jouer : on forme un pod de 4 à 6 personnes compatibles et on vous réserve le terrain. Pas de swipe, pas d'organisation, pas de blancs gênants.</p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link to="/trouve" className="btn btn-accent px-8 py-4 text-base">Trouve ton pod</Link>
            <dl className="flex gap-8">
              {[[pods.length, "pods cette semaine"], [players, "étudiants"], [FIELDS.length, "terrains"]].map(([v, l]) => (
                <div key={l as string}><dt className="font-display text-4xl">{v}</dt><dd className="text-xs uppercase tracking-wider opacity-75">{l}</dd></div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Le problème</p>
        <h2 className="mt-2 max-w-3xl text-4xl md:text-6xl">Tout le monde veut bouger. Personne n'organise.</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {PROBLEMS.map((p) => (
            <article key={p.n} className="card-r overflow-hidden">
              <div className="duotone h-40"><img src={p.img} alt="" loading="lazy" width={1200} height={800} className="h-full w-full object-cover" /></div>
              <div className="p-5"><span className="font-display text-accent">{p.n}</span><h3 className="mt-1 text-2xl">{p.t}</h3><p className="mt-2 text-sm text-muted-foreground">{p.d}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-primary py-20 text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-4xl md:text-6xl">Comment ça marche</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="border-t-2 border-accent pt-5">
                <span className="font-display text-6xl text-accent">{s.n}</span>
                <h3 className="mt-3 text-2xl">{s.t}</h3><p className="mt-2 text-sm opacity-75">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-4xl md:text-6xl">Les pods de la semaine</h2>
          <Link to="/pods" className="btn btn-ghost">Tout voir</Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{pods.map((p) => <PodCard key={p.id} pod={p} />)}</div>
      </section>
    </>
  );
}
