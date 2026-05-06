declare const __MAATFEED_IS_PRODUCTION_DEPLOYMENT__: boolean;
declare const __MAATFEED_MAINTENANCE_MODE__: boolean;

export const isProductionDeployment = __MAATFEED_IS_PRODUCTION_DEPLOYMENT__;
export const isMaintenanceMode =
  isProductionDeployment && __MAATFEED_MAINTENANCE_MODE__;
