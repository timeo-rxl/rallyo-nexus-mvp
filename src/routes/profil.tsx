import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ProfileForm, EMPTY_PROFILE } from "@/components/profile-form";
import { PageHeader } from "@/components/ui-bits";
import { saveProfile, useEngine } from "@/lib/store";

export const Route = createFileRoute("/profil")({
  head: () => ({ meta: [
    { title: "Profil — Rallyo" },
    { name: "description", content: "Ton profil Rallyo : sport, niveau, quartier et centres d'intérêt." },
    { property: "og:title", content: "Profil — Rallyo" },
    { property: "og:description", content: "Gère ton profil sportif Rallyo." },
  ] }),
  component: Profil,
});

function Profil() {
  const { state } = useEngine();
  const [saved, setSaved] = useState(false);
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <PageHeader kicker="Toi" title={state.profile?.name ? `Salut ${state.profile.name}` : "Ton profil"} sub="Enregistré sur cet appareil seulement." />
      <ProfileForm initial={state.profile ?? EMPTY_PROFILE} cta="Enregistrer"
        onSubmit={(p) => { saveProfile(p); setSaved(true); setTimeout(() => setSaved(false), 2500); }}
        extra={saved ? <p role="status" className="text-sm font-semibold text-accent">Profil enregistré.</p> : null} />
    </div>
  );
}
