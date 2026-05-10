import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getAvatarById } from "@maat/shared";
import { NotificationsBell } from "../notifications/NotificationsBell";
import { BookOpen, Home, Headphones, MessageCircle, Search } from "lucide-react";

const desktopNavItems = [
  { to: "/", label: "Accueil", Icon: Home },
  { to: "/explore", label: "Découvrir", Icon: Search },
  { to: "/savoirs-africains", label: "Savoirs", Icon: BookOpen },
  { to: "/community", label: "Échanges", Icon: MessageCircle },
  { to: "/audio", label: "Audio", Icon: Headphones },
];

export function TopBar() {
  const { profile, isAuthenticated } = useAuth();

  const getAvatarSrc = () => {
    if (!isAuthenticated || !profile) return null;
    
    // Utiliser la photo personnalisée si elle existe (priorité absolue)
    if (profile.profileImageUrl) {
      return profile.profileImageUrl.startsWith('http') ? profile.profileImageUrl : profile.profileImageUrl;
    }
    
    // Utiliser l'avatar Kemet choisi par l'utilisateur
    if (profile.avatar) {
      const avatar = getAvatarById(profile.avatar);
      if (avatar) {
        return avatar.imageUrl64;
      }
    }
    
    // Avatar par défaut si aucun avatar Kemet n'est trouvé
    return "/avatars/users/maat-avatar-homme-64.png";
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 px-4 pb-4 pt-safe-top backdrop-blur">
      <Link to="/" className="flex shrink-0 items-center">
        <img
          src="/favicon_io/maafeed-home.png"
          alt="Maat Feed"
          className="h-10 w-auto object-contain"
        />
      </Link>

      <nav className="hidden items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] p-1 lg:flex">
        {desktopNavItems.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-sand/72 transition hover:bg-white/10 hover:text-white"
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-3 text-sm">
        <NotificationsBell />
        {isAuthenticated && profile ? (
          <Link 
            to="/profile" 
            className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white/20 transition-all hover:border-white/40"
            title={`Profil de ${profile.displayName}`}
          >
            <img
              src={getAvatarSrc() || "/avatars/users/maat-avatar-homme-64.png"}
              alt={`Avatar de ${profile.displayName}`}
              className="h-full w-full object-cover"
              onError={(e) => {
                // Fallback si l'image ne charge pas
                e.currentTarget.src = "/avatars/users/maat-avatar-homme-64.png";
              }}
            />
          </Link>
        ) : (
          <Link to="/auth" className="rounded-md border border-white/10 px-3 py-2 text-sand/80 transition hover:bg-white/10 hover:text-white">
            Accès
          </Link>
        )}
      </div>
    </header>
  );
}
