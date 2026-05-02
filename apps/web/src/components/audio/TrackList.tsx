import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { AudioTrack } from "../../services/audioService";
import { useAudioPlayer } from "../../hooks/useAudio";

interface TrackListProps {
  tracks: AudioTrack[];
  isLoading?: boolean;
}

export function TrackList({ tracks, isLoading = false }: TrackListProps) {
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();

  const handleTrackClick = (track: AudioTrack) => {
    void playTrack(track, tracks);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getGenreColor = (genre: string) => {
    switch (genre) {
      case 'kemet': return 'bg-purple-500/20 text-purple-400';
      case 'spiritual': return 'bg-blue-500/20 text-blue-400';
      case 'educational': return 'bg-green-500/20 text-green-400';
      case 'debate': return 'bg-orange-500/20 text-orange-400';
      case 'ambient': return 'bg-indigo-500/20 text-indigo-400';
      default: return 'bg-white/10 text-white/70';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-sand/70">Loading tracks...</p>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sand/70">No audio tracks available</p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {tracks.map((track, index) => (
        <motion.div
          key={track.id}
          className={`bg-black/30 rounded-[1rem] border border-white/10 p-4 cursor-pointer transition-all hover:border-gold/30 ${
            currentTrack?.id === track.id ? 'border-gold/50 bg-gold/5' : ''
          }`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          onClick={() => handleTrackClick(track)}
        >
          <div className="flex items-center gap-3">
            {/* Play/Pause Indicator */}
            <div className="w-10 h-10 bg-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
              {currentTrack?.id === track.id && isPlaying ? (
                <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/>
                </svg>
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium text-sm truncate">{track.title}</h4>
              <p className="text-sand/70 text-xs truncate">{track.artist}</p>
              {track.description && (
                <p className="text-sand/50 text-xs truncate mt-1">{track.description}</p>
              )}
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`px-2 py-1 text-xs rounded-full ${getGenreColor(track.genre)}`}>
                {track.genre}
              </span>
              <span className="text-sand/50 text-xs">
                {formatDuration(track.duration)}
              </span>
            </div>
          </div>

          {/* Tags */}
          {track.tags.length > 0 && (
            <div className="mt-2 flex gap-1 flex-wrap">
              {(track.enrichedTags || track.tags).slice(0, 3).map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="px-2 py-0.5 bg-white/5 text-sand/60 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
              {track.tags.length > 3 && (
                <span className="px-2 py-0.5 bg-white/5 text-sand/60 text-xs rounded">
                  +{track.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {(track.context?.primaryRoute || track.context?.primaryHref) && (
            <div className="mt-3">
              {track.context?.isExternal ? (
                <a
                  href={track.context.primaryHref}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="inline-flex items-center rounded-full border border-white/10 px-3 py-1.5 text-xs text-sand/80 transition-colors hover:border-white/20 hover:text-white"
                >
                  {track.context.primaryLabel || "Voir contexte"}
                </a>
              ) : (
                <Link
                  to={track.context?.primaryRoute || track.context?.primaryHref || "#"}
                  onClick={(event) => event.stopPropagation()}
                  className="inline-flex items-center rounded-full border border-white/10 px-3 py-1.5 text-xs text-sand/80 transition-colors hover:border-white/20 hover:text-white"
                >
                  {track.context?.primaryLabel || "Voir contexte"}
                </Link>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
