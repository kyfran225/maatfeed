import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../hooks/useAuth";
import { LayoutProvider } from "../contexts/LayoutContext";
import { AudioPlayerProvider } from "../contexts/AudioPlayerContext";
import { VideoPlayerProvider } from "../contexts/VideoPlayerContext";
import { ToastProvider, useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/Toast";
import { queryClient } from "../lib/queryClient";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AudioPlayerProvider>
          <VideoPlayerProvider>
            <LayoutProvider>
              <ToastProvider>
                <AppProvidersInner>{children}</AppProvidersInner>
              </ToastProvider>
            </LayoutProvider>
          </VideoPlayerProvider>
        </AudioPlayerProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppProvidersInner({ children }: PropsWithChildren) {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}
