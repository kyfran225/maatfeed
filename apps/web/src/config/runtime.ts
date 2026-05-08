const PRODUCTION_BRANCHES = new Set(["main", "master", "production"]);
const PRODUCTION_HOSTS = new Set(["maatfeed.com", "www.maatfeed.com"]);

const deploymentEnvironment = import.meta.env.VITE_VERCEL_ENV;
const deploymentBranch = import.meta.env.VITE_VERCEL_GIT_COMMIT_REF;
const explicitAppEnvironment = import.meta.env.VITE_APP_ENV;
const runtimeHostname = typeof window === "undefined" ? "" : window.location.hostname;

export const isProductionDeployment =
  explicitAppEnvironment === "production" ||
  PRODUCTION_HOSTS.has(runtimeHostname) ||
  (deploymentEnvironment === "production" && PRODUCTION_BRANCHES.has(deploymentBranch));

// VITE_MAINTENANCE_MODE is the switch. The Vercel environment guard prevents
// preview/staging deployments from inheriting the production maintenance state.
export const isMaintenanceMode =
  import.meta.env.VITE_MAINTENANCE_MODE === "true" && isProductionDeployment;
