import { NavLink } from "react-router-dom";
import { Home, Headphones, MessageCircle, Search, UserRound, BookOpen } from "lucide-react";

const navItems = [
  { to: "/", label: "Accueil", Icon: Home },
  { to: "/savoirs-africains", label: "Savoir", Icon: BookOpen },
  { to: "/community", label: "Échanges", Icon: MessageCircle },
  { to: "/audio", label: "Audio", Icon: Headphones },
  { to: "/profile", label: "Profil", Icon: UserRound },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[999]">
      <div className="mx-auto max-w-lg px-3 pb-safe-bottom pt-1">
        <div className="grid grid-cols-5 rounded-lg border border-gold/20 bg-ink/92 px-1 py-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-1 text-[11px] transition z-[1000] ${
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
      </div>
    </nav>
  );
}
