import { Job } from 'bullmq';
import { SelfHealingService } from '../services/selfHealingService.js';
import { logger } from '../config/logger.js';

export interface SelfHealingAuditJobData {
  force?: boolean;
}

export async function processSelfHealingAuditJob(job: Job<SelfHealingAuditJobData>) {
  const { force } = job.data;
  
  try {
    logger.info({ 
      jobId: job.id, 
      force 
    }, 'Starting self-healing audit job');

    const selfHealingService = new SelfHealingService();
    const report = await selfHealingService.analyzeSystemFailures();

    logger.info({ 
      jobId: job.id,
      overallHealth: report.overallHealth,
      issuesCount: report.issues.length,
      autoRecovered: report.autoRecoveredIssues,
      manualRequired: report.manualInterventionRequired
    }, 'Self-healing audit job completed');

    // If manual intervention is required, this could trigger alerts
    if (report.manualInterventionRequired > 0) {
      logger.warn({
        issuesRequiringManualIntervention: report.manualInterventionRequired,
        criticalIssues: report.issues.filter(i => i.severity === 'critical').length
      }, 'Manual intervention required for system recovery');
    }

    return report;
  } catch (error) {
    logger.error({ 
      jobId: job.id, 
      error: String(error) 
    }, 'Self-healing audit job failed:');
    throw error;
  }
}
