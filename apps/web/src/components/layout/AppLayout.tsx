import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useLayout } from "../../contexts/LayoutContext";
import { useAudioPlayer } from "../../hooks/useAudio";
import { BottomNav } from "./BottomNav";
import { TopBar } from "./TopBar";
import { PageTransition } from "../motion/PageTransition";
import { ScrollToTop } from "./ScrollToTop";
import { EmailVerificationBanner } from "../../features/auth/EmailVerificationBanner";
import { MiniAudioPlayer } from "../../features/audio/MiniAudioPlayer";

export function AppLayout() {
  const location = useLocation();
  const { isAuthenticated, isEmailVerified, resendVerification } = useAuth();
  const { hideBottomNav } = useLayout();
  const { currentTrack, isPlaying, pause } = useAudioPlayer();
  const audioPlayerVisible = useMemo(() => (
    location.pathname === "/audio" ||
    location.pathname.startsWith("/community") ||
    location.pathname.startsWith("/profile")
  ), [location.pathname]);
  const shouldPausePersistentAudio = useMemo(() => (
    location.pathname === "/" ||
    location.pathname.startsWith("/enhanced-feed") ||
    location.pathname.startsWith("/explore") ||
    location.pathname.startsWith("/content/") ||
    location.pathname.startsWith("/debate/")
  ), [location.pathname]);

  useEffect(() => {
    if (currentTrack && isPlaying && shouldPausePersistentAudio) {
      pause();
    }
  }, [currentTrack, isPlaying, pause, shouldPausePersistentAudio]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(212,106,54,0.18),_transparent_38%),linear-gradient(180deg,_#201713_0%,_#16120f_48%,_#0f0c0a_100%)] text-sand">
      <ScrollToTop />

      {/* Email Verification Banner */}
      {isAuthenticated && (
        <EmailVerificationBanner
          isVerified={isEmailVerified}
          onVerificationSent={resendVerification}
        />
      )}

      {/* Header fixe en dehors de la structure flex */}
      <TopBar />
      
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row lg:gap-6 pt-16">
        {/* Single Layout - responsive via CSS */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1 lg:pb-0 lg:pr-6 relative">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </main>
        </div>
        
      </div>
      {/* BottomNav - mobile only, hidden on desktop, can be hidden per page */}
      {audioPlayerVisible && <MiniAudioPlayer />}
      {!hideBottomNav && (
        <div className="lg:hidden">
          <BottomNav />
        </div>
      )}
    </div>
  );
}
