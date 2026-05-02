import { DEFAULT_GLOBAL_SCORE_WEIGHTS } from "../constants/ranking.js";

export type GlobalScoreInput = {
  likes: number;
  comments: number;
  views: number;
  debateScore: number;
  recencyBoost: number;
};

export type PersonalizedScoreInput = {
  engagementScore: number;
  userInterestMatch: number;
  diversityBoost: number;
  recencyBoost: number;
};

export function computeGlobalScore(input: GlobalScoreInput): number {
  return (
    input.likes * DEFAULT_GLOBAL_SCORE_WEIGHTS.likes +
    input.comments * DEFAULT_GLOBAL_SCORE_WEIGHTS.comments +
    input.views * DEFAULT_GLOBAL_SCORE_WEIGHTS.views +
    input.debateScore * DEFAULT_GLOBAL_SCORE_WEIGHTS.debateScore +
    input.recencyBoost
  );
}

export function computePersonalizedScore(input: PersonalizedScoreInput): number {
  return (
    input.engagementScore +
    input.userInterestMatch * 10 +
    input.diversityBoost +
    input.recencyBoost
  );
}
