import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ProfileForm, EMPTY_PROFILE } from "@/components/profile-form";
import { BreakdownView, MemberRow, PageHeader, icebreakerText } from "@/components/ui-bits";
import { joinPod, joinWaitlist, profileToStudent, saveProfile, useEngine, type Profile } from "@/lib/store";
import { buildPod, instantMatch } from "@/lib/matching";
import { SLOT_LABEL, SPORT_LABEL } from "@/lib/data";

export const Route = createFileRoute("/trouve")({
  head: () => ({ meta: [
    { title: "Trouve ton pod — Rallyo" },
    { name: "description", content: "Dis ton sport, ton niveau et ton créneau : Rallyo te trouve un pod compatible." },
    { property: "og:title", content: "Trouve ton pod — Rallyo" },
    { property: "og:description", content: "Match instantané avec un pod sportif étudiant à Montréal." },
  ] }),
  component: Trouve,
});

function Trouve() {
  const { state, rawPods } = useEngine();
  const [result, setResult] = useState<{ podId: string | null; profile: Profile } | null>(null);

  const submit = (p: Profile) => {
    saveProfile(p);
    const me = profileToStudent(p);
    const pod = instantMatch(me, rawPods, state.affinity);
    setResult({ podId: pod?.id ?? null, profile: p });
    if (!pod) joinWaitlist();
    setTimeout(() => document.getElementById("resultat")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const base = result?.podId ? rawPods.find((p) => p.id === result.podId) : null;
  const preview = base && result ? buildPod(base.id, base.sport, base.slot, [...base.members, profileToStudent(result.profile)], state.affinity) : null;
  const joined = preview && state.joinedPodId === preview.id;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <PageHeader kicker="Match instantané" title="Trouve ton pod" sub="Six questions. On regarde les pods qui ont encore une place pour ton sport et ton créneau, et on te propose le plus compatible." />
      <ProfileForm initial={state.profile ?? EMPTY_PROFILE} onSubmit={submit} cta="Trouve mon pod" />
      <div id="resultat" className="scroll-mt-24 pt-10">
        {result && preview && (
          <article className="card-r overflow-hidden">
            <div className="bg-primary p-6 text-primary-foreground">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">C'est un match</p>
              <h2 className="mt-2 text-4xl">{SPORT_LABEL[preview.sport]} · {SLOT_LABEL[preview.slot]}</h2>
              <p className="mt-1 opacity-80">{preview.field.name}, {preview.field.neighbourhood}</p>
            </div>
            <div className="grid gap-8 p-6 md:grid-cols-2">
              <ul className="divide-y divide-border">{preview.members.map((m, i) => <MemberRow key={m.id} s={m} i={i} />)}</ul>
              <div className="space-y-5">
                <BreakdownView score={preview.score} b={preview.breakdown} />
                <p className="border-l-2 border-accent pl-3 text-sm italic">{icebreakerText(preview)}</p>
                {joined ? (
                  <Link to="/pods/$podId" params={{ podId: preview.id }} className="btn btn-navy w-full">Tu es dans le pod — voir le détail</Link>
                ) : (
                  <button className="btn btn-accent w-full" onClick={() => joinPod(preview.id)}>Rejoindre le pod</button>
                )}
              </div>
            </div>
          </article>
        )}
        {result && !preview && (
          <article className="card-r p-8 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Liste d'attente</p>
            <h2 className="mt-3 text-3xl md:text-4xl">Pas encore de pod pour toi cette semaine</h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">On te prévient dès que 3 autres joueurs se joignent.</p>
            <Link to="/attente" className="btn btn-ghost mt-6">Voir la liste d'attente</Link>
          </article>
        )}
      </div>
    </div>
  );
}
