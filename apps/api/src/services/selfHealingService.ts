import { JobFailure } from '../models/JobFailure.js';
import { logger } from '../config/logger.js';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'critical';
  lastCheck: Date;
  details?: any;
}

interface RecoveryAction {
  type: 'restart-service' | 'clear-cache' | 'requeue-job' | 'manual-intervention' | 'ignore';
  description: string;
  automated: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface HealingReport {
  timestamp: Date;
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affectedComponents: string[];
    recommendedActions: RecoveryAction[];
    autoRecoveryPossible: boolean;
  }>;
  overallHealth: 'healthy' | 'degraded' | 'critical';
  autoRecoveredIssues: number;
  manualInterventionRequired: number;
}

export class SelfHealingService {
  private healthChecks: Map<string, HealthCheck> = new Map();

  /**
   * Analyze system failures and generate healing recommendations
   */
  async analyzeSystemFailures(): Promise<HealingReport> {
    try {
      const recentFailures = await this.getRecentFailures();
      const healthStatus = await this.performHealthChecks();
      
      const issues = this.identifyIssues(recentFailures, healthStatus);
      const overallHealth = this.calculateOverallHealth(issues);
      
      const autoRecoveredIssues = await this.attemptAutoRecovery(issues);
      const manualInterventionRequired = issues.length - autoRecoveredIssues;

      const report: HealingReport = {
        timestamp: new Date(),
        issues,
        overallHealth,
        autoRecoveredIssues,
        manualInterventionRequired
      };

      await this.storeHealingReport(report);
      
      return report;
    } catch (error) {
      logger.error({ error }, 'Error in analyzeSystemFailures:');
      throw error;
    }
  }

  /**
   * Get recent job failures
   */
  private async getRecentFailures(): Promise<any[]> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    return JobFailure.find({
      failedAt: { $gte: twentyFourHoursAgo },
      'resolution.type': { $exists: false }
    }).sort({ failedAt: -1 });
  }

  /**
   * Perform system health checks
   */
  private async performHealthChecks(): Promise<Map<string, HealthCheck>> {
    const checks = new Map<string, HealthCheck>();

    // Check MongoDB connection
    try {
      const mongoCheck = await this.checkMongoHealth();
      checks.set('mongodb', mongoCheck);
    } catch (error) {
      checks.set('mongodb', {
        name: 'mongodb',
        status: 'critical',
        lastCheck: new Date(),
        details: { error: String(error) }
      });
    }

    // Check Redis connection
    try {
      const redisCheck = await this.checkRedisHealth();
      checks.set('redis', redisCheck);
    } catch (error) {
      checks.set('redis', {
        name: 'redis',
        status: 'critical',
        lastCheck: new Date(),
        details: { error: String(error) }
      });
    }

    // Check BullMQ queues
    try {
      const queueCheck = await this.checkQueueHealth();
      checks.set('queues', queueCheck);
    } catch (error) {
      checks.set('queues', {
        name: 'queues',
        status: 'critical',
        lastCheck: new Date(),
        details: { error: String(error) }
      });
    }

    // Check API responsiveness
    try {
      const apiCheck = await this.checkApiHealth();
      checks.set('api', apiCheck);
    } catch (error) {
      checks.set('api', {
        name: 'api',
        status: 'critical',
        lastCheck: new Date(),
        details: { error: String(error) }
      });
    }

    return checks;
  }

  /**
   * Check MongoDB health
   */
  private async checkMongoHealth(): Promise<HealthCheck> {
    // This would be implemented with actual MongoDB health check
    // For now, return a placeholder
    return {
      name: 'mongodb',
      status: 'healthy',
      lastCheck: new Date(),
      details: { connected: true }
    };
  }

  /**
   * Check Redis health
   */
  private async checkRedisHealth(): Promise<HealthCheck> {
    // This would be implemented with actual Redis health check
    // For now, return a placeholder
    return {
      name: 'redis',
      status: 'healthy',
      lastCheck: new Date(),
      details: { connected: true }
    };
  }

  /**
   * Check BullMQ queue health
   */
  private async checkQueueHealth(): Promise<HealthCheck> {
    // This would be implemented with actual queue health check
    // For now, return a placeholder
    return {
      name: 'queues',
      status: 'healthy',
      lastCheck: new Date(),
      details: { activeWorkers: 3, stalledJobs: 0 }
    };
  }

  /**
   * Check API health
   */
  private async checkApiHealth(): Promise<HealthCheck> {
    // This would be implemented with actual API health check
    // For now, return a placeholder
    return {
      name: 'api',
      status: 'healthy',
      lastCheck: new Date(),
      details: { responseTime: 45 }
    };
  }

  /**
   * Identify issues from failures and health checks
   */
  private identifyIssues(failures: any[], healthChecks: Map<string, HealthCheck>): any[] {
    const issues = [];

    // Analyze job failures
    const failurePatterns = this.analyzeFailurePatterns(failures);
    for (const pattern of failurePatterns) {
      issues.push({
        type: 'job-failure-pattern',
        severity: pattern.severity,
        description: pattern.description,
        affectedComponents: pattern.components,
        recommendedActions: pattern.recommendedActions,
        autoRecoveryPossible: pattern.autoRecoveryPossible
      });
    }

    // Analyze health check issues
    for (const [component, check] of healthChecks) {
      if (check.status !== 'healthy') {
        issues.push({
          type: 'component-health',
          severity: check.status === 'critical' ? 'critical' : 'medium',
          description: `${component} is ${check.status}`,
          affectedComponents: [component],
          recommendedActions: this.getComponentRecoveryActions(component, check.status),
          autoRecoveryPossible: this.canAutoRecover(component, check.status)
        });
      }
    }

    return issues;
  }

  /**
   * Analyze failure patterns
   */
  private analyzeFailurePatterns(failures: any[]): any[] {
    const patterns = [];

    // Group failures by type
    const failuresByType = failures.reduce((acc, failure) => {
      const key = failure.jobType;
      if (!acc[key]) acc[key] = [];
      acc[key].push(failure);
      return acc;
    }, {});

    for (const [jobType, typeFailures] of Object.entries(failuresByType)) {
      const failures = typeFailures as any[]; // Type assertion for safety
      if (failures.length > 5) { // More than 5 failures of same type
        patterns.push({
          severity: failures.length > 20 ? 'critical' : 'high',
          description: `High failure rate for ${jobType}: ${failures.length} failures`,
          components: [jobType],
          recommendedActions: [
            {
              type: 'manual-intervention',
              description: 'Investigate root cause of repeated failures',
              automated: false,
              priority: 'high'
            }
          ],
          autoRecoveryPossible: false
        });
      }
    }

    return patterns;
  }

  /**
   * Get recovery actions for component
   */
  private getComponentRecoveryActions(component: string, status: string): RecoveryAction[] {
    const actions: RecoveryAction[] = [];

    switch (component) {
      case 'mongodb':
        actions.push({
          type: 'restart-service',
          description: 'Restart MongoDB connection',
          automated: true,
          priority: 'high'
        });
        break;
      case 'redis':
        actions.push({
          type: 'clear-cache',
          description: 'Clear Redis cache and reconnect',
          automated: true,
          priority: 'medium'
        });
        break;
      case 'queues':
        actions.push({
          type: 'requeue-job',
          description: 'Requeue stalled jobs',
          automated: true,
          priority: 'medium'
        });
        break;
      case 'api':
        actions.push({
          type: 'restart-service',
          description: 'Restart API service',
          automated: true,
          priority: 'high'
        });
        break;
    }

    return actions;
  }

  /**
   * Check if component can auto-recover
   */
  private canAutoRecover(component: string, status: string): boolean {
    // Most connectivity issues can be auto-recovered
    return status === 'degraded';
  }

  /**
   * Calculate overall system health
   */
  private calculateOverallHealth(issues: any[]): 'healthy' | 'degraded' | 'critical' {
    if (issues.length === 0) return 'healthy';
    
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const highIssues = issues.filter(i => i.severity === 'high').length;
    
    if (criticalIssues > 0) return 'critical';
    if (highIssues > 2) return 'critical';
    if (issues.length > 5) return 'degraded';
    
    return 'degraded';
  }

  /**
   * Attempt auto-recovery for issues
   */
  private async attemptAutoRecovery(issues: any[]): Promise<number> {
    let recovered = 0;

    for (const issue of issues) {
      if (!issue.autoRecoveryPossible) continue;

      for (const action of issue.recommendedActions) {
        if (!action.automated) continue;

        try {
          await this.executeRecoveryAction(action);
          recovered++;
          
          // Mark failures as resolved
          await this.markFailuresResolved(issue.type, action.type);
          break; // Only execute one automated action per issue
        } catch (error) {
          logger.error({ action, error }, 'Auto-recovery failed:');
        }
      }
    }

    return recovered;
  }

  /**
   * Execute recovery action
   */
  private async executeRecoveryAction(action: RecoveryAction): Promise<void> {
    switch (action.type) {
      case 'restart-service':
        // Implementation would restart the service
        logger.info(`Executing restart-service: ${action.description}`);
        break;
      case 'clear-cache':
        // Implementation would clear cache
        logger.info(`Executing clear-cache: ${action.description}`);
        break;
      case 'requeue-job':
        // Implementation would requeue jobs
        logger.info(`Executing requeue-job: ${action.description}`);
        break;
      default:
        logger.warn({ actionType: action.type }, 'Unknown recovery action type:');
    }
  }

  /**
   * Mark failures as resolved
   */
  private async markFailuresResolved(issueType: string, resolutionType: string): Promise<void> {
    await JobFailure.updateMany(
      { 
        jobType: { $regex: issueType, $options: 'i' },
        'resolution.type': { $exists: false }
      },
      {
        $set: {
          'resolution.type': resolutionType,
          'resolution.resolvedAt': new Date(),
          'resolution.notes': 'Auto-recovered by self-healing system'
        }
      }
    );
  }

  /**
   * Store healing report
   */
  private async storeHealingReport(report: HealingReport): Promise<void> {
    // This would store the report in a collection or log
    logger.info({
      overallHealth: report.overallHealth,
      issuesCount: report.issues.length,
      autoRecovered: report.autoRecoveredIssues,
      manualRequired: report.manualInterventionRequired
    }, 'Self-healing report generated:');
  }

  /**
   * Get healing reports
   */
  async getHealingReports(limit: number = 10): Promise<HealingReport[]> {
    // This would retrieve reports from storage
    // For now, return empty array
    return [];
  }

  /**
   * Create manual recovery task
   */
  async createManualRecoveryTask(issueId: string, notes: string): Promise<void> {
    // This would create a task for manual intervention
    logger.info({ issueId, notes }, 'Manual recovery task created:');
  }
}
