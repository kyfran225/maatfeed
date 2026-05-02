import { useMutation } from "@tanstack/react-query";
import { triggerIngestion } from "../services/adminService";

export function useAdminOps() {
  const ingestMutation = useMutation({
    mutationFn: triggerIngestion
  });

  return {
    ingestMutation
  };
}
