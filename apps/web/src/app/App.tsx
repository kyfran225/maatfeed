import { RouterProvider } from "react-router-dom";
import { AppProviders } from "./providers";
import { router } from "./router";
import { AccessibilityWrapper } from "../components/motion/AccessibilityWrapper";
import { useEffect } from "react";
import YouTubeAPIManager from "../utils/youtubeAPIManager";
import CookieBanner from "../components/legal/CookieBanner";

export default function App() {
  // Précharger l'API YouTube dès le démarrage de l'application
  useEffect(() => {
    // Charger l'API YouTube en arrière-plan dès le démarrage
    YouTubeAPIManager.getInstance().loadAPI();

    // Précharger également les ressources critiques
    const preloadLinks = [
      { rel: "preconnect", href: "https://www.youtube.com" },
      { rel: "preconnect", href: "https://i.ytimg.com" },
      { rel: "dns-prefetch", href: "https://www.youtube.com" },
    ];

    preloadLinks.forEach(({ rel, href }) => {
      const link = document.createElement("link");
      link.rel = rel;
      link.href = href;
      document.head.appendChild(link);
    });
  }, []);

  return (
    <AppProviders>
      <AccessibilityWrapper>
        <RouterProvider router={router} />
        <CookieBanner />
      </AccessibilityWrapper>
    </AppProviders>
  );
}
