import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function getNodeModulePackageName(id: string) {
  const normalizedId = id.replaceAll("\\", "/");
  const match = normalizedId.match(/\/node_modules\/((?:@[^/]+\/)?[^/]+)/);
  return match?.[1];
}

export default defineConfig(({ command }) => ({
  plugins: [react()],
  envDir: rootDir,
  define: {
    "process.env.NODE_ENV": JSON.stringify(command === "build" ? "production" : "development"),
    "import.meta.env.VITE_VERCEL_ENV": JSON.stringify(process.env.VERCEL_ENV ?? ""),
    "import.meta.env.VITE_VERCEL_GIT_COMMIT_REF": JSON.stringify(process.env.VERCEL_GIT_COMMIT_REF ?? "")
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    fs: {
      allow: ["..", "../.."]
    },
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true
      },
      "/ws": {
        target: "ws://localhost:4000",
        ws: true
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 400, // Réduit de 500 à 400
    rollupOptions: {
      output: {
        manualChunks(id: string | undefined) {
          if (!id) return;

          const packageName = getNodeModulePackageName(id);

          // Core framework chunks - Optimisés
          if (packageName === "react-router" || packageName === "react-router-dom") {
            return "router";
          }
          if (packageName === "react" ||
              packageName === "react-dom" ||
              packageName === "scheduler") {
            return "react";
          }
          if (packageName?.startsWith("@tanstack/")) {
            return "query";
          }
          if (packageName === "lucide-react") {
            return "icons";
          }
          if (packageName === "framer-motion") {
            return "motion";
          }
          if (packageName === "axios") {
            return "http";
          }
          if (packageName === "socket.io" || packageName === "socket.io-client") {
            return "socket";
          }
          if (packageName === "react-player") {
            return "player";
          }
          if (packageName === "react-hook-form" || packageName === "@hookform/resolvers") {
            return "forms";
          }
          if (packageName === "zod") {
            return "validation";
          }
          if (packageName === "zustand") {
            return "state";
          }

          // Heavy pages - Split optimisé
          if (id.includes("/pages/DesktopPage.tsx")) {
            return "desktop-page";
          }
          if (id.includes("/pages/AnalyticsDashboard.tsx") ||
              id.includes("/pages/CreatorAnalytics.tsx")) {
            return "analytics-pages";
          }
          if (id.includes("/pages/CommunityPage.tsx") ||
              id.includes("/pages/ListenPage.tsx")) {
            return "community-pages";
          }
          if (id.includes("/pages/ContentDetailPage.tsx")) {
            return "content-detail-page";
          }
          if (id.includes("/pages/UploadPage.tsx")) {
            return "upload-page";
          }
          if (id.includes("/pages/AdminOpsPage.tsx") ||
              id.includes("/pages/AdminIngestionPage.tsx") ||
              id.includes("/pages/AdminSponsorsPage.tsx")) {
            return "admin-pages";
          }
          if (id.includes("/features/series/SeriesDetailPage.tsx")) {
            return "series-detail-page";
          }
          if (id.includes("/features/audio/AudioPage.tsx")) {
            return "audio-page";
          }
          if (id.includes("/features/listen/ListenPage.tsx")) {
            return "listen-page";
          }
          if (id.includes("/features/profile/ProfilePage.tsx")) {
            return "profile-page";
          }
          if (id.includes("/features/upload/UploadPage.tsx")) {
            return "upload-feature-page";
          }

          // Feature components
          if (id.includes("/components/desktop/")) {
            return "desktop-components";
          }
          if (id.includes("/components/analytics/")) {
            return "analytics-components";
          }
          if (id.includes("/components/community/")) {
            return "community-components";
          }
          if (id.includes("/components/media/")) {
            return "media-components";
          }
        }
      }
    },
    // Optimisations supplémentaires
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: command === "build",
        drop_debugger: command === "build"
      }
    },
    sourcemap: command === "development"
  },
  // Optimisation des dépendances
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "framer-motion",
      "lucide-react",
      "zustand",
      "@tanstack/react-query",
      "react-hook-form",
      "zod"
    ]
  }
}));
