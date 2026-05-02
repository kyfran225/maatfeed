const DAY_MS = 24 * 60 * 60 * 1000;

export function getRecencyBoost(publishedAt: Date | string) {
  const published = new Date(publishedAt);
  const ageInDays = Math.max(0, (Date.now() - published.getTime()) / DAY_MS);
  return Math.max(0, 100 - ageInDays * 4);
}
