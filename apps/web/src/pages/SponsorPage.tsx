import { useState } from "react";
import { Heart, Mail, MessageCircle, Users, Zap, Star } from "lucide-react";
import { SEO } from "../components/SEO";

interface SponsorOption {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  icon: React.ReactNode;
}

const sponsorOptions: SponsorOption[] = [
  {
    id: "feed_24h",
    name: "Sponsor 24h dans le feed",
    price: 5000,
    description: "Votre marque visible dans le feed principal pendant 24 heures",
    features: [
      "Carte sponsorisée dans le feed",
      "Lien vers votre site/profil",
      "Visibilité auprès de 1000+ utilisateurs actifs",
      "Rapport de performance"
    ],
    icon: <Zap className="h-6 w-6" />
  },
  {
    id: "feed_7j",
    name: "Sponsor 7 jours",
    price: 20000,
    description: "Présence continue dans le feed pendant une semaine",
    features: [
      "Carte sponsorisée quotidienne",
      "Positionnement premium",
      "Statistiques détaillées",
      "Support personnalisé"
    ],
    icon: <Star className="h-6 w-6" />
  },
  {
    id: "creator_spotlight",
    name: "Créateur mis en avant",
    price: 5000,
    description: "Mise en avant dans la section créateurs",
    features: [
      "Badge créateur sponsorisé",
      "Lien vers votre contenu",
      "Visibilité dans les recommandations",
      "Métriques d'engagement"
    ],
    icon: <Users className="h-6 w-6" />
  },
  {
    id: "content_sponsored",
    name: "Article/débat sponsorisé",
    price: 25000,
    description: "Contenu sponsorisé intégré naturellement",
    features: [
      "Intégration éditoriale",
      "Diffusion dans le feed",
      "Engagement communautaire",
      "Rapport complet d'impact"
    ],
    icon: <MessageCircle className="h-6 w-6" />
  },
  {
    id: "monthly_partner",
    name: "Partenaire mensuel",
    price: 75000,
    description: "Partenariat stratégique mensuel",
    features: [
      "Logo sur la page d'accueil",
      "Mention dans la newsletter",
      "Accès aux statistiques globales",
      "Réunions stratégiques mensuelles"
    ],
    icon: <Heart className="h-6 w-6" />
  }
];

export default function SponsorPage() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
    selectedOption: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulation d'envoi - à remplacer par un vrai appel API
    await new Promise(resolve => setTimeout(resolve, 2000));

    setSubmitted(true);
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <>
        <SEO pageKey="home" />
        <section className="min-h-screen px-4 py-6 pb-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-8">
              <Heart className="mx-auto h-16 w-16 text-emerald-400" />
              <h1 className="mt-4 font-display text-2xl text-white">Merci pour votre intérêt !</h1>
              <p className="mt-2 text-sand/70">
                Nous avons bien reçu votre demande de sponsoring. Notre équipe vous contactera dans les 24-48 heures
                pour discuter des détails et finaliser votre campagne.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: "", email: "", company: "", message: "", selectedOption: "" });
                  setSelectedOption(null);
                }}
                className="mt-6 rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold/90"
              >
                Faire une nouvelle demande
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <SEO pageKey="home" />
      <section className="min-h-screen px-4 py-6 pb-28">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-gold">Soutenez MAATFEED</p>
            <h1 className="mt-2 font-display text-3xl text-white sm:text-4xl">Devenir Sponsor</h1>
            <p className="mt-4 text-lg text-sand/70 max-w-2xl mx-auto">
              Rejoignez les marques et créateurs qui soutiennent la culture africaine francophone.
              Touchez une audience engagée et consciente.
            </p>
          </div>

          {/* Options de sponsoring */}
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sponsorOptions.map((option) => (
              <article
                key={option.id}
                className={`cursor-pointer rounded-lg border p-6 transition-all hover:border-gold/50 ${
                  selectedOption === option.id
                    ? "border-gold/60 bg-gold/10"
                    : "border-white/10 bg-white/5"
                }`}
                onClick={() => setSelectedOption(option.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="text-gold">{option.icon}</div>
                  <div>
                    <h3 className="font-semibold text-white">{option.name}</h3>
                    <p className="text-2xl font-bold text-gold mt-1">
                      {option.price.toLocaleString("fr-FR")} XOF
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-sm text-sand/70">{option.description}</p>

                <ul className="mt-4 space-y-2">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-xs text-sand/60">
                      <div className="h-1.5 w-1.5 rounded-full bg-gold" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          {/* Formulaire de contact */}
          {selectedOption && (
            <div className="mt-12 rounded-lg border border-white/10 bg-white/5 p-8">
              <h2 className="font-display text-2xl text-white">Contactez-nous</h2>
              <p className="mt-2 text-sand/70">
                Remplissez ce formulaire et nous vous répondrons rapidement pour organiser votre campagne de sponsoring.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-sand/50 focus:border-gold focus:outline-none"
                      placeholder="Votre nom"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-sand/50 focus:border-gold focus:outline-none"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-white">
                    Entreprise / Organisation
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-sand/50 focus:border-gold focus:outline-none"
                    placeholder="Nom de votre entreprise ou organisation"
                  />
                </div>

                <div>
                  <label htmlFor="selectedOption" className="block text-sm font-medium text-white">
                    Option sélectionnée
                  </label>
                  <select
                    id="selectedOption"
                    name="selectedOption"
                    value={formData.selectedOption}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white focus:border-gold focus:outline-none"
                  >
                    <option value="">Choisir une option</option>
                    {sponsorOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name} - {option.price.toLocaleString("fr-FR")} XOF
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-white">
                    Message (optionnel)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-sand/50 focus:border-gold focus:outline-none"
                    placeholder="Dites-nous en plus sur votre projet ou vos objectifs..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Mail className="h-4 w-4" />
                  {isSubmitting ? "Envoi en cours..." : "Envoyer ma demande"}
                </button>
              </form>
            </div>
          )}

          {/* Informations complémentaires */}
          <div className="mt-12 rounded-lg border border-white/10 bg-white/[0.03] p-6">
            <h3 className="font-semibold text-white">Pourquoi sponsoriser MAATFEED ?</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-gold">Audience ciblée</h4>
                <p className="mt-1 text-sm text-sand/70">
                  Communauté engagée dans la culture africaine francophone, jeunes actifs, créateurs et entrepreneurs.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gold">Impact mesurable</h4>
                <p className="mt-1 text-sm text-sand/70">
                  Rapports détaillés sur l'engagement, les clics et la portée de vos campagnes.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gold">Intégration naturelle</h4>
                <p className="mt-1 text-sm text-sand/70">
                  Contenus sponsorisés intégrés harmonieusement dans l'expérience utilisateur.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gold">Support dédié</h4>
                <p className="mt-1 text-sm text-sand/70">
                  Accompagnement personnalisé pour optimiser vos campagnes de sponsoring.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}