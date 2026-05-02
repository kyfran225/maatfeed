import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/Button";

interface Keyword {
  id: string;
  keyword: string;
  interests: string[];
  language: "fr" | "en";
  enabled: boolean;
}

interface ContentStats {
  total: number;
  byProvider: {
    youtube: number;
    tiktok: number;
    internal: number;
  };
  byStatus: Record<string, number>;
  recent24h: number;
  recent7d: number;
}

interface QueueStatus {
  ingest: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  };
  classify: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  };
  enrich: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  };
  totalJobs: number;
  isProcessing: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function AdminIngestionPage() {
  const queryClient = useQueryClient();
  const [newKeyword, setNewKeyword] = useState("");
  const [newInterests, setNewInterests] = useState("");
  const [newLang, setNewLang] = useState<"fr" | "en">("fr");

  // Fetch keywords
  const { data: keywordsData, isLoading } = useQuery({
    queryKey: ["admin-keywords"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/admin/keywords`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  // Fetch content stats
  const { data: contentStatsData } = useQuery({
    queryKey: ["admin-content-stats"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/admin/content-stats`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30s
  });

  // Fetch queue status (for progress tracking)
  const { data: queueStatusData } = useQuery({
    queryKey: ["admin-queue-status"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/admin/queue-status`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 5000, // Refresh every 5s for live progress
  });

  // Create keyword
  const createKeyword = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/api/admin/keywords`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          keyword: newKeyword,
          interests: newInterests.split(",").map((i) => i.trim()),
          language: newLang,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-keywords"] });
      setNewKeyword("");
      setNewInterests("");
      alert("Mot-clé créé !");
    },
  });

  // Mass ingest
  const massIngest = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/api/admin/mass-ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ limitPerProvider: 15 }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => {
      alert(`Ingestion lancée ! ~${data.data?.estimatedVideos} vidéos en arrière-plan.`);
    },
  });

  // Toggle keyword
  const toggleKeyword = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const res = await fetch(`${API_BASE}/api/admin/keywords/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-keywords"] }),
  });

  // Delete keyword
  const deleteKeyword = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/api/admin/keywords/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-keywords"] }),
  });

  // Ingest single
  const ingestSingle = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/api/admin/keywords/${id}/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ limitPerProvider: 10 }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => alert("Ingestion lancée !"),
  });

  const keywords: Keyword[] = keywordsData?.data?.keywords || [];
  const stats = keywordsData?.data?.stats || { total: 0, enabled: 0 };
  const contentStats: ContentStats = contentStatsData?.data || {
    total: 0,
    byProvider: { youtube: 0, tiktok: 0, internal: 0 },
    byStatus: {},
    recent24h: 0,
    recent7d: 0,
  };
  const queueStatus: QueueStatus = queueStatusData?.data || {
    ingest: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
    classify: { waiting: 0, active: 0, completed: 0, failed: 0 },
    enrich: { waiting: 0, active: 0, completed: 0, failed: 0 },
    totalJobs: 0,
    isProcessing: false,
  };

  // Calculate progress percentage (simple estimation)
  const totalInProgress = queueStatus.ingest.waiting + queueStatus.ingest.active +
                        queueStatus.classify.waiting + queueStatus.classify.active +
                        queueStatus.enrich.waiting + queueStatus.enrich.active;

  return (
    <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4 max-w-5xl">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">Admin - Gestion des Ingestions</h1>

      {/* Stats - Keywords */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-gray-100 p-3 sm:p-4 rounded">
          <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
          <div className="text-xs sm:text-sm text-gray-600">Mots-clés</div>
        </div>
        <div className="bg-green-100 p-3 sm:p-4 rounded">
          <div className="text-xl sm:text-2xl font-bold text-green-700">{stats.enabled}</div>
          <div className="text-xs sm:text-sm text-gray-600">Actifs</div>
        </div>
        <div className="bg-blue-100 p-3 sm:p-4 rounded">
          <div className="text-xl sm:text-2xl font-bold text-blue-700">
            {stats.byLanguage?.fr || 0}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Français</div>
        </div>
        <div className="bg-orange-100 p-3 sm:p-4 rounded">
          <div className="text-xl sm:text-2xl font-bold text-orange-700">
            {stats.byLanguage?.en || 0}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Anglais</div>
        </div>
      </div>

      {/* Stats - Content Videos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-red-100 p-3 sm:p-4 rounded">
          <div className="text-xl sm:text-2xl font-bold text-red-700">{contentStats.byProvider.youtube}</div>
          <div className="text-xs sm:text-sm text-gray-600">YouTube 📺</div>
        </div>
        <div className="bg-purple-100 p-3 sm:p-4 rounded">
          <div className="text-xl sm:text-2xl font-bold text-purple-700">{contentStats.byProvider.tiktok}</div>
          <div className="text-xs sm:text-sm text-gray-600">TikTok 🎵</div>
        </div>
        <div className="bg-gray-100 p-3 sm:p-4 rounded">
          <div className="text-xl sm:text-2xl font-bold">{contentStats.total}</div>
          <div className="text-xs sm:text-sm text-gray-600">Total Vidéos</div>
        </div>
        <div className="bg-yellow-100 p-3 sm:p-4 rounded">
          <div className="text-xl sm:text-2xl font-bold text-yellow-700">{contentStats.recent24h}</div>
          <div className="text-xs sm:text-sm text-gray-600">+24h 🆕</div>
        </div>
      </div>

      {/* Progress Bar - Processing Status */}
      {queueStatus.isProcessing && (
        <div className="bg-white border rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg sm:text-xl font-semibold">🔄 Traitement en cours...</h2>
            <span className="text-sm text-gray-600">
              {totalInProgress} job{totalInProgress > 1 ? "s" : ""} en attente
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
            <div 
              className="bg-green-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, 100 - (totalInProgress * 2))}%` }}
            />
          </div>
          
          {/* Queue details */}
          <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="font-bold text-blue-700">{queueStatus.ingest.waiting + queueStatus.ingest.active}</div>
              <div className="text-gray-600">Ingestion</div>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded">
              <div className="font-bold text-purple-700">{queueStatus.classify.waiting + queueStatus.classify.active}</div>
              <div className="text-gray-600">Classification</div>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded">
              <div className="font-bold text-orange-700">{queueStatus.enrich.waiting + queueStatus.enrich.active}</div>
              <div className="text-gray-600">Enrichissement</div>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-3">
            Rafraîchissement auto toutes les 5 secondes...
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white border rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Actions Rapides</h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button
            onClick={() => massIngest.mutate()}
            disabled={massIngest.isPending}
            className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
          >
            {massIngest.isPending ? "En cours..." : "🚀 Ingestion Massive"}
          </Button>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 mt-2">
          Lance l'ingestion pour tous les mots-clés activés (~15 vidéos par mot-clé)
        </p>
      </div>

      {/* Add Keyword - Responsive form */}
      <div className="bg-white border rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Ajouter un mot-clé</h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
          <div className="flex-1">
            <label className="block text-xs sm:text-sm font-medium mb-1">Mot-clé</label>
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="ex: histoire empire mali"
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs sm:text-sm font-medium mb-1">Intérêts (virgules)</label>
            <input
              type="text"
              value={newInterests}
              onChange={(e) => setNewInterests(e.target.value)}
              placeholder="ex: history, culture"
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div className="flex flex-row gap-3 items-end">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Langue</label>
              <select
                value={newLang}
                onChange={(e) => setNewLang(e.target.value as "fr" | "en")}
                className="px-3 py-2 border rounded text-sm"
              >
                <option value="fr">FR</option>
                <option value="en">EN</option>
              </select>
            </div>
            <Button
              onClick={() => createKeyword.mutate()}
              disabled={createKeyword.isPending || !newKeyword || !newInterests}
              className="whitespace-nowrap"
            >
              {createKeyword.isPending ? "..." : "Ajouter"}
            </Button>
          </div>
        </div>
      </div>

      {/* Keywords List - Responsive: cards on mobile, table on desktop */}
      <div className="bg-white border rounded-lg p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
          Mots-clés ({isLoading ? "..." : keywords.length})
        </h2>

        {isLoading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : (
          <>
            {/* Mobile: Card view */}
            <div className="block sm:hidden space-y-3">
              {keywords.map((k) => (
                <div key={k.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm break-all">{k.keyword}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        k.language === "fr"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {k.language.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {k.interests.slice(0, 3).join(", ")}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={k.enabled}
                        onChange={(e) =>
                          toggleKeyword.mutate({ id: k.id, enabled: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                      Actif
                    </label>
                    <div className="flex gap-2">
                      <Button
                        className="px-2 py-1 text-xs"
                        onClick={() => ingestSingle.mutate(k.id)}
                        disabled={!k.enabled}
                      >
                        ▶
                      </Button>
                      <Button
                        className="px-2 py-1 text-xs"
                        onClick={() => {
                          if (confirm("Supprimer ce mot-clé ?")) deleteKeyword.mutate(k.id);
                        }}
                      >
                        🗑
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table view */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Mot-clé</th>
                    <th className="text-left py-2 px-2">Langue</th>
                    <th className="text-left py-2 px-2">Intérêts</th>
                    <th className="text-center py-2 px-2">Actif</th>
                    <th className="text-right py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keywords.map((k) => (
                    <tr key={k.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2 break-all">{k.keyword}</td>
                      <td className="py-2 px-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            k.language === "fr"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {k.language.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <span className="text-sm text-gray-600">
                          {k.interests.slice(0, 2).join(", ")}
                          {k.interests.length > 2 && "..."}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={k.enabled}
                          onChange={(e) =>
                            toggleKeyword.mutate({ id: k.id, enabled: e.target.checked })
                          }
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            className="px-2 py-1 text-sm"
                            onClick={() => ingestSingle.mutate(k.id)}
                            disabled={!k.enabled}
                          >
                            ▶
                          </Button>
                          <Button
                            className="px-2 py-1 text-sm"
                            onClick={() => {
                              if (confirm("Supprimer ?")) deleteKeyword.mutate(k.id);
                            }}
                          >
                            🗑
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
