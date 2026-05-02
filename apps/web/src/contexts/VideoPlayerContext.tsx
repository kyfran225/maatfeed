import { createContext, useContext, useState, ReactNode } from "react";

interface VideoPlayerContextType {
  isAnyVideoPlaying: boolean;
  setIsAnyVideoPlaying: (playing: boolean) => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextType | undefined>(undefined);

export function VideoPlayerProvider({ children }: { children: ReactNode }) {
  const [isAnyVideoPlaying, setIsAnyVideoPlaying] = useState(false);

  return (
    <VideoPlayerContext.Provider value={{ isAnyVideoPlaying, setIsAnyVideoPlaying }}>
      {children}
    </VideoPlayerContext.Provider>
  );
}

export function useVideoPlayer() {
  const context = useContext(VideoPlayerContext);
  if (context === undefined) {
    throw new Error("useVideoPlayer must be used within a VideoPlayerProvider");
  }
  return context;
}
