export function computeEngagementScore(input: {
  likes: number;
  comments: number;
  views: number;
  shares: number;
  saves: number;
}) {
  return input.likes * 2 + input.comments * 4 + input.views * 0.05 + input.shares * 3 + input.saves * 2;
}
