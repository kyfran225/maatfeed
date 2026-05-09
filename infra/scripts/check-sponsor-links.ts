import mongoose from "mongoose";
import { env } from "../../apps/api/src/config/env.js";
import { Sponsor } from "../../apps/api/src/models/Sponsor.js";

type CheckResult = {
  name: string;
  url: string;
  ok: boolean;
  status?: number;
  finalUrl?: string;
  error?: string;
};

async function checkUrl(name: string, url: string): Promise<CheckResult> {
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
      headers: {
        "user-agent": "MAATFEED sponsor-link-check/1.0"
      }
    });

    return {
      name,
      url,
      ok: response.status >= 200 && response.status < 400,
      status: response.status,
      finalUrl: response.url
    };
  } catch (error) {
    return {
      name,
      url,
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function main() {
  await mongoose.connect(env.MONGODB_URI);

  const sponsors = await Sponsor.find(
    { isActive: true, website: { $exists: true, $ne: "" } },
    { name: 1, website: 1 }
  ).sort({ priority: -1 });

  const results = await Promise.all(
    sponsors.map(sponsor => checkUrl(sponsor.name, sponsor.website ?? ""))
  );

  for (const result of results) {
    if (result.ok) {
      console.log(`OK ${result.status} ${result.name} -> ${result.finalUrl ?? result.url}`);
    } else {
      console.error(`FAIL ${result.name} -> ${result.url} (${result.status ?? result.error})`);
    }
  }

  await mongoose.disconnect();

  const failed = results.filter(result => !result.ok);
  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch(async error => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch {
    // Ignore disconnect errors during failure handling.
  }
  process.exit(1);
});
