/* ============================
   SACRED SECTION TITLE - SVG PREMIUM
============================ */

// Composant SVG pixel-perfect avec animations (glow + énergie)
// Aucun hack CSS, tout est maîtrisé dans le SVG

export default function SacredSectionTitle() {
  return (
    <div className="w-full flex justify-center items-center py-8 bg-black overflow-hidden">

      {/* ============================
         SVG ROOT
      ============================ */}
      <svg
        width="600"
        height="80"
        viewBox="0 0 600 80"
        xmlns="http://www.w3.org/2000/svg"
      >

        {/* ============================
           DEFINITIONS (GRADIENT + GLOW)
        ============================ */}
        <defs>
          {/* Dégradé doré */}
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5c4a1f" />
            <stop offset="50%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#5c4a1f" />
          </linearGradient>

          {/* Glow */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Animation flux lumière */}
          <linearGradient id="animatedGold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5c4a1f">
              <animate attributeName="offset" values="-1;1" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="0.5" stopColor="#ffd700">
              <animate attributeName="offset" values="0;1.5" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="1%" stopColor="#5c4a1f">
              <animate attributeName="offset" values="1;2" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>

        {/* ============================
           LIGNES GAUCHES
        ============================ */}
        <line
          x1="40"
          y1="40"
          x2="180"
          y2="40"
          stroke="url(#animatedGold)"
          strokeWidth="1"
          filter="url(#glow)"
        />

        {/* ============================
           FLÈCHE GAUCHE
        ============================ */}
        <polygon
          points="190,40 175,32 175,48"
          fill="url(#goldGradient)"
          filter="url(#glow)"
        />

        {/* ============================
           TEXTE CENTRAL
        ============================ */}
        <text
          x="300"
          y="45"
          textAnchor="middle"
          fill="url(#goldGradient)"
          fontSize="20"
          fontFamily="Cinzel, serif"
          letterSpacing="3"
          filter="url(#glow)"
        >
          3. PRÊTRESSE
        </text>

        {/* ============================
           FLÈCHE DROITE
        ============================ */}
        <polygon
          points="410,40 425,32 425,48"
          fill="url(#goldGradient)"
          filter="url(#glow)"
        />

        {/* ============================
           LIGNES DROITES
        ============================ */}
        <line
          x1="430"
          y1="40"
          x2="560"
          y2="40"
          stroke="url(#animatedGold)"
          strokeWidth="1"
          filter="url(#glow)"
        />

      </svg>
    </div>
  );
}

