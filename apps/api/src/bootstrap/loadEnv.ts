import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function loadEnv(): void {
  const bootstrapDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRootEnvPath = path.resolve(bootstrapDir, "../../../../.env");

  const loaded = dotenv.config({ path: repoRootEnvPath });

  if (loaded.error) {
    dotenv.config();
  }
}
