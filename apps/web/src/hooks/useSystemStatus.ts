import { useQuery } from "@tanstack/react-query";
import { getHealth, getReadiness } from "../services/healthService";

export function useSystemStatus() {
  const healthQuery = useQuery({
    queryKey: ["system", "health"],
    queryFn: getHealth,
    retry: false
  });

  const readinessQuery = useQuery({
    queryKey: ["system", "readiness"],
    queryFn: getReadiness,
    retry: false
  });

  return {
    healthQuery,
    readinessQuery
  };
}
