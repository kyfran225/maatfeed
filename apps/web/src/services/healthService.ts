import { getJson } from "./httpClient";

export type HealthResponse = {
  status: string;
  timestamp: string;
  services: {
    mongo: {
      readyState: number;
      host: string | null;
      name: string | null;
    };
    redis: {
      status: string;
    };
  };
};

export type ReadinessResponse = {
  status: "ready" | "degraded";
  timestamp: string;
  checks: Record<string, string>;
};

export function getHealth() {
  return getJson<HealthResponse>("/api/health");
}

export function getReadiness() {
  return getJson<ReadinessResponse>("/api/readiness");
}
