import { getJson } from "./httpClient";

export async function triggerIngestion(input: { keyword: string; limitPerProvider?: number }) {
  return getJson<{ status: string; jobId: string | number | null; keyword: string }>("/api/admin/ingest", {
    method: "POST",
    body: JSON.stringify(input)
  });
}
