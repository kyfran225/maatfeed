import type { SVGProps, ComponentType } from "react";

type IconProps = SVGProps<SVGSVGElement>;
export type IconComponent = ComponentType<IconProps>;

// 🏺 1. KEMET (PYRAMIDE + SOLEIL)
export const KemetIcon = ({ className = "w-6 h-6", ...props }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 3l8 16H4L12 3z" />
    <circle cx="12" cy="6" r="1.5" />
  </svg>
);

// 📜 2. PHILOSOPHIE AFRICAINE (PARCHEMIN)
export const PhilosophyIcon = ({ className = "w-6 h-6", ...props }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M6 4h12v16H6z" />
    <path d="M8 8h8M8 12h6M8 16h4" />
  </svg>
);

// 🏺 3. HISTOIRE (COLONNE ANTIQUE)
export const HistoryIcon = ({ className = "w-6 h-6", ...props }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M6 20h12" />
    <path d="M8 6h8" />
    <path d="M9 6v14M12 6v14M15 6v14" />
  </svg>
);

// ✨ 4. SPIRITUALITÉ (ANKH SIMPLE)
export const SpiritualityIcon = ({ className = "w-6 h-6", ...props }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <ellipse cx="12" cy="6" rx="3" ry="4" />
    <path d="M12 10v8" />
    <path d="M9 13h6" />
  </svg>
);

// 🎓 5. ÉDUCATION (LIVRE OUVERT)
export const EducationIcon = ({ className = "w-6 h-6", ...props }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M3 6h8v12H3zM13 6h8v12h-8z" />
    <path d="M11 6v12" />
  </svg>
);

// 🔥 6. DÉBAT (FLAMME + BULLES)
export const DebateIcon = ({ className = "w-6 h-6", ...props }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 3c2 2 4 4 4 7a4 4 0 1 1-8 0c0-3 2-5 4-7z" />
    <circle cx="8" cy="16" r="1" />
    <circle cx="16" cy="16" r="1" />
  </svg>
);

// 🌍 7. CULTURE (TERRE + MOTIFS)
export const CultureIcon = ({ className = "w-6 h-6", ...props }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3c3 3 3 15 0 18" />
  </svg>
);

// 🏛️ 8. POLITIQUE (COLONNES + TOIT)
export const PoliticsIcon = ({ className = "w-6 h-6", ...props }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M3 10l9-4 9 4" />
    <path d="M5 10v8M9 10v8M15 10v8M19 10v8" />
    <path d="M3 18h18" />
  </svg>
);

// 🌿 9. BIEN-ÊTRE (FEUILLE)
export const WellnessIcon = ({ className = "w-6 h-6", ...props }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M4 14c8-10 16-6 16-6s-2 12-10 12c-3 0-6-2-6-6z" />
  </svg>
);

// ⚗️ 10. SCIENCES (ATOME)
export const ScienceIcon = ({ className = "w-6 h-6", ...props }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="2" />
    <ellipse cx="12" cy="12" rx="8" ry="3" />
    <ellipse cx="12" cy="12" rx="3" ry="8" />
  </svg>
);

// Map pour accès facile par ID
export const INTEREST_ICONS: Record<string, IconComponent> = {
  kemet: KemetIcon,
  "african-philosophy": PhilosophyIcon,
  spirituality: SpiritualityIcon,
  history: HistoryIcon,
  education: EducationIcon,
  debate: DebateIcon,
  culture: CultureIcon,
  politics: PoliticsIcon,
  health: WellnessIcon,
  science: ScienceIcon
};

// Map pour les labels
type InterestInfo = {
  label: string;
  Icon: IconComponent;
  defaultColor: string;
  selectedColor: string;
};

export const INTEREST_TOPICS: Record<string, InterestInfo> = {
  kemet: {
    label: "Kemet",
    Icon: KemetIcon,
    defaultColor: "text-sand/50",
    selectedColor: "text-amber-400"
  },
  "african-philosophy": {
    label: "Philosophie Africaine",
    Icon: PhilosophyIcon,
    defaultColor: "text-sand/50",
    selectedColor: "text-blue-400"
  },
  spirituality: {
    label: "Spiritualité",
    Icon: SpiritualityIcon,
    defaultColor: "text-sand/50",
    selectedColor: "text-purple-400"
  },
  history: {
    label: "Histoire",
    Icon: HistoryIcon,
    defaultColor: "text-sand/50",
    selectedColor: "text-stone-400"
  },
  education: {
    label: "Éducation",
    Icon: EducationIcon,
    defaultColor: "text-sand/50",
    selectedColor: "text-emerald-400"
  },
  debate: {
    label: "Débats",
    Icon: DebateIcon,
    defaultColor: "text-sand/50",
    selectedColor: "text-orange-400"
  },
  culture: {
    label: "Culture",
    Icon: CultureIcon,
    defaultColor: "text-sand/50",
    selectedColor: "text-rose-400"
  },
  politics: {
    label: "Politique",
    Icon: PoliticsIcon,
    defaultColor: "text-sand/50",
    selectedColor: "text-indigo-400"
  },
  health: {
    label: "Bien-être",
    Icon: WellnessIcon,
    defaultColor: "text-sand/50",
    selectedColor: "text-teal-400"
  },
  science: {
    label: "Science",
    Icon: ScienceIcon,
    defaultColor: "text-sand/50",
    selectedColor: "text-cyan-400"
  }
};
