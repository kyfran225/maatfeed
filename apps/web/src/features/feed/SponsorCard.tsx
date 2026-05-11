import { ExternalLink, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { incrementSponsorStats } from "../../services/sponsorService";

interface SponsorCardProps {
  sponsor: {
    id: string;
    name: string;
    logo?: string;
    description: string;
    website?: string;
    ctaText?: string;
  };
}

export function SponsorCard({ sponsor }: SponsorCardProps) {
  const handleCTAClick = async () => {
    if (sponsor.website) {
      try {
        await incrementSponsorStats(sponsor.id, 'clicks');
      } catch (error) {
        console.error("Erreur lors de l'incrémentation des clics:", error);
      }
      // Ouvrir le lien dans un nouvel onglet
      window.open(sponsor.website, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <article className="overflow-hidden rounded-lg border border-gold/30 bg-gradient-to-br from-gold/10 to-gold/5">
      <div className="p-4">
        {/* Header avec badge sponsor */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-gold" />
            <span className="text-xs font-medium text-gold uppercase tracking-wide">Sponsorisé</span>
          </div>
          {sponsor.website && (
            <a
              href={sponsor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold/80 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                handleCTAClick();
              }}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

        {/* Logo et nom */}
        <div className="flex items-center gap-3 mb-3">
          {sponsor.logo ? (
            <img
              src={sponsor.logo}
              alt={sponsor.name}
              className="h-10 w-10 rounded-lg object-cover bg-white/10"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-gold/20 flex items-center justify-center">
              <span className="text-sm font-bold text-gold">{sponsor.name.charAt(0)}</span>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-white text-lg">{sponsor.name}</h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-sand/80 mb-4 line-clamp-2">
          {sponsor.description}
        </p>

        {/* Call to action */}
        {sponsor.website && (
          <button
            onClick={handleCTAClick}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-ink transition hover:bg-gold/90"
          >
            {sponsor.ctaText || "En savoir plus"}
            <ExternalLink className="h-3 w-3" />
          </button>
        )}

        {/* Lien vers page sponsor */}
        <div className="mt-3 pt-3 border-t border-gold/20">
          <Link
            to="/sponsor"
            className="text-xs text-sand/60 hover:text-gold transition-colors"
          >
            Devenir sponsor →
          </Link>
        </div>
      </div>
    </article>
  );
}