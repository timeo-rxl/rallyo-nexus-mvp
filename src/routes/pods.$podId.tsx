import { createFileRoute, Link } from "@tanstack/react-router";
import { BreakdownView, MemberRow, icebreakerText } from "@/components/ui-bits";
import { joinPod, leavePod, rate, useEngine } from "@/lib/store";
import { MAX_POD } from "@/lib/matching";
import { SLOT_LABEL, SPORT_LABEL } from "@/lib/data";
import soccer from "@/assets/soccer.jpg";
import tennis from "@/assets/tennis.jpg";
import basket from "@/assets/hero-basket.jpg";

const IMG = { soccer, tennis, basketball: basket };

export const Route = createFileRoute("/pods/$podId")({
  head: () => ({ meta: [
    { title: "Détail du pod — Rallyo" },
    { name: "description", content: "Membres, terrain, horaire et compatibilité du pod." },
    { property: "og:title", content: "Détail du pod — Rallyo" },
    { property: "og:description", content: "Membres, terrain et compatibilité du pod." },
  ] }),
  component: PodDetail,
});

function PodDetail() {
  const { podId } = Route.useParams();
  const { pods, state, me } = useEngine();
  const pod = pods.find((p) => p.id === podId);
  if (!pod) return <div className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="text-4xl">Pod introuvable</h1><Link to="/pods" className="btn btn-ghost mt-6">Retour aux pods</Link></div>;
  const mine = state.joinedPodId === pod.id;
  const canJoin = me && me.sport === pod.sport && me.slots.includes(pod.slot) && pod.members.length < MAX_POD;
  const rating = state.ratings[pod.id] ?? 0;
  const ids = pod.members.map((m) => m.id);

  return (
    <div>
      <section className="duotone text-primary-foreground">
        <img src={IMG[pod.sport]} alt="" width={1200} height={800} className="absolute inset-0 h-full w-full object-cover" />
        <div className="relative z-10 mx-auto max-w-5xl px-4 pb-10 pt-24">
          <Link to="/pods" className="text-sm opacity-80 hover:opacity-100">← Pods de la semaine</Link>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="pill !border-transparent !bg-accent !text-accent-foreground">{SPORT_LABEL[pod.sport]}</span>
            {pod.spark && <span className="pill">Spark dans le pod</span>}
          </div>
          <h1 className="mt-3 text-5xl md:text-7xl">{pod.field.name}</h1>
          <p className="mt-2 text-lg opacity-90">{SLOT_LABEL[pod.slot]} · {pod.field.neighbourhood} · {pod.members.length}/{MAX_POD} joueurs</p>
        </div>
      </section>
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 md:grid-cols-[1.3fr_1fr]">
        <div className="card-r p-6">
          <h2 className="text-2xl">Le pod</h2>
          <ul className="mt-3 divide-y divide-border">{pod.members.map((m, i) => <MemberRow key={m.id} s={m} i={i} />)}</ul>
          <p className="mt-5 border-l-2 border-accent pl-3 text-sm italic">{icebreakerText(pod)}</p>
          <div className="mt-6">
            {mine ? <button className="btn btn-ghost w-full" onClick={leavePod}>Quitter le pod</button>
              : <button className="btn btn-accent w-full" disabled={!canJoin} onClick={() => joinPod(pod.id)}>
                  {!me ? "Crée ton profil pour rejoindre" : pod.members.length >= MAX_POD ? "Complet" : canJoin ? "Rejoindre" : "Autre sport / créneau"}
                </button>}
          </div>
        </div>
        <div className="space-y-6">
          <div className="card-r p-6"><BreakdownView score={pod.score} b={pod.breakdown} /></div>
          <div className="card-r p-6">
            <h2 className="text-2xl">Après le match</h2>
            <p className="mt-2 text-sm text-muted-foreground">Ta note ajuste ton affinité avec ces joueurs pour les prochains matchs (±0,05 par étoile autour de 3).</p>
            <div className="mt-4 flex gap-1" role="radiogroup" aria-label="Note de la sortie">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} role="radio" aria-checked={rating === n} aria-label={`${n} étoile${n > 1 ? "s" : ""}`} disabled={!mine}
                  onClick={() => rate(pod.id, ids, n)}
                  className={`h-11 w-11 rounded-full border font-display text-lg transition ${n <= rating ? "border-accent bg-accent text-accent-foreground" : "border-input bg-card hover:bg-secondary"} disabled:opacity-40`}>{n}</button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{!mine ? "Rejoins ce pod pour le noter." : rating ? `Merci. Note enregistrée : ${rating}/5. Score du pod mis à jour.` : "Comment s'est passée la sortie ?"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
