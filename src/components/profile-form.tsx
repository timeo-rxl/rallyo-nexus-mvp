import { useEffect, useState, type ReactNode } from "react";
import { INTERESTS, INTEREST_LABEL, LEVEL_LABEL, NEIGHBOURHOODS, SLOT_LABEL, SPORT_LABEL, type Slot, type Sport } from "@/lib/data";
import type { Profile } from "@/lib/store";

export const EMPTY_PROFILE: Profile = { name: "", sport: "soccer", level: 2, slot: "jeu-18", neighbourhood: "Plateau-Mont-Royal", extraversion: 5, energy: 5, interests: [] };

function Choice<T extends string | number>({ options, value, onChange, label }: { options: [T, string][]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(([v, l]) => (
          <button type="button" key={String(v)} onClick={() => onChange(v)} aria-pressed={value === v}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${value === v ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card hover:bg-secondary"}`}>{l}</button>
        ))}
      </div>
    </fieldset>
  );
}

export function ProfileForm({ initial, onSubmit, cta, extra }: { initial: Profile; onSubmit: (p: Profile) => void; cta: string; extra?: ReactNode }) {
  const [p, setP] = useState<Profile>(initial);
  useEffect(() => setP(initial), [initial]);
  const up = <K extends keyof Profile>(k: K, v: Profile[K]) => setP((x) => ({ ...x, [k]: v }));
  return (
    <form className="card-r space-y-6 p-5 md:p-8" onSubmit={(e) => { e.preventDefault(); onSubmit(p); }}>
      <label className="block">
        <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">Prénom</span>
        <input value={p.name} onChange={(e) => up("name", e.target.value)} placeholder="Ton prénom" maxLength={40}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-accent" />
      </label>
      <Choice label="Sport" value={p.sport} onChange={(v) => up("sport", v)} options={(Object.keys(SPORT_LABEL) as Sport[]).map((s) => [s, SPORT_LABEL[s]])} />
      <Choice label="Niveau" value={p.level} onChange={(v) => up("level", v)} options={([1, 2, 3] as const).map((l) => [l, LEVEL_LABEL[l]])} />
      <Choice label="Créneau" value={p.slot} onChange={(v) => up("slot", v)} options={(Object.keys(SLOT_LABEL) as Slot[]).map((s) => [s, SLOT_LABEL[s]])} />
      <Choice label="Quartier" value={p.neighbourhood} onChange={(v) => up("neighbourhood", v)} options={NEIGHBOURHOODS.map((n) => [n, n])} />
      <div className="grid gap-6 md:grid-cols-2">
        {(["extraversion", "energy"] as const).map((k) => (
          <label key={k} className="block">
            <span className="mb-2 flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <span>{k === "energy" ? "Énergie" : "Extraversion"}</span><span className="font-display text-lg text-foreground">{p[k]}</span>
            </span>
            <input type="range" min={1} max={10} value={p[k]} onChange={(e) => up(k, Number(e.target.value))} className="w-full" />
            <span className="flex justify-between text-xs text-muted-foreground"><span>{k === "energy" ? "Tranquille" : "Réservé·e"}</span><span>{k === "energy" ? "À fond" : "Moteur du groupe"}</span></span>
          </label>
        ))}
      </div>
      <fieldset>
        <legend className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Centres d'intérêt</legend>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((i) => {
            const on = p.interests.includes(i);
            return <button type="button" key={i} aria-pressed={on} onClick={() => up("interests", on ? p.interests.filter((x) => x !== i) : [...p.interests, i])}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${on ? "border-accent bg-accent text-accent-foreground" : "border-input bg-card hover:bg-secondary"}`}>{INTEREST_LABEL[i]}</button>;
          })}
        </div>
      </fieldset>
      {extra}
      <button type="submit" className="btn btn-accent w-full py-4 text-base">{cta}</button>
    </form>
  );
}
