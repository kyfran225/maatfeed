import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { SEO } from "../components/SEO";
import type { AudioTrack, Playlist } from "../services/audioService";
import { TrackList } from "../components/audio/TrackList";
import { PlaylistCard } from "../components/audio/PlaylistCard";
import { CreatePlaylistDialog } from "../components/audio/CreatePlaylistDialog";
import { useAuth } from "../hooks/useAuth";
import {
  useAudioPlayer,
  useAudioTracks,
  useAudioDiscovery,
  usePlaylists
} from "../hooks/useAudio";
import { SkeletonLoader } from "../components/motion/SkeletonLoader";
import { TouchFeedback } from "../components/motion/TouchFeedback";

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

function AudioSectionCard({
  track,
  isActive,
  isPlaying,
  onPlay,
  onPlayFromMoment
}: {
  track: AudioTrack;
  isActive: boolean;
  isPlaying: boolean;
  onPlay: (track: AudioTrack) => void;
  onPlayFromMoment: (track: AudioTrack, timeSeconds: number) => void;
}) {
  const contextHref = track.context?.primaryRoute || track.context?.primaryHref;

  return (
    <article className="group min-w-[18rem] max-w-[18rem] overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/25 shadow-xl shadow-black/30">
      <div className="relative h-44 overflow-hidden">
        {track.coverImageUrl ? (
          <img src={track.coverImageUrl} alt={track.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.34),_transparent_34%),linear-gradient(145deg,_rgba(16,12,10,1)_0%,_rgba(37,27,20,1)_45%,_rgba(12,11,10,1)_100%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-sand/70">
            <span className="rounded-full bg-white/10 px-2 py-1">{track.categoryLabel || track.genre}</span>
            <span>{formatDuration(track.duration)}</span>
          </div>
          <h3 className="line-clamp-2 text-lg font-semibold text-white">{track.shortTitle || track.title}</h3>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <p className="line-clamp-3 text-sm leading-6 text-sand/75">
          {track.simpleDescription || track.description || "Audio Kemet"}
        </p>

        {track.highlightMoments && track.highlightMoments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {track.highlightMoments.slice(0, 2).map((moment) => (
              <button
                key={`${track.id}-${moment.timeSeconds}`}
                type="button"
                onClick={() => onPlayFromMoment(track, moment.timeSeconds)}
                className="rounded-full bg-white/6 px-3 py-1.5 text-xs text-sand/80 transition-colors hover:bg-white/12 hover:text-white"
              >
                {moment.label} · {formatDuration(moment.timeSeconds)}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPlay(track)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive && isPlaying
                ? "bg-gold text-ink"
                : "bg-gold/20 text-gold hover:bg-gold/30"
            }`}
          >
            <span>{isActive && isPlaying ? "Pause / reprise" : "Lancer"}</span>
          </button>

          {contextHref && (
            track.context?.isExternal ? (
              <a
                href={track.context.primaryHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm text-sand/80 transition-colors hover:border-white/20 hover:text-white"
              >
                {track.context.primaryLabel || "Voir contexte"}
              </a>
            ) : (
              <Link
                to={contextHref}
                className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm text-sand/80 transition-colors hover:border-white/20 hover:text-white"
              >
                {track.context?.primaryLabel || "Voir contexte"}
              </Link>
            )
          )}
        </div>
      </div>
    </article>
  );
}

export default function AudioPage() {
  const { profile } = useAuth();
  const { currentTrack, isPlaying, playTrack, seekTo } = useAudioPlayer();
  const tracksQuery = useAudioTracks(80);
  const discoveryQuery = useAudioDiscovery(6);
  const playlistsQuery = usePlaylists();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchParams] = useSearchParams();
  const shareLinkHandledRef = useRef(false);

  const tracks = tracksQuery.data ?? [];
  const playlists = playlistsQuery.data ?? [];
  const discovery = discoveryQuery.data;
  const featuredTrack = discovery?.featuredTrack ?? null;
  const sections = discovery?.sections ?? [];
  const loading = tracksQuery.isLoading || discoveryQuery.isLoading || playlistsQuery.isLoading;
  const hasError = tracksQuery.isError || discoveryQuery.isError || playlistsQuery.isError;

  const allDiscoveryTracks = useMemo(() => {
    const uniqueTracks = new Map<string, AudioTrack>();
    sections.flatMap((section) => section.tracks).forEach((track) => {
      uniqueTracks.set(track.id, track);
    });
    return Array.from(uniqueTracks.values());
  }, [sections]);

  useEffect(() => {
    if (shareLinkHandledRef.current || tracks.length === 0) {
      return;
    }

    const trackId = searchParams.get("track");
    const timestamp = Number(searchParams.get("t") ?? 0);
    if (!trackId) {
      return;
    }

    const track = tracks.find((candidate) => candidate.id === trackId);
    if (!track) {
      return;
    }

    shareLinkHandledRef.current = true;
    void playTrack(track, tracks).then(() => {
      if (timestamp > 0) {
        window.setTimeout(() => seekTo(timestamp), 250);
      }
    });
  }, [playTrack, searchParams, seekTo, tracks]);

  const handlePlayTrack = (track: AudioTrack) => {
    const queue = allDiscoveryTracks.length > 0 ? allDiscoveryTracks : tracks;
    void playTrack(track, queue);
  };

  const handlePlayTrackFromMoment = (track: AudioTrack, timeSeconds: number) => {
    const queue = allDiscoveryTracks.length > 0 ? allDiscoveryTracks : tracks;
    void playTrack(track, queue).then(() => {
      window.setTimeout(() => seekTo(timeSeconds), 250);
    });
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    const playlistTracks = tracks.filter((track) => playlist.trackIds.includes(track.id));
    if (playlistTracks.length > 0) {
      void playTrack(playlistTracks[0], playlistTracks);
    }
  };

  if (loading) {
    return (
      <>
        <SEO pageKey="audio" />
        <section className="px-4 py-6 pb-24">
          <div className="mb-6 h-9 w-52 animate-pulse rounded bg-sand/15" />
          <SkeletonLoader type="card" count={4} />
        </section>
      </>
    );
  }

  if (hasError) {
    return (
      <>
        <SEO pageKey="audio" />
        <section className="px-4 py-6 pb-24">
          <div className="rounded-[1.4rem] border border-amber-500/20 bg-amber-500/10 p-5 text-sm leading-6 text-amber-100">
            Le flux audio n&apos;a pas pu se charger. Verifie les pistes, la discovery API et les sources audio.
          </div>
        </section>
      </>
    );
  }

  const userPlaylists = playlists.filter((playlist) => !playlist.isAutoGenerated);
  const featuredContextHref = featuredTrack?.context?.primaryRoute || featuredTrack?.context?.primaryHref;

  return (
    <>
      <SEO pageKey="audio" />
      <section className="px-4 py-6 pb-24">
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] border border-gold/15 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.24),_transparent_26%),linear-gradient(145deg,_rgba(23,17,13,1)_0%,_rgba(12,10,9,1)_50%,_rgba(22,17,14,1)_100%)] p-6 shadow-2xl shadow-black/40"
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,_rgba(255,255,255,0.04),_transparent_35%,_transparent_65%,_rgba(255,255,255,0.03))]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-[11px] uppercase tracking-[0.24em] text-gold/80">Flux audio intelligent</p>
            <h1 className="font-display text-3xl text-gold lg:text-5xl">Kemet Audio devient un pilier du produit</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-sand/78">
              Un flux pense pour l&apos;ecoute longue, la reprise au bon moment, la meditation, l&apos;apprentissage et le partage de passages precis.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm lg:min-w-[22rem]">
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
              <p className="text-sand/60">Pistes publiques</p>
              <p className="mt-2 text-2xl font-semibold text-white">{discovery?.sourceBlueprint.stats.curatedTrackCount ?? tracks.length}</p>
            </div>
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
              <p className="text-sand/60">Contexte lie</p>
              <p className="mt-2 text-2xl font-semibold text-white">{discovery?.sourceBlueprint.stats.contextLinkedCount ?? 0}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {featuredTrack && (
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-black/25 shadow-2xl shadow-black/35"
        >
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.85fr]">
            <div className="relative min-h-[20rem] overflow-hidden">
              {featuredTrack.coverImageUrl ? (
                <img src={featuredTrack.coverImageUrl} alt={featuredTrack.title} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.28),_transparent_28%),linear-gradient(150deg,_rgba(35,24,17,1)_0%,_rgba(16,11,9,1)_56%,_rgba(9,8,7,1)_100%)]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
              <div className="relative flex h-full flex-col justify-end p-6">
                <span className="mb-3 inline-flex w-fit rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-sand/80">
                  {featuredTrack.categoryLabel || featuredTrack.genre}
                </span>
                <h2 className="max-w-xl text-3xl font-semibold text-white">{featuredTrack.shortTitle || featuredTrack.title}</h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-sand/78">
                  {featuredTrack.simpleDescription || featuredTrack.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handlePlayTrack(featuredTrack)}
                    className="rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold/90"
                  >
                    {currentTrack?.id === featuredTrack.id && isPlaying ? "Ecoute en cours" : "Lancer la piste"}
                  </button>
                  {featuredContextHref && (
                    featuredTrack.context?.isExternal ? (
                      <a
                        href={featuredTrack.context.primaryHref}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-white/15 px-5 py-3 text-sm text-white transition-colors hover:border-white/30"
                      >
                        {featuredTrack.context.primaryLabel || "Voir contexte"}
                      </a>
                    ) : (
                      <Link
                        to={featuredContextHref}
                        className="rounded-full border border-white/15 px-5 py-3 text-sm text-white transition-colors hover:border-white/30"
                      >
                        {featuredTrack.context?.primaryLabel || "Voir contexte"}
                      </Link>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-sand/55">Moments forts</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {featuredTrack.highlightMoments?.map((moment) => (
                    <button
                      key={`${featuredTrack.id}-${moment.timeSeconds}`}
                      type="button"
                      onClick={() => handlePlayTrackFromMoment(featuredTrack, moment.timeSeconds)}
                      className="rounded-full bg-white/6 px-3 py-2 text-sm text-sand/85 transition-colors hover:bg-white/12 hover:text-white"
                    >
                      {moment.label} · {formatDuration(moment.timeSeconds)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-sand/55">Radar de sources</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {discovery?.sourceBlueprint.keywords.slice(0, 8).map((keyword) => (
                    <span key={keyword} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-sand/75">
                      {keyword}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-sand/45">
                  {discovery?.sourceBlueprint.stats.configuredFeedCount ?? 0} flux RSS actifs · {discovery?.sourceBlueprint.stats.configuredDirectCount ?? 0} manifeste direct
                </p>
              </div>

              <div className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-sand/65">Lecture persistante</p>
                <p className="mt-2 text-base text-white">
                  {currentTrack ? `En cours : ${currentTrack.shortTitle || currentTrack.title}` : "Aucune piste en cours pour l'instant"}
                </p>
                <p className="mt-2 text-sm leading-6 text-sand/72">
                  Lance une piste ici puis continue sur le feed: le mini-player reste vivant pendant le scroll.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="mt-10 space-y-10">
        {sections.map((section, index) => (
          <motion.section
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + index * 0.04 }}
          >
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-gold">{section.title}</h2>
                <p className="mt-1 text-sm text-sand/68">{section.subtitle}</p>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2">
              {section.tracks.map((track) => (
                <AudioSectionCard
                  key={`${section.id}-${track.id}`}
                  track={track}
                  isActive={currentTrack?.id === track.id}
                  isPlaying={isPlaying}
                  onPlay={handlePlayTrack}
                  onPlayFromMoment={handlePlayTrackFromMoment}
                />
              ))}
            </div>
          </motion.section>
        ))}
      </div>

      {profile && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-10"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gold">Tes playlists</h2>
              <p className="mt-1 text-sm text-sand/68">Organise tes pistes en mode apprentissage, rituel ou debat.</p>
            </div>
            <TouchFeedback hapticType="light" minTouchSize>
              <button
                onClick={() => setShowCreateDialog(true)}
                className="rounded-full bg-gold/20 px-4 py-2 text-sm text-gold transition-colors hover:bg-gold/30"
              >
                Creer playlist
              </button>
            </TouchFeedback>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {userPlaylists.map((playlist) => (
              <TouchFeedback key={playlist.id} hapticType="medium" minTouchSize>
                <PlaylistCard playlist={playlist} onPlay={() => handlePlayPlaylist(playlist)} />
              </TouchFeedback>
            ))}
            {userPlaylists.length === 0 && (
              <div className="rounded-[1.2rem] border border-white/10 bg-black/20 p-4 text-sm leading-6 text-sand/72">
                Aucune playlist personnelle pour l&apos;instant. Cree une premiere compilation pour memoriser tes meilleures pistes.
              </div>
            )}
          </div>
        </motion.section>
      )}

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-10"
      >
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-gold">Catalogue complet</h2>
          <p className="mt-1 text-sm text-sand/68">Toutes les pistes actuellement chargees dans le module audio.</p>
        </div>
        <TrackList tracks={tracks} />
      </motion.section>

      {profile && (
        <CreatePlaylistDialog
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          availableTrackIds={tracks.map((track) => track.id)}
        />
      )}
    </section>
    </>
  );
}
