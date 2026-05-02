import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SEO } from "../components/SEO";
import { Button } from "../components/ui/Button";
import { useAdminOps } from "../hooks/useAdminOps";
import { postJson } from "../services/httpClient";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

type RefreshType = "global" | "user" | "session" | "all";

export default function AdminOpsPage() {
  const [keyword, setKeyword] = useState("kemet");
  const [debateId, setDebateId] = useState("");
  const [commentId, setCommentId] = useState("");
  const [sampleText, setSampleText] = useState(
    "Question sérieuse : quelles sources historiques fiables permettent de distinguer l'héritage spirituel de Kemet des lectures chrétiennes, juives ou islamiques plus tardives, sans tomber dans l'idéologie ?"
  );
  const [recentCommentCount, setRecentCommentCount] = useState(1);
  const [lastAIResponseMinutesAgo, setLastAIResponseMinutesAgo] = useState(999);
  const [refreshType, setRefreshType] = useState<RefreshType>("global");
  const [refreshUserId, setRefreshUserId] = useState("");
  const [refreshSessionId, setRefreshSessionId] = useState("");
  const { ingestMutation } = useAdminOps();

  const diagnosticsQuery = useQuery({
    queryKey: ["admin-auto-ai-diagnostics"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/admin/auto-ai-diagnostics`, {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to fetch auto AI diagnostics");
      }
      return response.json();
    },
    refetchInterval: 5000
  });

  const autoAICheckMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE}/api/admin/auto-ai-diagnostics/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          text: sampleText,
          recentCommentCount,
          lastAIResponseMinutesAgo
        })
      });

      if (!response.ok) {
        throw new Error("Failed to run auto AI check");
      }

      return response.json();
    }
  });

  const triggerAutoAIReplyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE}/api/admin/auto-ai-diagnostics/trigger`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          commentId: commentId.trim()
        })
      });

      if (!response.ok) {
        throw new Error("Failed to trigger auto AI reply");
      }

      return response.json();
    },
    onSuccess: () => {
      diagnosticsQuery.refetch();
    }
  });

  const refreshFeedCacheMutation = useMutation({
    mutationFn: async () => {
      const body: Record<string, string | undefined> = {
        type: refreshType
      };
      if (refreshType === "user" && refreshUserId.trim()) {
        body.userId = refreshUserId.trim();
      }
      if (refreshType === "session" && refreshSessionId.trim()) {
        body.sessionId = refreshSessionId.trim();
      }

      return postJson<{ success: boolean; message: string; data: unknown }>(
        `${API_BASE}/api/admin/feed/refresh-cache`,
        body
      );
    }
  });

  const recentDebateCommentsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE}/api/admin/auto-ai-diagnostics/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          contentId: debateId.trim(),
          limit: 10
        })
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recent debate comments");
      }

      return response.json();
    }
  });

  const diagnostics = diagnosticsQuery.data?.data;
  const readiness = diagnostics?.readiness;
  const queue = diagnostics?.queue;
  const providers = diagnostics?.providers;
  const trimmedDebateId = debateId.trim();

  return (
    <>
      <SEO pageKey="admin" />
      <section className="px-4 py-6 pb-24">
        <h1 className="font-display text-3xl text-gold">Ops</h1>
        <p className="mt-3 text-sand/75">Ingestion, evolution, and readiness controls will be exposed here for internal use.</p>

        <div className="mt-6 rounded-2xl bg-ink/40 p-4">
          <h2 className="text-lg font-semibold text-sand">Ingestion</h2>
        <div className="mt-3 flex flex-col gap-3">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="w-full rounded-xl border border-sand/20 bg-ink px-4 py-3 text-sand"
            placeholder="keyword"
          />
          <Button
            disabled={ingestMutation.isPending || !keyword.trim()}
            onClick={() => ingestMutation.mutate({ keyword: keyword.trim() })}
          >
            {ingestMutation.isPending ? "Queueing..." : "Queue ingestion"}
          </Button>
          {ingestMutation.isError ? (
            <p className="text-sm text-ember">{String(ingestMutation.error)}</p>
          ) : null}
          {ingestMutation.data ? (
            <pre className="overflow-auto rounded-xl bg-ink p-3 text-xs text-sand/80">
              {JSON.stringify(ingestMutation.data, null, 2)}
            </pre>
          ) : null}
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-ink/40 p-4">
        <h2 className="text-lg font-semibold text-sand">Feed Cache</h2>
        <p className="mt-1 text-sm text-sand/70">
          Rafraîchir le cache du feed pour appliquer les nouveaux filtres de contenu.
        </p>
        <div className="mt-3 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(["global", "user", "session", "all"] as RefreshType[]).map((type) => (
              <button
                key={type}
                onClick={() => setRefreshType(type)}
                className={`rounded-xl border px-3 py-2 text-sm capitalize ${
                  refreshType === type
                    ? "border-gold bg-gold/20 text-gold"
                    : "border-sand/20 bg-ink text-sand/70 hover:border-sand/40"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {refreshType === "user" && (
            <input
              value={refreshUserId}
              onChange={(event) => setRefreshUserId(event.target.value)}
              className="w-full rounded-xl border border-sand/20 bg-ink px-4 py-3 text-sand"
              placeholder="userId (required for user refresh)"
            />
          )}

          {refreshType === "session" && (
            <input
              value={refreshSessionId}
              onChange={(event) => setRefreshSessionId(event.target.value)}
              className="w-full rounded-xl border border-sand/20 bg-ink px-4 py-3 text-sand"
              placeholder="sessionId (required for session refresh)"
            />
          )}

          <Button
            disabled={refreshFeedCacheMutation.isPending || (refreshType === "user" && !refreshUserId.trim()) || (refreshType === "session" && !refreshSessionId.trim())}
            onClick={() => refreshFeedCacheMutation.mutate()}
          >
            {refreshFeedCacheMutation.isPending ? "Refreshing..." : `Refresh ${refreshType} cache`}
          </Button>

          {refreshFeedCacheMutation.isError ? (
            <p className="text-sm text-ember">{String(refreshFeedCacheMutation.error)}</p>
          ) : null}

          {refreshFeedCacheMutation.data ? (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-3">
              <p className="text-sm text-green-400">✓ {refreshFeedCacheMutation.data.message}</p>
              <pre className="mt-2 overflow-auto rounded bg-ink p-2 text-xs text-sand/80">
                {JSON.stringify(refreshFeedCacheMutation.data.data, null, 2)}
              </pre>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-ink/40 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-sand">Auto IA</h2>
            <p className="text-sm text-sand/70">
              État du pipeline de réponse IA automatique et simulation de décision.
            </p>
          </div>
          <Button
            disabled={diagnosticsQuery.isFetching}
            onClick={() => diagnosticsQuery.refetch()}
          >
            {diagnosticsQuery.isFetching ? "Refreshing..." : "Refresh status"}
          </Button>
        </div>

        {diagnosticsQuery.isError ? (
          <p className="mt-3 text-sm text-ember">{String(diagnosticsQuery.error)}</p>
        ) : null}

        {diagnostics ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-sand/10 bg-ink p-4">
              <h3 className="text-sm font-semibold text-sand">Readiness</h3>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl border border-sand/10 bg-ink/60 p-3">
                  <div className="text-sand/50">Overall</div>
                  <div className={readiness?.status === "ready" ? "text-green-400" : "text-amber-400"}>
                    {readiness?.status || "unknown"}
                  </div>
                </div>
                <div className="rounded-xl border border-sand/10 bg-ink/60 p-3">
                  <div className="text-sand/50">Workers</div>
                  <div className={readiness?.checks?.workers === "ready" ? "text-green-400" : "text-ember"}>
                    {readiness?.checks?.workers || "unknown"}
                  </div>
                </div>
                <div className="rounded-xl border border-sand/10 bg-ink/60 p-3">
                  <div className="text-sand/50">Redis</div>
                  <div className={readiness?.checks?.redis === "ready" ? "text-green-400" : "text-ember"}>
                    {readiness?.checks?.redis || "unknown"}
                  </div>
                </div>
                <div className="rounded-xl border border-sand/10 bg-ink/60 p-3">
                  <div className="text-sand/50">Mongo</div>
                  <div className={readiness?.checks?.mongo === "ready" ? "text-green-400" : "text-ember"}>
                    {readiness?.checks?.mongo || "unknown"}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-sand/10 bg-ink p-4">
              <h3 className="text-sm font-semibold text-sand">Queue community-ai</h3>
              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-xl border border-sand/10 bg-ink/60 p-3">
                  <div className="text-sand/50">Waiting</div>
                  <div className="text-sand">{queue?.waiting ?? 0}</div>
                </div>
                <div className="rounded-xl border border-sand/10 bg-ink/60 p-3">
                  <div className="text-sand/50">Active</div>
                  <div className="text-sand">{queue?.active ?? 0}</div>
                </div>
                <div className="rounded-xl border border-sand/10 bg-ink/60 p-3">
                  <div className="text-sand/50">Delayed</div>
                  <div className="text-sand">{queue?.delayed ?? 0}</div>
                </div>
                <div className="rounded-xl border border-sand/10 bg-ink/60 p-3">
                  <div className="text-sand/50">Completed</div>
                  <div className="text-sand">{queue?.completed ?? 0}</div>
                </div>
                <div className="rounded-xl border border-sand/10 bg-ink/60 p-3">
                  <div className="text-sand/50">Failed</div>
                  <div className={queue?.failed ? "text-ember" : "text-sand"}>{queue?.failed ?? 0}</div>
                </div>
                <div className="rounded-xl border border-sand/10 bg-ink/60 p-3">
                  <div className="text-sand/50">Paused</div>
                  <div className="text-sand">{queue?.paused ?? 0}</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-sand/10 bg-ink p-4 md:col-span-2">
              <h3 className="text-sm font-semibold text-sand">Providers</h3>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className={`rounded-full px-3 py-2 ${providers?.groqConfigured ? "bg-green-500/15 text-green-300" : "bg-ember/15 text-ember"}`}>
                  Groq {providers?.groqConfigured ? "configured" : "missing"}
                </span>
                <span className={`rounded-full px-3 py-2 ${providers?.geminiConfigured ? "bg-green-500/15 text-green-300" : "bg-ember/15 text-ember"}`}>
                  Gemini {providers?.geminiConfigured ? "configured" : "missing"}
                </span>
                <span className={`rounded-full px-3 py-2 ${providers?.openRouterConfigured ? "bg-green-500/15 text-green-300" : "bg-ember/15 text-ember"}`}>
                  OpenRouter {providers?.openRouterConfigured ? "configured" : "missing"}
                </span>
              </div>
              <p className="mt-3 text-xs text-sand/60">
                Ordre de classification: {(providers?.classificationOrder || []).join(" -> ") || "unknown"}.
              </p>
              <p className="mt-1 text-xs text-sand/60">
                Si `workers` n'est pas `ready`, l'auto-réponse dépendra du fallback API ajouté côté backend.
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-4 rounded-2xl border border-sand/10 bg-ink p-4">
          <h3 className="text-sm font-semibold text-sand">Déclencheur réel</h3>
          <div className="mt-3 flex flex-col gap-3">
            <div className="rounded-xl border border-sand/10 bg-ink/60 p-3">
              <div className="flex flex-col gap-3">
                <input
                  value={debateId}
                  onChange={(event) => setDebateId(event.target.value)}
                  className="w-full rounded-xl border border-sand/20 bg-ink px-4 py-3 text-sand"
                  placeholder="debateId / contentId"
                />
                <div>
                  <Button
                    disabled={recentDebateCommentsMutation.isPending || !debateId.trim()}
                    onClick={() => recentDebateCommentsMutation.mutate()}
                  >
                    {recentDebateCommentsMutation.isPending ? "Loading..." : "Charger les derniers commentaires"}
                  </Button>
                </div>
                {recentDebateCommentsMutation.isError ? (
                  <p className="text-sm text-ember">{String(recentDebateCommentsMutation.error)}</p>
                ) : null}
                {recentDebateCommentsMutation.data?.data?.comments?.length ? (
                  <div className="flex flex-col gap-2">
                    {recentDebateCommentsMutation.data.data.comments.map((comment: {
                      id: string;
                      body: string;
                      author: string;
                      type: string;
                      moderationStatus: string;
                      eligible: boolean;
                      hasAIReply: boolean;
                      createdAt: string;
                    }) => (
                      <div
                        key={comment.id}
                        className="rounded-xl border border-sand/10 bg-ink px-3 py-3"
                      >
                        <div className="flex flex-wrap gap-2">
                          <Button
                            onClick={() => setCommentId(comment.id)}
                          >
                            Utiliser ce commentId
                          </Button>
                          <Button
                            disabled={!trimmedDebateId}
                            onClick={async () => {
                              if (!trimmedDebateId) return;
                              await navigator.clipboard.writeText(trimmedDebateId);
                            }}
                          >
                            Copier le debateId
                          </Button>
                          <Button
                            disabled={!trimmedDebateId}
                            onClick={() => {
                              if (!trimmedDebateId) return;
                              window.open(`/debate/${trimmedDebateId}#comment-${comment.id}`, "_blank", "noopener,noreferrer");
                            }}
                          >
                            Ouvrir le débat
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="text-gold">{comment.author}</span>
                          <span className="text-sand/55">{comment.type}</span>
                          <span className={comment.eligible ? "text-green-300" : "text-amber-300"}>
                            {comment.eligible ? "eligible" : "non-eligible"}
                          </span>
                          {comment.hasAIReply ? <span className="text-ember">ai-replied</span> : null}
                          <span className="text-sand/45">{new Date(comment.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="mt-2 text-xs text-sand/80">{comment.id}</div>
                        <div className="mt-1 line-clamp-3 text-sm text-sand">{comment.body}</div>
                      </div>
                    ))}
                  </div>
                ) : recentDebateCommentsMutation.data ? (
                  <p className="text-sm text-sand/65">Aucun commentaire trouvé pour ce débat.</p>
                ) : null}
              </div>
            </div>

            <input
              value={commentId}
              onChange={(event) => setCommentId(event.target.value)}
              className="w-full rounded-xl border border-sand/20 bg-ink px-4 py-3 text-sand"
              placeholder="commentId"
            />
            <div>
              <Button
                disabled={triggerAutoAIReplyMutation.isPending || !commentId.trim()}
                onClick={() => triggerAutoAIReplyMutation.mutate()}
              >
                {triggerAutoAIReplyMutation.isPending ? "Triggering..." : "Déclencher auto-réponse"}
              </Button>
            </div>
            {triggerAutoAIReplyMutation.isError ? (
              <p className="text-sm text-ember">{String(triggerAutoAIReplyMutation.error)}</p>
            ) : null}
            {triggerAutoAIReplyMutation.data ? (
              <pre className="overflow-auto rounded-xl bg-ink p-3 text-xs text-sand/80">
                {JSON.stringify(triggerAutoAIReplyMutation.data.data, null, 2)}
              </pre>
            ) : null}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-sand/10 bg-ink p-4">
          <h3 className="text-sm font-semibold text-sand">Simulateur de décision</h3>
          <div className="mt-3 flex flex-col gap-3">
            <textarea
              value={sampleText}
              onChange={(event) => setSampleText(event.target.value)}
              className="min-h-32 w-full rounded-xl border border-sand/20 bg-ink px-4 py-3 text-sand"
            />
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm text-sand/70">
                Recent comment count
                <input
                  type="number"
                  min={0}
                  value={recentCommentCount}
                  onChange={(event) => setRecentCommentCount(Number(event.target.value) || 0)}
                  className="mt-1 w-full rounded-xl border border-sand/20 bg-ink px-4 py-3 text-sand"
                />
              </label>
              <label className="text-sm text-sand/70">
                Last AI response minutes ago
                <input
                  type="number"
                  min={0}
                  value={lastAIResponseMinutesAgo}
                  onChange={(event) => setLastAIResponseMinutesAgo(Number(event.target.value) || 0)}
                  className="mt-1 w-full rounded-xl border border-sand/20 bg-ink px-4 py-3 text-sand"
                />
              </label>
            </div>
            <div>
              <Button
                disabled={autoAICheckMutation.isPending || !sampleText.trim()}
                onClick={() => autoAICheckMutation.mutate()}
              >
                {autoAICheckMutation.isPending ? "Checking..." : "Run auto AI check"}
              </Button>
            </div>
            {autoAICheckMutation.isError ? (
              <p className="text-sm text-ember">{String(autoAICheckMutation.error)}</p>
            ) : null}
            {autoAICheckMutation.data ? (
              <pre className="overflow-auto rounded-xl bg-ink p-3 text-xs text-sand/80">
                {JSON.stringify(autoAICheckMutation.data.data, null, 2)}
              </pre>
            ) : null}
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
