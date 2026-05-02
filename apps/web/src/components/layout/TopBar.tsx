import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getAvatarById } from "@maat/shared";
import { NotificationsBell } from "../notifications/NotificationsBell";

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
    <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-4 backdrop-blur">
      <Link to="/" className="flex items-center">
        <img
          src="/favicon_io/maafeed-home.png"
          alt="Maat Feed"
          className="h-10 w-auto object-contain"
        />
      </Link>
      <div className="flex items-center gap-3 text-sm uppercase tracking-[0.18em]">
        <Link to="/explore" className="rounded-full border border-white/10 px-3 py-2">
          Rechercher
        </Link>
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
          <Link to="/auth" className="rounded-full border border-white/10 px-3 py-2">
            Accès
          </Link>
        )}
      </div>
    </header>
  );
}
