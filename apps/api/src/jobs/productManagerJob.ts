import { Job } from 'bullmq';
import { ProductManagerEngine } from '../ai/productManagerEngine.js';
import { logger } from '../config/logger.js';

export interface ProductManagerJobData {
  category?: 'engagement' | 'content' | 'discovery' | 'retention' | 'performance' | 'all';
}

export async function processProductManagerJob(job: Job<ProductManagerJobData>) {
  const { category = 'all' } = job.data;
  
  try {
    logger.info({ 
      jobId: job.id, 
      category 
    }, 'Starting product manager job');

    const productManagerEngine = new ProductManagerEngine();
    const recommendations = await productManagerEngine.generateProductRecommendations();

    // Filter recommendations by category if specified
    const filteredRecommendations = category === 'all' 
      ? recommendations 
      : recommendations.filter(r => r.category === category);

    logger.info({ 
      jobId: job.id,
      totalRecommendations: recommendations.length,
      filteredRecommendations: filteredRecommendations.length,
      category
    }, 'Product manager job completed');

    // Log high-priority recommendations
    const highPriorityRecs = filteredRecommendations.filter(r => 
      r.priority === 'critical' || r.priority === 'high'
    );

    if (highPriorityRecs.length > 0) {
      logger.warn({
        count: highPriorityRecs.length,
        recommendations: highPriorityRecs.map(r => ({
          title: r.title,
          priority: r.priority,
          category: r.category
        }))
      }, 'High priority product recommendations:');
    }

    return {
      recommendations: filteredRecommendations,
      summary: {
        total: filteredRecommendations.length,
        critical: filteredRecommendations.filter(r => r.priority === 'critical').length,
        high: filteredRecommendations.filter(r => r.priority === 'high').length,
        medium: filteredRecommendations.filter(r => r.priority === 'medium').length,
        low: filteredRecommendations.filter(r => r.priority === 'low').length
      }
    };
  } catch (error) {
    logger.error({ 
      jobId: job.id, 
      error: String(error) 
    }, 'Product manager job failed:');
    throw error;
  }
}
