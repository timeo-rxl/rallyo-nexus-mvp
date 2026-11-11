import { Link } from "@tanstack/react-router";
import { INTEREST_LABEL, LEVEL_LABEL, SLOT_LABEL, SPORT_LABEL, type Student } from "@/lib/data";
import { MAX_POD, type Breakdown, type Pod } from "@/lib/matching";
import { joinPod, useEngine } from "@/lib/store";

export function Avatar({ s, i, size = 40 }: { s: Student; i: number; size?: number }) {
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-full font-display text-primary-foreground"
      style={{ width: size, height: size, background: s.id === "me" ? "var(--accent)" : `var(--avatar-${(i % 5) + 2})`, fontSize: size * 0.42 }}>
      {s.name[0]}
    </span>
  );
}

export function Meter({ value, label }: { value: number; label?: string }) {
  return (
    <div>
      {label && <div className="mb-1 flex justify-between text-xs font-semibold text-muted-foreground"><span>{label}</span><span className="text-foreground tabular-nums">{value.toFixed(2)}</span></div>}
      <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-accent" style={{ width: `${Math.round(value * 100)}%` }} /></div>
    </div>
  );
}

export function BreakdownView({ score, b }: { score: number; b: Breakdown }) {
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Compatibilité</span>
        <span className="font-display text-3xl">{score.toFixed(2)}<span className="text-base text-muted-foreground"> / 1.00</span></span>
      </div>
      <Meter value={b.level} label="Niveau (45 %)" />
      <Meter value={b.interest} label="Intérêts (30 %)" />
      <Meter value={b.energy} label="Énergie (25 %)" />
    </div>
  );
}

export const icebreakerText = (p: Pod) =>
  p.icebreaker ? `Au moins deux d'entre vous adorent «${INTEREST_LABEL[p.icebreaker]}» — la conversation est déjà lancée.` : "Pas encore d'intérêt commun — parfait pour découvrir quelqu'un de nouveau.";

export function MemberRow({ s, i }: { s: Student; i: number }) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <Avatar s={s} i={i} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 font-semibold">{s.name}{s.id === "me" && <span className="pill !bg-accent !text-accent-foreground !border-transparent">Toi</span>}</div>
        <div className="truncate text-xs text-muted-foreground">{LEVEL_LABEL[s.level]} · {s.neighbourhood} · {s.interests.map((x) => INTEREST_LABEL[x]).join(", ")}</div>
      </div>
    </li>
  );
}

export function PodCard({ pod }: { pod: Pod }) {
  const { state, me } = useEngine();
  const mine = state.joinedPodId === pod.id;
  const full = pod.members.length >= MAX_POD;
  const canJoin = me && me.sport === pod.sport && me.slots.includes(pod.slot);
  return (
    <article className="card-r flex flex-col p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="pill !bg-primary !text-primary-foreground !border-transparent">{SPORT_LABEL[pod.sport]}</span>
        <span className="pill">{SLOT_LABEL[pod.slot]}</span>
        {pod.spark && <span className="pill !border-accent !text-accent !bg-card">Spark dans le pod</span>}
      </div>
      <Link to="/pods/$podId" params={{ podId: pod.id }} className="mt-4 block hover:text-accent">
        <h3 className="text-2xl">{pod.field.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{pod.field.neighbourhood} · {pod.members.length}/{MAX_POD} joueurs</p>
      </Link>
      <ul className="mt-3 divide-y divide-border">{pod.members.map((m, i) => <MemberRow key={m.id} s={m} i={i} />)}</ul>
      <div className="mt-4"><Meter value={pod.score} label="Compatibilité / 1.00" /></div>
      <p className="mt-4 border-l-2 border-accent pl-3 text-sm italic">{icebreakerText(pod)}</p>
      <div className="mt-5 flex gap-2 pt-1">
        {mine ? <span className="btn btn-navy flex-1">Tu es dans ce pod</span> : (
          <button className="btn btn-accent flex-1" disabled={full || !canJoin} onClick={() => joinPod(pod.id)}
            title={!me ? "Crée ton profil d'abord" : undefined}>
            {full ? "Complet" : !me ? "Crée ton profil" : !canJoin ? "Autre sport / créneau" : "Rejoindre"}
          </button>
        )}
        <Link to="/pods/$podId" params={{ podId: pod.id }} className="btn btn-ghost">Détails</Link>
      </div>
    </article>
  );
}

export function PageHeader({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <header className="mb-8 md:mb-12">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{kicker}</p>
      <h1 className="mt-2 text-5xl md:text-7xl">{title}</h1>
      {sub && <p className="mt-4 max-w-2xl text-muted-foreground">{sub}</p>}
    </header>
  );
}
