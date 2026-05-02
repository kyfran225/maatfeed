import { Job, JobsOptions } from 'bullmq';
import { TrendService } from '../services/trendService.js';
import { logger } from '../config/logger.js';

export interface UpdateTrendSignalsJobData {
  batch?: boolean;
  contentIds?: string[];
}

export async function processUpdateTrendSignalsJob(job: Job<UpdateTrendSignalsJobData>) {
  const { batch, contentIds } = job.data;
  
  try {
    logger.info({ 
      jobId: job.id, 
      batch, 
      contentCount: contentIds?.length 
    }, 'Starting trend signals update job');

    const trendService = new TrendService();
    
    let result;
    if (contentIds && contentIds.length > 0) {
      // Process specific content items
      let updated = 0;
      let created = 0;
      
      for (const contentId of contentIds) {
        try {
          const trendResult = await trendService.analyzeContentTrend(contentId);
          if (trendResult) {
            if (trendResult.isNew) {
              created++;
            } else {
              updated++;
            }
          }
        } catch (error) {
          logger.error({ 
            contentId, 
            error: String(error) 
          }, 'Error processing trend signal for content:');
        }
      }
      
      result = { updated, created, deactivated: 0 };
    } else {
      // Full refresh of all trends
      result = await trendService.refreshTrendSignals();
    }

    logger.info({ 
      jobId: job.id,
      result 
    }, 'Trend signals update job completed');

    return result;
  } catch (error) {
    logger.error({ 
      jobId: job.id, 
      error: String(error) 
    }, 'Trend signals update job failed:');
    throw error;
  }
}

export const updateTrendSignalsJobOptions: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
  removeOnComplete: 100,
  removeOnFail: 50,
};
