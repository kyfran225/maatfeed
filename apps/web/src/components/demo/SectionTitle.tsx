/* ============================
   SECTION TITLE - PRETRESSE
============================ */

// Composant stylisé reproduisant le design de l'image
// Utilise Tailwind + pseudo éléments pour les lignes décoratives

export default function SectionTitle() {
  return (
    <div className="flex items-center justify-center w-full py-6">
      
      {/* ============================
         CONTENEUR GLOBAL
      ============================ */}
      <div className="flex items-center gap-4 text-[#d4af37] font-semibold tracking-widest">
        
        {/* ============================
           LIGNE GAUCHE + FLÈCHE
        ============================ */}
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-12 bg-[#d4af37] opacity-50"></div>
          <span className="text-lg">{'=>'}</span>
        </div>

        {/* ============================
           TEXTE CENTRAL
        ============================ */}
        <h2 className="text-xl md:text-2xl font-bold relative">
          3. PRÊTRESSE
          
          {/* Glow subtil */}
          <span className="absolute inset-0 blur-sm opacity-30 text-[#d4af37]">
            3. PRÊTRESSE
          </span>
        </h2>

        {/* ============================
           LIGNE DROITE + FLÈCHE
        ============================ */}
        <div className="flex items-center gap-2">
          <span className="text-lg">{'<='}</span>
          <div className="h-[1px] w-12 bg-[#d4af37] opacity-50"></div>
        </div>

      </div>
    </div>
  );
}
