import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SEO } from "../components/SEO";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { updatePreferences, completeOnboarding, updateAvatar } from "../services/profileService";
import { AvatarSelector } from "../components/avatar/AvatarSelector";
import { PhotoUploader } from "../components/avatar/PhotoUploader";
import type { KemetAvatarType } from "@maat/shared";
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
import { getAvatarById } from "@maat/shared";

type InterestTopic = {
  id: string;
  label: string;
  description: string;
  Icon: IconComponent;
  defaultColor: string;
  selectedColor: string;
};

const INTEREST_TOPICS: InterestTopic[] = [
  { id: "kemet", label: "Kemet", description: "Civilisation et spiritualité égyptienne antique", Icon: KemetIcon, defaultColor: "text-sand/50", selectedColor: "text-amber-400" },
  { id: "african-philosophy", label: "Philosophie Africaine", description: "Pensées et sagesses africaines", Icon: PhilosophyIcon, defaultColor: "text-sand/50", selectedColor: "text-blue-400" },
  { id: "spirituality", label: "Spiritualité", description: "Développement spirituel et ésotérisme", Icon: SpiritualityIcon, defaultColor: "text-sand/50", selectedColor: "text-purple-400" },
  { id: "history", label: "Histoire", description: "Histoire africaine et diaspora", Icon: HistoryIcon, defaultColor: "text-sand/50", selectedColor: "text-stone-400" },
  { id: "education", label: "Éducation", description: "Savoirs et apprentissages", Icon: EducationIcon, defaultColor: "text-sand/50", selectedColor: "text-emerald-400" },
  { id: "debate", label: "Débats", description: "Discussions et analyses critiques", Icon: DebateIcon, defaultColor: "text-sand/50", selectedColor: "text-orange-400" },
  { id: "culture", label: "Culture", description: "Arts, musique et traditions", Icon: CultureIcon, defaultColor: "text-sand/50", selectedColor: "text-rose-400" },
  { id: "politics", label: "Politique", description: "Analyses politiques et sociales", Icon: PoliticsIcon, defaultColor: "text-sand/50", selectedColor: "text-indigo-400" },
  { id: "health", label: "Bien-être", description: "Santé et développement personnel", Icon: WellnessIcon, defaultColor: "text-sand/50", selectedColor: "text-teal-400" },
  { id: "science", label: "Science", description: "Sciences et découvertes africaines", Icon: ScienceIcon, defaultColor: "text-sand/50", selectedColor: "text-cyan-400" }
];

const CONTENT_MIX_OPTIONS = [
  { value: "balanced", label: "Équilibré", description: "40% éducatif / 30% viral / 30% deep" },
  { value: "educational", label: "Éducatif", description: "60% éducatif / 20% viral / 20% deep" },
  { value: "viral", label: "Tendance", description: "60% viral / 20% éducatif / 20% deep" },
  { value: "deep", label: "Profond", description: "60% deep / 20% éducatif / 20% viral" }
] as const;

type Step = "welcome" | "identity" | "photo" | "avatar" | "interests" | "content-mix" | "finish";

type IdentityChoice = "photo" | "avatar" | null;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile, refreshProfile } = useAuth();
  const isReconfigureMode = searchParams.get("reconfigure") === "true";
  const [step, setStep] = useState<Step>("welcome");
  const [identityChoice, setIdentityChoice] = useState<IdentityChoice>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<KemetAvatarType | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [contentMix, setContentMix] = useState<string>("balanced");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already onboarded (but allow reconfiguration mode)
  useEffect(() => {
    if (profile?.onboardingCompleted && !isReconfigureMode) {
      navigate("/", { replace: true });
    }
  }, [profile?.onboardingCompleted, isReconfigureMode, navigate]);

  // Pre-fill existing preferences when in reconfigure mode
  useEffect(() => {
    if (isReconfigureMode && profile) {
      // Pre-fill interests
      if (profile.interests && Object.keys(profile.interests).length > 0) {
        setSelectedInterests(Object.keys(profile.interests));
      }

      // Pre-fill content mix from preferences
      if (profile.preferences?.contentMix) {
        const mix = profile.preferences.contentMix;
        // Compare with tolerance for floating point values
        const isBalanced = mix.educational >= 0.35 && mix.educational <= 0.45 && mix.viral >= 0.25 && mix.viral <= 0.35;
        const isEducational = mix.educational >= 0.55 && mix.educational <= 0.65;
        const isViral = mix.viral >= 0.55 && mix.viral <= 0.65;
        const isDeep = mix.deep >= 0.55 && mix.deep <= 0.65;

        if (isEducational) {
          setContentMix("educational");
        } else if (isViral) {
          setContentMix("viral");
        } else if (isDeep) {
          setContentMix("deep");
        } else if (isBalanced) {
          setContentMix("balanced");
        }
      }
    }
  }, [isReconfigureMode, profile]);

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleNext = () => {
    if (step === "welcome") setStep("identity");
    else if (step === "identity") {
      if (identityChoice === "avatar") setStep("avatar");
      else if (identityChoice === "photo") setStep("photo");
    }
    else if (step === "photo") setStep("interests");
    else if (step === "avatar") setStep("interests");
    else if (step === "interests") setStep("content-mix");
    else if (step === "content-mix") setStep("finish");
  };

  const handleBack = () => {
    if (step === "identity") setStep("welcome");
    else if (step === "photo") setStep("identity");
    else if (step === "avatar") setStep("identity");
    else if (step === "interests") {
      if (identityChoice === "avatar") setStep("avatar");
      else if (identityChoice === "photo") setStep("photo");
      else setStep("identity");
    }
    else if (step === "content-mix") setStep("interests");
    else if (step === "finish") setStep("content-mix");
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Update avatar if selected
      if (selectedAvatar) {
        await updateAvatar({ avatar: selectedAvatar });
      }

      // Update photo if selected (base64 data URL)
      if (selectedPhoto) {
        await updateAvatar({ profileImageUrl: selectedPhoto });
      }

      // Build interests object with scores
      const interests: Record<string, number> = {};
      selectedInterests.forEach(id => {
        interests[id] = 1.0; // Base score for selected topics
      });

      // Map content mix to preferences
      const mixConfig: Record<string, { viral: number; educational: number; deep: number }> = {
        balanced: { viral: 0.3, educational: 0.4, deep: 0.3 },
        educational: { viral: 0.2, educational: 0.6, deep: 0.2 },
        viral: { viral: 0.6, educational: 0.2, deep: 0.2 },
        deep: { viral: 0.2, educational: 0.2, deep: 0.6 }
      };

      // Update preferences
      await updatePreferences({
        interests,
        preferences: {
          contentMix: mixConfig[contentMix]
        }
      });

      // Complete onboarding
      await completeOnboarding();

      // Refresh profile
      await refreshProfile();

      // Navigate to feed
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setIsLoading(false);
    }
  };

  const canProceed = {
    welcome: true,
    identity: identityChoice !== null,
    photo: selectedPhoto !== null || selectedPhotoFile !== null,
    avatar: selectedAvatar !== null,
    interests: selectedInterests.length >= 2,
    "content-mix": true,
    finish: true
  };

  return (
    <>
      <SEO pageKey="onboarding" />
      <div className="min-h-screen bg-ink text-sand">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/10">
        <motion.div
          className="h-full bg-gold"
          initial={{ width: "0%" }}
          animate={{
            width: step === "welcome" ? "14%" :
                   step === "identity" ? "28%" :
                   step === "photo" ? "42%" :
                   step === "avatar" ? "42%" :
                   step === "interests" ? "56%" :
                   step === "content-mix" ? "70%" :
                   step === "finish" ? "100%" : "0%"
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="mx-auto max-w-md px-6 py-12 pb-24">
        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="mb-8 text-6xl">👋</div>
              <h1 className="font-display text-4xl text-gold">
                Bienvenue, {profile?.displayName}!
              </h1>
              <p className="mt-4 text-lg text-sand/70">
                Personnalisons votre expérience MAAT FEED pour vous offrir le contenu qui vous correspond le mieux.
              </p>
              <p className="mt-6 text-sm text-sand/50">
                Quelques questions rapides pour commencer...
              </p>
            </motion.div>
          )}

          {step === "identity" && (
            <motion.div
              key="identity"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <h2 className="font-display text-3xl text-gold">
                Choisissez votre identité
              </h2>
              <p className="mt-2 text-sand/70">
                Comment souhaitez-vous apparaître dans la communauté ?
              </p>

              <div className="mt-8 grid gap-4">
                {/* Photo option */}
                <button
                  onClick={() => setIdentityChoice("photo")}
                  className={`relative rounded-2xl border-2 p-6 text-left transition-all ${
                    identityChoice === "photo"
                      ? "border-gold bg-gold/10"
                      : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sand/20 to-sand/5 flex items-center justify-center text-3xl">
                      📸
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-sand">Utiliser ma photo</h3>
                      <p className="text-sm text-sand/60 mt-1">
                        Confiance, crédibilité, connexion authentique
                      </p>
                    </div>
                    {identityChoice === "photo" && (
                      <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                        <svg className="w-4 h-4 text-ink" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>

                {/* Avatar option */}
                <button
                  onClick={() => setIdentityChoice("avatar")}
                  className={`relative rounded-2xl border-2 p-6 text-left transition-all ${
                    identityChoice === "avatar"
                      ? "border-gold bg-gold/10"
                      : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/30 to-yellow-600/30 flex items-center justify-center overflow-hidden">
                      <img
                        src="/avatars/users/leadership-64.png"
                        alt="Avatar Kemet"
                        className="w-14 h-14 object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-sand">Choisir un avatar Kemet</h3>
                      <p className="text-sm text-sand/60 mt-1">
                        Identité forte, immersion culturelle, différenciation unique
                      </p>
                    </div>
                    {identityChoice === "avatar" && (
                      <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                        <svg className="w-4 h-4 text-ink" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              </div>

              <p className="mt-6 text-sm text-sand/50">
                Vous pourrez toujours modifier ce choix plus tard dans vos paramètres
              </p>
            </motion.div>
          )}

          {step === "photo" && (
            <motion.div
              key="photo"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-display text-3xl text-gold text-center">
                Ajoutez votre photo
              </h2>
              <p className="mt-2 text-center text-sand/70">
                Votre photo de profil renforce la confiance et la crédibilité
              </p>

              <div className="mt-8">
                <PhotoUploader
                  selectedPhoto={selectedPhoto}
                  onPhotoSelect={(url, file) => {
                    setSelectedPhoto(url);
                    setSelectedPhotoFile(file);
                  }}
                />
              </div>
            </motion.div>
          )}

          {step === "avatar" && (
            <motion.div
              key="avatar"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-display text-3xl text-gold text-center">
                Quel avatar vous représente ?
              </h2>
              <p className="mt-2 text-center text-sand/70">
                Chaque avatar débloque une expérience personnalisée unique
              </p>

              <div className="mt-6">
                <AvatarSelector
                  selectedAvatar={selectedAvatar}
                  onSelect={setSelectedAvatar}
                />
              </div>
            </motion.div>
          )}

          {step === "interests" && (
            <motion.div
              key="interests"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-display text-3xl text-gold text-center">
                Quels sujets vous passionnent?
              </h2>
              <p className="mt-2 text-center text-sand/70">
                Sélectionnez au moins 2 sujets d'intérêt
              </p>
              <p className="mt-1 text-center text-sm text-sand/50">
                {selectedInterests.length} sélectionné(s)
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                {INTEREST_TOPICS.map((topic) => {
                  const isSelected = selectedInterests.includes(topic.id);
                  return (
                    <button
                      key={topic.id}
                      onClick={() => toggleInterest(topic.id)}
                      className={`group relative rounded-2xl border p-4 text-left transition-all duration-200 ${
                        isSelected
                          ? "border-gold bg-gold/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <topic.Icon
                        className={`w-8 h-8 transition-all duration-200 group-hover:scale-110 ${
                          isSelected ? topic.selectedColor : `${topic.defaultColor} group-hover:${topic.selectedColor}`
                        }`}
                      />
                      <h3 className="mt-2 font-medium text-sand">{topic.label}</h3>
                      <p className="mt-1 text-xs text-sand/60">{topic.description}</p>
                      {isSelected && (
                        <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-ink">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === "content-mix" && (
            <motion.div
              key="content-mix"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-display text-3xl text-gold text-center">
                Comment préférez-vous votre contenu?
              </h2>
              <p className="mt-2 text-center text-sand/70">
                Choisissez le type de mélange qui vous correspond
              </p>

              <div className="mt-8 space-y-3">
                {CONTENT_MIX_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setContentMix(option.value)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                      contentMix === option.value
                        ? "border-gold bg-gold/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-sand">{option.label}</h3>
                        <p className="mt-1 text-sm text-sand/60">{option.description}</p>
                      </div>
                      {contentMix === option.value && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gold">
                          <div className="h-3 w-3 rounded-full bg-gold" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === "finish" && (
            <motion.div
              key="finish"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="mb-8 text-6xl">✨</div>
              <h2 className="font-display text-3xl text-gold">
                Parfait!
              </h2>
              <p className="mt-4 text-lg text-sand/70">
                Votre profil est configuré. Vous allez maintenant découvrir un feed personnalisé selon vos intérêts.
              </p>
              
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                <h3 className="text-sm uppercase tracking-wider text-gold">Vos sélections</h3>

                {/* Photo or Avatar summary */}
                {(selectedPhoto || selectedAvatar) && (
                  <div className="mt-3 flex items-center gap-3">
                    {selectedPhoto ? (
                      <img
                        src={selectedPhoto}
                        alt="Photo de profil"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : selectedAvatar ? (
                      <img
                        src={getAvatarById(selectedAvatar)?.imageUrl64}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : null}
                    <div>
                      <p className="text-sm text-sand">
                        {selectedPhoto
                          ? "Photo personnelle"
                          : selectedAvatar
                            ? getAvatarById(selectedAvatar)?.name
                            : null}
                      </p>
                      <p className="text-xs text-sand/50">
                        {selectedPhoto
                          ? "Identité authentique"
                          : selectedAvatar
                            ? getAvatarById(selectedAvatar)?.description
                            : null}
                      </p>
                    </div>
                  </div>
                )}

                {/* Interests summary */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedInterests.map(id => {
                    const topic = INTEREST_TOPICS.find(t => t.id === id);
                    if (!topic) return null;
                    return (
                      <span key={id} className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1.5 text-sm text-gold">
                        <topic.Icon className="w-4 h-4" />
                        {topic.label}
                      </span>
                    );
                  })}
                </div>
                <p className="mt-3 text-sm text-sand/60">
                  Mélange: {CONTENT_MIX_OPTIONS.find(o => o.value === contentMix)?.label}
                </p>
              </div>

              {error && (
                <p className="mt-4 text-sm text-red-400">{error}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="mt-10 flex items-center justify-between">
          {step !== "welcome" ? (
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={isLoading}
            >
              Retour
            </Button>
          ) : (
            <div />
          )}

          {step !== "finish" ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed[step]}
            >
              Continuer
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={isLoading}
            >
              {isLoading ? "Configuration..." : "Découvrir mon feed"}
            </Button>
          )}
        </div>

        {/* Skip option on welcome */}
        {step === "welcome" && (
          <button
            onClick={() => navigate("/", { replace: true })}
            className="mt-4 block w-full text-center text-sm text-sand/50 hover:text-sand"
          >
            Ignorer la personnalisation
          </button>
        )}
      </div>
    </div>
    </>
  );
}
