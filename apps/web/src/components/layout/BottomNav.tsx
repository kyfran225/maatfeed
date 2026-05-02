import { NavLink } from "react-router-dom";
import {
  EyeHorusIcon,
  CompassKemetIcon,
  CommunityTribeIcon,
  AnkhAudioIcon,
  MaskProfileIcon,
} from "../icons/KemetIcons";

const navItems = [
  { to: "/", label: "Fil", Icon: EyeHorusIcon },
  { to: "/explore", label: "Explorer", Icon: CompassKemetIcon },
  { to: "/community", label: "Communauté", Icon: CommunityTribeIcon },
  { to: "/audio", label: "Audio", Icon: AnkhAudioIcon },
  { to: "/profile", label: "Profil", Icon: MaskProfileIcon },
];

export function BottomNav() {
  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-[200]">
      <div className="mx-auto max-w-lg px-3 pb-3 pt-1">
        <div className="flex items-center justify-around rounded-2xl border border-gold/20 bg-ink/80 backdrop-blur-xl px-1 py-2 shadow-2xl shadow-black/50">
          {navItems.map(({ to, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group flex items-center justify-center p-0.5 transition-all duration-300 ${
                  isActive ? "scale-110" : "hover:scale-105"
                }`
              }
            >
              {({ isActive }) => (
                <div
                  className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-br from-gold/30 to-gold/10 shadow-lg shadow-gold/20"
                      : "bg-white/5 group-hover:bg-white/10"
                  }`}
                >
                  <Icon
                    className={`h-8 w-8 transition-all duration-300 ${
                      isActive
                        ? "text-gold drop-shadow-[0_0_10px_rgba(212,175,55,0.6)]"
                        : "text-sand/60 group-hover:text-sand/80"
                    }`}
                  />
                  {isActive && (
                    <span className="absolute inset-0 rounded-xl bg-gold/10 blur-md" />
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
    </>
  );
}
