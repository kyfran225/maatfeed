export const isProductionDeployment = import.meta.env.VITE_VERCEL_ENV === "production";

// VITE_MAINTENANCE_MODE is the switch. The Vercel environment guard prevents
// preview/staging deployments from inheriting the production maintenance state.
export const isMaintenanceMode =
  import.meta.env.VITE_MAINTENANCE_MODE === "true" && isProductionDeployment;
