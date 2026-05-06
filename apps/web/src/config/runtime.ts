export const isProductionDeployment = import.meta.env.VITE_VERCEL_ENV === "production";

export const isMaintenanceMode =
  import.meta.env.VITE_MAINTENANCE_MODE === "true" && isProductionDeployment;
