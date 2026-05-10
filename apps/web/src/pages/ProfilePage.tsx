import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Database, FileText, Scale, ShieldCheck } from "lucide-react";
import { SEO } from "../components/SEO";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { AvatarSelector } from "../components/avatar/AvatarSelector";
import { PhotoUploader } from "../components/avatar/PhotoUploader";
import { updateAvatar } from "../services/profileService";
import { getAvatarById, type KemetAvatarType } from "@maat/shared";
import {
  KemetIcon,
  PhilosophyIcon,
  SpiritualityIcon,
  HistoryIcon,
  EducationIcon,
  DebateIcon,
  CultureIcon,
  PoliticsIcon,
  WellnessIcon,
  ScienceIcon,
  type IconComponent
} from "../components/icons/InterestIcons";

type InterestInfo = {
  label: string;
  Icon: IconComponent;
  color: string;
};

const INTEREST_DATA: Record<string, InterestInfo> = {
  kemet: { label: "Kemet", Icon: KemetIcon, color: "text-amber-400" },
  "african-philosophy": { label: "Philosophie Africaine", Icon: PhilosophyIcon, color: "text-blue-400" },
  spirituality: { label: "Spiritualité", Icon: SpiritualityIcon, color: "text-purple-400" },
  history: { label: "Histoire", Icon: HistoryIcon, color: "text-stone-400" },
  education: { label: "Éducation", Icon: EducationIcon, color: "text-emerald-400" },
  debate: { label: "Débats", Icon: DebateIcon, color: "text-orange-400" },
  culture: { label: "Culture", Icon: CultureIcon, color: "text-rose-400" },
  politics: { label: "Politique", Icon: PoliticsIcon, color: "text-indigo-400" },
  health: { label: "Bien-être", Icon: WellnessIcon, color: "text-teal-400" },
  science: { label: "Science", Icon: ScienceIcon, color: "text-cyan-400" }
};

const LEGAL_LINKS = [
  { to: "/privacy-policy", label: "Confidentialité", Icon: ShieldCheck },
  { to: "/terms-of-service", label: "CGU", Icon: FileText },
  { to: "/legal-notice", label: "Mentions légales", Icon: Scale },
  { to: "/data-management", label: "Mes données", Icon: Database },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, logoutUser, refreshProfile } = useAuth();
  const { isLoading } = useProfile();
  const [showDetails, setShowDetails] = useState(false);
  const [showLegalLinks, setShowLegalLinks] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<KemetAvatarType | null>(
    (profile?.avatar ? getAvatarById(profile.avatar)?.id : null) || null
  );
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const interests = profile?.interests ? Object.entries(profile.interests) : [];
  const hasInterests = interests.length > 0;

  useEffect(() => {
    setSelectedAvatar((profile?.avatar ? getAvatarById(profile.avatar)?.id : null) || null);
  }, [profile?.avatar]);

  const handleCompleteOnboarding = () => {
    navigate("/onboarding?reconfigure=true");
  };

  const handleAvatarUpdate = async () => {
    if (!selectedAvatar) return;
    setIsUpdatingAvatar(true);
    setUpdateError(null);
    try {
      await updateAvatar({ avatar: selectedAvatar });
      await refreshProfile();
      setShowAvatarModal(false);
    } catch (error) {
      console.error("Failed to update avatar:", error);
      setUpdateError(error instanceof Error ? error.message : "Erreur lors de la mise à jour");
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  // Validate image size before upload (base64 is ~33% larger than binary)
  const validatePhotoSize = (base64Url: string): { valid: boolean; sizeMB: number; error?: string } => {
    // Base64 size calculation: (length * 3/4) gives approximate binary size
    const base64Length = base64Url.length;
    const sizeBytes = (base64Length * 3) / 4;
    const sizeMB = sizeBytes / (1024 * 1024);
    
    // 10MB server limit, but base64 encoding adds overhead
    // Be conservative: 8MB max for base64
    const MAX_SIZE_MB = 8;
    
    if (sizeMB > MAX_SIZE_MB) {
      return {
        valid: false,
        sizeMB,
        error: `Photo trop volumineuse (${sizeMB.toFixed(1)} MB). Maximum: ${MAX_SIZE_MB} MB. Veuillez choisir une photo plus légère.`
      };
    }
    
    return { valid: true, sizeMB };
  };

  const handlePhotoUpdate = async () => {
    if (!selectedPhoto) return;
    
    // Validate size before sending
    const validation = validatePhotoSize(selectedPhoto);
    if (!validation.valid) {
      setUpdateError(validation.error || "Photo trop volumineuse");
      return;
    }
    
    setIsUpdatingPhoto(true);
    setUpdateError(null);
    try {
      // For now, store the base64 data URL as the profile image
      // In production, this should upload to a CDN first
      await updateAvatar({ profileImageUrl: selectedPhoto });
      await refreshProfile();
      setShowPhotoModal(false);
      setSelectedPhoto(null);
      setSelectedPhotoFile(null);
    } catch (error) {
      console.error("Failed to update photo:", error);
      if (error instanceof Error) {
        // Detect 413 Payload Too Large
        if (error.message.includes("413") || error.message.includes("Payload Too Large") || error.message.includes("request entity too large")) {
          setUpdateError("Photo trop volumineuse. Veuillez choisir une image de moins de 8 MB.");
        } else {
          setUpdateError(error.message || "Erreur lors de la mise à jour");
        }
      } else {
        setUpdateError("Erreur lors de la mise à jour");
      }
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  // Get current avatar data
  const currentAvatar = profile?.avatar
    ? getAvatarById(profile.avatar)
    : null;

  // Determine display image priority: profileImageUrl > avatar > default
  const displayImage = profile?.profileImageUrl || currentAvatar?.imageUrl64 || null;

  return (
    <>
      <SEO pageKey="profile" />
      <section className="px-4 py-6 pb-24">
      <h1 className="font-display text-3xl text-gold">Profil</h1>

      {/* Identity Card with Avatar */}
      <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
        <div className="flex items-center gap-4">
          {/* Avatar/Photo */}
          <button
            onClick={() => {
              if (profile?.profileImageUrl) {
                setShowPhotoModal(true);
              } else {
                setShowAvatarModal(true);
              }
            }}
            className="relative group shrink-0"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gold/30 group-hover:border-gold transition-colors">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center text-3xl">
                  {profile?.displayName?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </div>
            {/* Edit overlay */}
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-white">Modifier</span>
            </div>
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] text-gold">Identité</p>
            <h2 className="mt-1 font-display text-2xl truncate">{profile?.displayName}</h2>
            {currentAvatar && (
              <p className="text-sm text-sand/70 flex items-center gap-1">
                <span>{currentAvatar.emoji}</span>
                <span>{currentAvatar.name}</span>
              </p>
            )}
          </div>
        </div>

        <p className="mt-3 text-sm text-sand/60">{profile?.email}</p>
      </div>

      {/* Onboarding Status Card */}
      <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">Intégration</p>
            <p className="mt-2 text-sm text-sand/70">
              {profile?.onboardingCompleted 
                ? "✅ Profil configuré et prêt"
                : "⏳ Configuration du profil en attente"}
            </p>
          </div>
          {!profile?.onboardingCompleted && (
            <Button onClick={handleCompleteOnboarding}>
              Compléter
            </Button>
          )}
        </div>
      </div>

      {/* Interests Card */}
      <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Centres d'intérêt</p>
          <span className="text-sm text-sand/50">
            {hasInterests ? `${interests.length} sujet(s)` : "Aucun"}
          </span>
        </div>

        {hasInterests ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {interests.map(([id, score]) => {
              const info = INTEREST_DATA[id];
              if (!info) return null;
              const Icon = info.Icon;
              return (
                <span 
                  key={id} 
                  className={`inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1.5 text-sm ${info.color}`}
                  title={`Score: ${score}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{info.label}</span>
                </span>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 text-sm text-sand/50">
            Aucun centre d'intérêt sélectionné.
          </p>
        )}
      </div>

      {/* Saved Content Card */}
      <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Favoris</p>
        <p className="mt-2 text-sm text-sand/70">
          {profile?.savedContentIds.length ?? 0} élément(s)
        </p>
      </div>

      {/* Advanced Details Toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="mt-4 flex w-full items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-left transition hover:bg-white/10"
      >
        <span className="text-xs uppercase tracking-[0.2em] text-gold">Détails avancés</span>
        <span className="text-sand/50">
          {showDetails ? "▼" : "▶"}
        </span>
      </button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gold">Informations techniques</p>
              <div className="mt-3 space-y-2 text-sm text-sand/60">
                <p>ID Utilisateur: <span className="font-mono text-sand/40">{profile?.id}</span></p>
                <p>Email: <span className="text-sand">{profile?.email}</span></p>
                <p>Onboarding: <span className={profile?.onboardingCompleted ? "text-green-400" : "text-amber-400"}>
                  {profile?.onboardingCompleted ? "Complété" : "En attente"}
                </span></p>
                <p>État du chargement: <span className={isLoading ? "text-amber-400" : "text-green-400"}>
                  {isLoading ? "Chargement..." : "Prêt"}
                </span></p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legal and Data Links */}
      <button
        onClick={() => setShowLegalLinks(!showLegalLinks)}
        className="mt-4 flex w-full items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-left transition hover:bg-white/10"
      >
        <span className="text-xs uppercase tracking-[0.2em] text-gold">Légal et données</span>
        <span className="text-sand/50">
          {showLegalLinks ? "▼" : "▶"}
        </span>
      </button>

      <AnimatePresence>
        {showLegalLinks && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 grid gap-2 rounded-[1.5rem] border border-white/10 bg-white/5 p-3 sm:grid-cols-2">
              {LEGAL_LINKS.map(({ to, label, Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm text-sand/72 transition hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-4 w-4 text-gold/80" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3">
        <Button
          variant="secondary"
          onClick={() => navigate("/onboarding?reconfigure=true")}
        >
          🔄 Reconfigurer mes préférences
        </Button>
        <Button onClick={() => void logoutUser()}>
          Déconnexion
        </Button>
      </div>

      {/* Avatar Selection Modal */}
      <AnimatePresence>
        {showAvatarModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowAvatarModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-ink rounded-2xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/10">
                <h2 className="font-display text-2xl text-gold">Modifier votre avatar</h2>
                <p className="text-sm text-sand/70 mt-1">
                  Choisissez un avatar Kemet qui vous représente
                </p>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <AvatarSelector
                  selectedAvatar={selectedAvatar}
                  onSelect={setSelectedAvatar}
                />
              </div>

              <div className="p-6 border-t border-white/10 flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowAvatarModal(false)}
                  disabled={isUpdatingAvatar}
                >
                  Annuler
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowAvatarModal(false);
                    setShowPhotoModal(true);
                  }}
                  className="inline-flex items-center gap-1.5"
                >
                  <span>📸</span>
                  <span>Photo</span>
                </Button>
                <Button
                  onClick={handleAvatarUpdate}
                  disabled={!selectedAvatar || isUpdatingAvatar}
                  className="inline-flex items-center whitespace-nowrap"
                >
                  {isUpdatingAvatar ? "En cours..." : "Confirmer"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Upload Modal */}
      <AnimatePresence>
        {showPhotoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowPhotoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-ink rounded-2xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/10">
                <h2 className="font-display text-2xl text-gold">Photo de profil</h2>
                <p className="text-sm text-sand/70 mt-1">
                  {profile?.profileImageUrl ? "Modifier votre photo" : "Ajoutez votre photo pour plus de crédibilité"}
                </p>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {updateError && (
                  <div className="mb-4 p-3 bg-red-500/20 text-red-200 rounded-xl text-sm flex items-start gap-2">
                    <span>⚠️</span>
                    <span>{updateError}</span>
                  </div>
                )}
                <PhotoUploader
                  selectedPhoto={selectedPhoto}
                  onPhotoSelect={(url: string, _file: File) => {
                    setSelectedPhoto(url);
                    setSelectedPhotoFile(_file);
                    setUpdateError(null); // Clear error on new selection
                  }}
                />
                <p className="mt-4 text-xs text-sand/50 text-center">
                  Taille maximum: 8 MB. Les formats acceptés: JPG, PNG, WebP.
                </p>
              </div>

              <div className="p-6 border-t border-white/10 flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowPhotoModal(false)}
                  disabled={isUpdatingPhoto}
                >
                  Annuler
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowPhotoModal(false);
                    setShowAvatarModal(true);
                  }}
                  className="inline-flex items-center gap-1.5"
                >
                  <span>🎭</span>
                  <span>Avatar</span>
                </Button>
                <Button
                  onClick={handlePhotoUpdate}
                  disabled={!selectedPhoto || isUpdatingPhoto}
                  className="inline-flex items-center whitespace-nowrap"
                >
                  {isUpdatingPhoto ? "En cours..." : "Confirmer"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
    </>
  );
}

