import { createFileRoute, Link } from "@tanstack/react-router";
import { Avatar, PageHeader } from "@/components/ui-bits";
import { useEngine } from "@/lib/store";
import { LEVEL_LABEL, SLOT_LABEL, SPORT_LABEL } from "@/lib/data";
import { MIN_POD } from "@/lib/matching";

export const Route = createFileRoute("/attente")({
  head: () => ({ meta: [
    { title: "Liste d'attente — Rallyo" },
    { name: "description", content: "Les joueurs en attente d'un pod et combien il en manque par sport et créneau." },
    { property: "og:title", content: "Liste d'attente — Rallyo" },
    { property: "og:description", content: "Joueurs en attente d'un pod sportif à Montréal." },
  ] }),
  component: Attente,
});

function Attente() {
  const { waitlist } = useEngine();
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <PageHeader kicker="Presque prêt" title="Liste d'attente" sub={`Un pod se forme à partir de ${MIN_POD} joueurs sur le même sport et le même créneau.`} />
      {waitlist.length === 0 && <p className="card-r p-8 text-center text-muted-foreground">Personne en attente cette semaine.</p>}
      <div className="space-y-5">
        {waitlist.map((w) => (
          <article key={`${w.sport}-${w.slot}`} className="card-r p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div><h2 className="text-3xl">{SPORT_LABEL[w.sport]}</h2><p className="text-muted-foreground">{SLOT_LABEL[w.slot]}</p></div>
              <div className="text-right"><span className="font-display text-5xl text-accent">{w.needed}</span><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">joueur{w.needed > 1 ? "s" : ""} manquant{w.needed > 1 ? "s" : ""}</p></div>
            </div>
            <div className="mt-4 flex gap-1.5">{Array.from({ length: MIN_POD }, (_, i) => <span key={i} className={`h-2 flex-1 rounded-full ${i < w.students.length ? "bg-primary" : "bg-secondary"}`} />)}</div>
            <ul className="mt-5 flex flex-wrap gap-4">
              {w.students.map((s, i) => (
                <li key={s.id} className="flex items-center gap-2"><Avatar s={s} i={i + 2} size={36} /><div><div className="text-sm font-semibold">{s.name}</div><div className="text-xs text-muted-foreground">{LEVEL_LABEL[s.level]} · {s.neighbourhood}</div></div></li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <div className="mt-8 text-center"><Link to="/trouve" className="btn btn-accent">Rejoindre un créneau</Link></div>
    </div>
  );
}
