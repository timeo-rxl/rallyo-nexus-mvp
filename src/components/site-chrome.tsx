import { Link } from "@tanstack/react-router";

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/trouve", label: "Trouve ton pod" },
  { to: "/pods", label: "Pods de la semaine" },
  { to: "/attente", label: "Liste d'attente" },
  { to: "/profil", label: "Profil" },
] as const;

export function SiteNav() {
  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <Link to="/" className="font-display text-2xl uppercase tracking-tight">Rally<span className="text-accent">o</span></Link>
        <div className="-mx-2 flex flex-1 gap-1 overflow-x-auto px-2 md:justify-end">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
              activeProps={{ className: "!bg-primary !text-primary-foreground" }}>{n.label}</Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-2">
        <div>
          <div className="font-display text-3xl uppercase">Rally<span className="text-accent">o</span></div>
          <p className="mt-2 text-sm opacity-70">Nexus · 3e place, 54H Start-Up, HEC Montréal.</p>
        </div>
        <p className="text-sm opacity-70 md:text-right">Données de démonstration : étudiants fictifs, vrais noms de parcs montréalais, disponibilités illustratives. Pas une source de réservation en direct.</p>
      </div>
    </footer>
  );
}
