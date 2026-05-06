import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    __MAATFEED_MAINTENANCE__: JSON.stringify(process.env.VERCEL_ENV === "production")
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

          // Vendor libraries - always split
          if (id.includes("node_modules/react") ||
              id.includes("node_modules/react-dom") ||
              id.includes("node_modules/react-router")) {
            return "vendor";
          }
          if (id.includes("node_modules/@tanstack")) {
            return "query";
          }
          if (id.includes("node_modules/lucide-react")) {
            return "icons";
          }
          if (id.includes("node_modules/framer-motion")) {
            return "motion";
          }
          if (id.includes("node_modules/axios")) {
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
});
