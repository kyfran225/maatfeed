export function computeDiversityBoost(previousBuckets: string[], nextBucket: string): number {
  // Count recent occurrences of each bucket type
  const recentBuckets = previousBuckets.slice(-5); // Last 5 items
  const bucketCount = recentBuckets.filter(bucket => bucket === nextBucket).length;
  
  // Calculate diversity penalty based on concentration
  let diversityBoost = 0;
  
  if (bucketCount === 0) {
    // No recent occurrences - slight boost for variety
    diversityBoost = 15;
  } else if (bucketCount === 1) {
    // One occurrence - neutral
    diversityBoost = 5;
  } else if (bucketCount === 2) {
    // Two occurrences - slight penalty
    diversityBoost = -5;
  } else {
    // Three or more - strong penalty
    diversityBoost = -15 * (bucketCount - 1);
  }
  
  // Additional penalty for consecutive same buckets
  const consecutiveCount = getConsecutiveCount(previousBuckets, nextBucket);
  if (consecutiveCount >= 2) {
    diversityBoost -= 10 * consecutiveCount;
  }
  
  return diversityBoost;
}

function getConsecutiveCount(previousBuckets: string[], targetBucket: string): number {
  let count = 0;
  for (let i = previousBuckets.length - 1; i >= 0; i--) {
    if (previousBuckets[i] === targetBucket) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

export function calculateContentDiversityScore(buckets: string[]): number {
  if (buckets.length === 0) return 1;
  
  const uniqueBuckets = new Set(buckets);
  const diversityRatio = uniqueBuckets.size / buckets.length;
  
  // Perfect diversity (3/3) = 1.0, Poor diversity (1/3) = 0.33
  return diversityRatio;
}
