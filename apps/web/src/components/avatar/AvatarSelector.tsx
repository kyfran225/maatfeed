import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KEMET_AVATARS, type KemetAvatarType } from "@maat/shared";

interface AvatarSelectorProps {
  selectedAvatar: KemetAvatarType | null;
  onSelect: (avatarId: KemetAvatarType) => void;
}

const IDENTITY_COLORS: Record<string, string> = {
  classic: "from-gold/20 to-amber-600/20 border-gold/50",
  vision: "from-amber-500/20 to-yellow-600/20 border-amber-500/50",
  knowledge: "from-emerald-500/20 to-cyan-600/20 border-emerald-500/50",
  spiritual: "from-violet-500/20 to-fuchsia-600/20 border-violet-500/50",
  social: "from-blue-500/20 to-teal-600/20 border-blue-500/50",
  balance: "from-rose-500/20 to-orange-500/20 border-rose-500/50",
  critical: "from-slate-500/20 to-zinc-600/20 border-slate-400/50"
};

const IDENTITY_GRADIENTS: Record<string, string> = {
  classic: "from-gold to-amber-500",
  vision: "from-amber-400 to-yellow-500",
  knowledge: "from-emerald-400 to-cyan-500",
  spiritual: "from-violet-400 to-fuchsia-500",
  social: "from-blue-400 to-teal-500",
  balance: "from-rose-400 to-orange-500",
  critical: "from-slate-300 to-zinc-500"
};

export function AvatarSelector({ selectedAvatar, onSelect }: AvatarSelectorProps) {
  const [hoveredAvatar, setHoveredAvatar] = useState<KemetAvatarType | null>(null);
  const selectedAvatarData = selectedAvatar ? KEMET_AVATARS.find(a => a.id === selectedAvatar) : null;
  const hoveredAvatarData = hoveredAvatar ? KEMET_AVATARS.find(a => a.id === hoveredAvatar) : null;
  const displayAvatar = hoveredAvatarData || selectedAvatarData;

  return (
    <div className="w-full">
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
        <p className="text-sm text-sand/80">
          Les avatars IA restent separes et ne sont pas proposes ici.
        </p>
        <p className="mt-1 text-xs text-sand/50">
          Cette selection ne contient que les avatars utilisateur.
        </p>
      </div>

      {/* Avatar Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
        {KEMET_AVATARS.map((avatar) => {
          const isSelected = selectedAvatar === avatar.id;
          const gradientClass = IDENTITY_COLORS[avatar.identityType] || IDENTITY_COLORS.knowledge;

          return (
            <motion.button
              key={avatar.id}
              onClick={() => onSelect(avatar.id)}
              onMouseEnter={() => setHoveredAvatar(avatar.id)}
              onMouseLeave={() => setHoveredAvatar(null)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative aspect-square rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                isSelected
                  ? `bg-gradient-to-br ${gradientClass} ring-2 ring-gold ring-offset-2 ring-offset-ink`
                  : "bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10"
              }`}
            >
              <img
                src={avatar.imageUrl}
                alt={avatar.name}
                className={`w-full h-full object-cover transition-all duration-300 ${
                  isSelected ? "scale-110" : "scale-100"
                }`}
              />

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                  <svg className="w-4 h-4 text-ink" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}

              {/* Name overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <p className="text-xs font-medium text-white text-center truncate">
                  {avatar.name}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Avatar Details Panel */}
      <AnimatePresence mode="wait">
        {displayAvatar && (
          <motion.div
            key={displayAvatar.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`rounded-2xl border bg-gradient-to-br ${IDENTITY_COLORS[displayAvatar.identityType]} p-4 text-left`}
          >
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${IDENTITY_GRADIENTS[displayAvatar.identityType]} p-0.5`}>
                  <img
                    src={displayAvatar.imageUrl}
                    alt={displayAvatar.name}
                    className="w-full h-full rounded-xl object-cover bg-ink"
                  />
                </div>
                <span className="absolute -top-1 -right-1 text-2xl">{displayAvatar.emoji}</span>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-display text-gold flex items-center gap-2">
                  {displayAvatar.name}
                  {selectedAvatar === displayAvatar.id && (
                    <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full">
                      Sélectionné
                    </span>
                  )}
                </h3>

                <p className="text-sm text-sand/80 mt-1">{displayAvatar.description}</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-sand/50">Profil</p>
                <p className="mt-1 text-sm text-sand">{displayAvatar.meaning}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-sand/50">Contenus recommandés</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {displayAvatar.contentRecommendations.map((rec) => (
                    <span
                      key={rec}
                      className="text-xs bg-white/10 text-sand/80 px-2 py-0.5 rounded-full"
                    >
                      {rec}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-sand/50">Ton</p>
                <p className="mt-1 text-sm text-sand italic">"{displayAvatar.tone}"</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!displayAvatar && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-sand/50">Survolez ou selectionnez un avatar pour voir ses details</p>
        </div>
      )}
    </div>
  );
}
