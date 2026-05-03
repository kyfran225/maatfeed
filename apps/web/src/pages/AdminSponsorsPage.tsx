import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SEO } from "../components/SEO";
import { Button } from "../components/ui/Button";
import * as httpClient from "../services/httpClient";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface Sponsor {
  id: string;
  name: string;
  logo?: string;
  description: string;
  website?: string;
  ctaText?: string;
  isActive: boolean;
  priority: number;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    username: string;
    email: string;
  };
  stats: {
    impressions: number;
    clicks: number;
    lastShown?: string;
  };
}

interface CreateSponsorData {
  name: string;
  logo?: string;
  description: string;
  website?: string;
  ctaText?: string;
  priority?: number;
  endDate?: string;
}

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [formData, setFormData] = useState<CreateSponsorData>({
    name: "",
    logo: "",
    description: "",
    website: "",
    ctaText: "En savoir plus",
    priority: 0,
    endDate: ""
  });

  const queryClient = useQueryClient();

  // Charger les sponsors
  useEffect(() => {
    loadSponsors();
  }, []);

  const loadSponsors = async () => {
    try {
      const response = await httpClient.getJson<{ sponsors: Sponsor[] }>(`${API_BASE}/api/sponsors`);
      setSponsors(response.sponsors);
    } catch (error) {
      console.error("Erreur lors du chargement des sponsors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createSponsorMutation = useMutation({
    mutationFn: async (data: CreateSponsorData) => {
      return httpClient.postJson<{ sponsor: Sponsor }>(`${API_BASE}/api/sponsors`, data);
    },
    onSuccess: () => {
      loadSponsors();
      setShowCreateForm(false);
      resetForm();
    }
  });

  const updateSponsorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateSponsorData & { isActive: boolean }> }) => {
      return httpClient.putJson<{ sponsor: Sponsor }>(`${API_BASE}/api/sponsors/${id}`, data);
    },
    onSuccess: () => {
      loadSponsors();
      setEditingSponsor(null);
      resetForm();
    }
  });

  const deleteSponsorMutation = useMutation({
    mutationFn: async (id: string) => {
      return httpClient.deleteJson(`${API_BASE}/api/sponsors/${id}`);
    },
    onSuccess: () => {
      loadSponsors();
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      logo: "",
      description: "",
      website: "",
      ctaText: "En savoir plus",
      priority: 0,
      endDate: ""
    });
  };

  const handleCreate = () => {
    createSponsorMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (editingSponsor) {
      updateSponsorMutation.mutate({
        id: editingSponsor.id,
        data: formData
      });
    }
  };

  const handleToggleActive = (sponsor: Sponsor) => {
    updateSponsorMutation.mutate({
      id: sponsor.id,
      data: { isActive: !sponsor.isActive }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce sponsor ?")) {
      deleteSponsorMutation.mutate(id);
    }
  };

  const startEdit = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    setFormData({
      name: sponsor.name,
      logo: sponsor.logo || "",
      description: sponsor.description,
      website: sponsor.website || "",
      ctaText: sponsor.ctaText || "En savoir plus",
      priority: sponsor.priority,
      endDate: sponsor.endDate ? new Date(sponsor.endDate).toISOString().split('T')[0] : ""
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <SEO pageKey="home" />
      <section className="min-h-screen px-4 py-6 pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gold">Administration</p>
              <h1 className="mt-2 font-display text-3xl text-white">Gestion des Sponsors</h1>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-gold text-ink hover:bg-gold/90"
            >
              Nouveau Sponsor
            </Button>
          </div>

          {/* Statistiques globales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="text-2xl font-bold text-gold">
                {sponsors.filter(s => s.isActive).length}
              </div>
              <div className="text-sm text-sand/70">Sponsors actifs</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="text-2xl font-bold text-gold">
                {sponsors.reduce((sum, s) => sum + s.stats.impressions, 0).toLocaleString()}
              </div>
              <div className="text-sm text-sand/70">Impressions totales</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="text-2xl font-bold text-gold">
                {sponsors.reduce((sum, s) => sum + s.stats.clicks, 0).toLocaleString()}
              </div>
              <div className="text-sm text-sand/70">Clics totaux</div>
            </div>
          </div>

          {/* Formulaire de création/édition */}
          {(showCreateForm || editingSponsor) && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-6 mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">
                {editingSponsor ? "Modifier le sponsor" : "Nouveau sponsor"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-sand/50 focus:border-gold focus:outline-none"
                    placeholder="Nom du sponsor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Logo (URL)
                  </label>
                  <input
                    type="url"
                    value={formData.logo}
                    onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
                    className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-sand/50 focus:border-gold focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-sand/50 focus:border-gold focus:outline-none"
                  placeholder="Description du sponsor"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Site web
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-sand/50 focus:border-gold focus:outline-none"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Texte CTA
                  </label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData(prev => ({ ...prev, ctaText: e.target.value }))}
                    className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-sand/50 focus:border-gold focus:outline-none"
                    placeholder="En savoir plus"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Priorité (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                    className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-sand/50 focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Date de fin (optionnel)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-sand/50 focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={editingSponsor ? handleUpdate : handleCreate}
                  disabled={createSponsorMutation.isPending || updateSponsorMutation.isPending}
                  className="bg-gold text-ink hover:bg-gold/90"
                >
                  {createSponsorMutation.isPending || updateSponsorMutation.isPending
                    ? "Enregistrement..."
                    : editingSponsor ? "Modifier" : "Créer"}
                </Button>

                <Button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingSponsor(null);
                    resetForm();
                  }}
                  variant="secondary"
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}

          {/* Liste des sponsors */}
          <div className="space-y-4">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="rounded-lg border border-white/10 bg-white/5 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {sponsor.logo ? (
                      <img
                        src={sponsor.logo}
                        alt={sponsor.name}
                        className="h-12 w-12 rounded-lg object-cover bg-white/10"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-gold/20 flex items-center justify-center">
                        <span className="text-lg font-bold text-gold">
                          {sponsor.name.charAt(0)}
                        </span>
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {sponsor.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          sponsor.isActive
                            ? "bg-emerald-400/10 text-emerald-200"
                            : "bg-red-400/10 text-red-200"
                        }`}>
                          {sponsor.isActive ? "Actif" : "Inactif"}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs bg-gold/10 text-gold">
                          Priorité: {sponsor.priority}
                        </span>
                      </div>

                      <p className="text-sand/70 mb-2">{sponsor.description}</p>

                      {sponsor.website && (
                        <a
                          href={sponsor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gold hover:text-gold/80 text-sm"
                        >
                          {sponsor.website}
                        </a>
                      )}

                      <div className="flex items-center gap-4 mt-3 text-sm text-sand/50">
                        <span>Impressions: {sponsor.stats.impressions.toLocaleString()}</span>
                        <span>Clics: {sponsor.stats.clicks.toLocaleString()}</span>
                        <span>CTR: {sponsor.stats.impressions > 0
                          ? ((sponsor.stats.clicks / sponsor.stats.impressions) * 100).toFixed(1) + "%"
                          : "0%"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleToggleActive(sponsor)}
                      disabled={updateSponsorMutation.isPending}
                      variant={sponsor.isActive ? "secondary" : "primary"}
                      className="px-3 py-1 text-sm"
                    >
                      {sponsor.isActive ? "Désactiver" : "Activer"}
                    </Button>

                    <Button
                      onClick={() => startEdit(sponsor)}
                      variant="secondary"
                      className="px-3 py-1 text-sm"
                    >
                      Modifier
                    </Button>

                    <Button
                      onClick={() => handleDelete(sponsor.id)}
                      disabled={deleteSponsorMutation.isPending}
                      variant="secondary"
                      className="px-3 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {sponsors.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sand/70">Aucun sponsor trouvé.</p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 bg-gold text-ink hover:bg-gold/90"
                >
                  Créer le premier sponsor
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}