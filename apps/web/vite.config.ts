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
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id: string | undefined) {
          if (!id) return;

          const packageName = getNodeModulePackageName(id);

          // Core framework chunks. Keep react-router before react because its
          // package path also starts with node_modules/react.
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

          // Feature pages - only split page components themselves
          // This avoids circular deps from shared hooks/services
          if (id.includes("/pages/AudioPage.tsx")) {
            return "audio-page";
          }
          if (id.includes("/pages/AdminOpsPage.tsx") ||
              id.includes("/pages/AdminIngestionPage.tsx")) {
            return "admin-pages";
          }
        }
      }
    }
  }
}));
