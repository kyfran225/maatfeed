/**
 * Rate limiter for LLM API calls
 * Prevents rate limiting by throttling requests to stay within Groq limits
 */

interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxTokensPerMinute: number;
  minDelayMs: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequestsPerMinute: 50,
  maxTokensPerMinute: 5000,
  minDelayMs: 1200
};

class LlmRateLimiter {
  private requestTimestamps: number[] = [];
  private tokenTimestamps: Array<{ time: number; tokens: number }> = [];
  private pendingPromise: Promise<void> = Promise.resolve();
  private config: RateLimitConfig;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Acquire permission to make an API call, waiting if necessary
   * @param estimatedTokens Estimated number of tokens for this request
   */
  async acquire(estimatedTokens: number = 500): Promise<void> {
    this.pendingPromise = this.pendingPromise.then(() =>
      this._acquireInternal(estimatedTokens)
    );
    return this.pendingPromise;
  }

  private async _acquireInternal(estimatedTokens: number): Promise<void> {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Clean old timestamps
    this.requestTimestamps = this.requestTimestamps.filter(t => t > oneMinuteAgo);
    this.tokenTimestamps = this.tokenTimestamps.filter(t => t.time > oneMinuteAgo);

    // Check request limit
    const requestsInLastMinute = this.requestTimestamps.length;
    if (requestsInLastMinute >= this.config.maxRequestsPerMinute) {
      const oldestRequest = Math.min(...this.requestTimestamps);
      const waitTime = oldestRequest + 60000 - now + 100;
      if (waitTime > 0) {
        await this.delay(waitTime);
        return this._acquireInternal(estimatedTokens);
      }
    }

    // Check token limit
    const tokensInLastMinute = this.tokenTimestamps.reduce((sum, t) => sum + t.tokens, 0);
    if (tokensInLastMinute + estimatedTokens > this.config.maxTokensPerMinute) {
      // Wait until we have enough token budget
      const excessTokens = tokensInLastMinute + estimatedTokens - this.config.maxTokensPerMinute;
      // Rough estimate: 100 tokens/sec processing rate
      const waitTime = Math.ceil(excessTokens / 100) * 1000 + 500;
      await this.delay(waitTime);
      return this._acquireInternal(estimatedTokens);
    }

    // Ensure minimum delay between requests
    if (this.requestTimestamps.length > 0) {
      const lastRequest = Math.max(...this.requestTimestamps);
      const timeSinceLastRequest = now - lastRequest;
      if (timeSinceLastRequest < this.config.minDelayMs) {
        await this.delay(this.config.minDelayMs - timeSinceLastRequest);
      }
    }

    // Record this request
    this.requestTimestamps.push(Date.now());
    this.tokenTimestamps.push({ time: Date.now(), tokens: estimatedTokens });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current rate limit status
   */
  getStatus() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    return {
      requestsInLastMinute: this.requestTimestamps.filter(t => t > oneMinuteAgo).length,
      tokensInLastMinute: this.tokenTimestamps
        .filter(t => t.time > oneMinuteAgo)
        .reduce((sum, t) => sum + t.tokens, 0),
      maxRequestsPerMinute: this.config.maxRequestsPerMinute,
      maxTokensPerMinute: this.config.maxTokensPerMinute
    };
  }
}

// Global rate limiter instance
export const llmRateLimiter = new LlmRateLimiter({
  maxRequestsPerMinute: 12, // Keep combined Groq traffic under free-tier request pressure
  maxTokensPerMinute: 4200, // Leave headroom under the 6000 TPM ceiling for burst variance
  minDelayMs: 1800          // Avoid back-to-back bursts across concurrent workers
});

export { LlmRateLimiter };
