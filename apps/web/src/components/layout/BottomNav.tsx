import { NavLink } from "react-router-dom";
import { Home, Headphones, MessageCircle, Search, UserRound } from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/", label: "Accueil", Icon: Home },
  { to: "/explore", label: "Découvrir", Icon: Search },
  { to: "/community", label: "Échanges", Icon: MessageCircle },
  { to: "/audio", label: "Audio", Icon: Headphones },
  { to: "/profile", label: "Profil", Icon: UserRound },
];

export function BottomNav() {
  const [showLegalMenu, setShowLegalMenu] = useState(false);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[200]">
      <div className="mx-auto max-w-lg px-3 pb-safe-bottom pt-1">
        <div className="grid grid-cols-5 rounded-lg border border-gold/20 bg-ink/92 px-1 py-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-1 text-[11px] transition ${
                  isActive ? "bg-gold/[0.18] text-gold" : "text-sand/[0.58] hover:bg-white/[0.08] hover:text-sand"
                }`
              }
              end={to === "/"}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="max-w-full truncate">{label}</span>
            </NavLink>
          ))}
        </div>

        <div className="mt-2 flex justify-center text-xs text-sand/50">
          <button
            type="button"
            onClick={() => setShowLegalMenu(!showLegalMenu)}
            className="rounded-md px-2 py-1 transition-colors hover:text-sand/75"
          >
            Légal
          </button>
          {showLegalMenu && (
            <div className="legal-menu absolute left-1/2 w-44 -translate-x-1/2 rounded-lg border border-gold/20 bg-ink/95 p-2 shadow-xl backdrop-blur-xl">
              <div className="grid gap-1">
                <a href="/privacy-policy" className="rounded-md px-2 py-1 text-xs text-sand/70 transition hover:bg-white/10 hover:text-sand">Confidentialité</a>
                <a href="/terms-of-service" className="rounded-md px-2 py-1 text-xs text-sand/70 transition hover:bg-white/10 hover:text-sand">CGU</a>
                <a href="/legal-notice" className="rounded-md px-2 py-1 text-xs text-sand/70 transition hover:bg-white/10 hover:text-sand">Mentions</a>
                <a href="/data-management" className="rounded-md px-2 py-1 text-xs text-sand/70 transition hover:bg-white/10 hover:text-sand">Données</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
