import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../hooks/useAuth";
import { LayoutProvider } from "../contexts/LayoutContext";
import { AudioPlayerProvider } from "../contexts/AudioPlayerContext";
import { VideoPlayerProvider } from "../contexts/VideoPlayerContext";
import { queryClient } from "../lib/queryClient";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AudioPlayerProvider>
          <VideoPlayerProvider>
            <LayoutProvider>{children}</LayoutProvider>
          </VideoPlayerProvider>
        </AudioPlayerProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
