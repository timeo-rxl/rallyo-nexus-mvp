import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PodCard } from "@/components/ui-bits";
import { useEngine } from "@/lib/store";

export const Route = createFileRoute("/pods/")({
  head: () => ({ meta: [
    { title: "Pods de la semaine — Rallyo" },
    { name: "description", content: "Les pods formés cette semaine : soccer, basketball et tennis dans les parcs de Montréal." },
    { property: "og:title", content: "Pods de la semaine — Rallyo" },
    { property: "og:description", content: "Les pods sportifs formés cette semaine à Montréal." },
  ] }),
  component: Pods,
});

function Pods() {
  const { pods } = useEngine();
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader kicker="Cette semaine" title="Pods de la semaine" sub={`${pods.length} pods formés par l'algorithme à partir des disponibilités, niveaux et affinités.`} />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{pods.map((p) => <PodCard key={p.id} pod={p} />)}</div>
    </div>
  );
}
