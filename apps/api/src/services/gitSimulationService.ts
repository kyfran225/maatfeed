import { AuditLog } from '../models/AuditLog.js';
import { RankingConfigModel } from '../models/RankingConfig.js';
import { logger } from '../config/logger.js';

interface ChangeSet {
  entityId: string;
  entityType: 'ranking-config' | 'content-bucket' | 'scoring-formula';
  action: 'create' | 'update' | 'delete';
  before?: any;
  after?: any;
  reason: string;
  userId?: string;
  source: 'manual' | 'automated' | 'evolution' | 'emergency';
}

interface GitCommit {
  hash: string;
  message: string;
  author: string;
  timestamp: Date;
  changes: ChangeSet[];
}

interface VersionInfo {
  version: string;
  commit: string;
  timestamp: Date;
  author: string;
  description: string;
}

export class GitSimulationService {
  private commits: GitCommit[] = [];
  private currentBranch = 'main';
  private tags: Map<string, string> = new Map(); // tag -> commit hash

  /**
   * Record a change set as a simulated git commit
   */
  async recordChangeSet(changeSet: ChangeSet): Promise<string> {
    try {
      const commitHash = this.generateCommitHash();
      const commit: GitCommit = {
        hash: commitHash,
        message: this.generateCommitMessage(changeSet),
        author: changeSet.userId || 'system',
        timestamp: new Date(),
        changes: [changeSet]
      };

      this.commits.push(commit);

      // Create audit log entry
      await this.createAuditLog(changeSet, commitHash);

      logger.info({
        commitHash,
        entityType: changeSet.entityType,
        action: changeSet.action,
        source: changeSet.source
      }, 'Change set recorded');

      return commitHash;
    } catch (error) {
      logger.error({ error }, 'Error recording change set:');
      throw error;
    }
  }

  /**
   * Get version history for an entity
   */
  async getVersionHistory(entityId: string, entityType: string): Promise<VersionInfo[]> {
    try {
      const relevantCommits = this.commits.filter(commit =>
        commit.changes.some(change =>
          change.entityId === entityId && change.entityType === entityType
        )
      );

      return relevantCommits.map(commit => ({
        version: commit.hash.substring(0, 7),
        commit: commit.hash,
        timestamp: commit.timestamp,
        author: commit.author,
        description: commit.message
      }));
    } catch (error) {
      logger.error({ error }, 'Error getting version history:');
      throw error;
    }
  }

  /**
   * Rollback to a specific version
   */
  async rollbackToVersion(entityId: string, entityType: string, version: string, reason: string): Promise<boolean> {
    try {
      const targetCommit = this.commits.find(commit => commit.hash.startsWith(version));
      if (!targetCommit) {
        throw new Error(`Version ${version} not found`);
      }

      const targetChange = targetCommit.changes.find(change =>
        change.entityId === entityId && change.entityType === entityType
      );

      if (!targetChange) {
        throw new Error(`Entity ${entityId} of type ${entityType} not found in version ${version}`);
      }

      // Perform rollback based on action
      let rollbackData: any;
      let rollbackAction: 'create' | 'update' | 'delete';

      switch (targetChange.action) {
        case 'create':
          // Rollback of create = delete
          rollbackAction = 'delete';
          break;
        case 'delete':
          // Rollback of delete = create with before data
          rollbackAction = 'create';
          rollbackData = targetChange.before;
          break;
        case 'update':
          // Rollback of update = update with before data
          rollbackAction = 'update';
          rollbackData = targetChange.before;
          break;
      }

      // Apply rollback
      await this.applyRollback(entityId, entityType, rollbackAction, rollbackData);

      // Record rollback as new commit
      const rollbackChangeSet: ChangeSet = {
        entityId,
        entityType: entityType as any,
        action: rollbackAction,
        before: rollbackData,
        after: targetChange.before,
        reason: `Rollback to version ${version}: ${reason}`,
        source: 'manual'
      };

      const rollbackCommit = await this.recordChangeSet(rollbackChangeSet);

      logger.info({
        entityId,
        entityType,
        fromVersion: version,
        rollbackCommit
      }, 'Rollback completed');

      return true;
    } catch (error) {
      logger.error({ error }, 'Error during rollback:');
      throw error;
    }
  }

  /**
   * Create a version tag
   */
  async createTag(tagName: string, commitHash?: string): Promise<string> {
    try {
      const targetCommit = commitHash || 
        this.commits[this.commits.length - 1]?.hash;

      if (!targetCommit) {
        throw new Error('No commits available to tag');
      }

      this.tags.set(tagName, targetCommit);

      logger.info({ tagName, commitHash: targetCommit }, 'Tag created');
      return targetCommit;
    } catch (error) {
      logger.error({ error }, 'Error creating tag:');
      throw error;
    }
  }

  /**
   * Get diff between versions
   */
  async getDiff(fromVersion: string, toVersion: string, entityId?: string): Promise<any> {
    try {
      const fromCommit = this.commits.find(commit => commit.hash.startsWith(fromVersion));
      const toCommit = this.commits.find(commit => commit.hash.startsWith(toVersion));

      if (!fromCommit || !toCommit) {
        throw new Error('Invalid version(s) specified');
      }

      const fromIndex = this.commits.indexOf(fromCommit);
      const toIndex = this.commits.indexOf(toCommit);

      const commitsInRange = fromIndex < toIndex 
        ? this.commits.slice(fromIndex + 1, toIndex + 1)
        : this.commits.slice(toIndex, fromIndex);

      const changes = entityId
        ? commitsInRange.flatMap(commit => 
            commit.changes.filter(change => change.entityId === entityId)
          )
        : commitsInRange.flatMap(commit => commit.changes);

      return {
        from: fromVersion,
        to: toVersion,
        commits: commitsInRange.length,
        changes: changes.map(change => ({
          action: change.action,
          entityType: change.entityType,
          entityId: change.entityId,
          reason: change.reason,
          timestamp: new Date()
        }))
      };
    } catch (error) {
      logger.error({ error }, 'Error getting diff:');
      throw error;
    }
  }

  /**
   * Get branch information
   */
  getBranchInfo(): { currentBranch: string; availableBranches: string[] } {
    return {
      currentBranch: this.currentBranch,
      availableBranches: ['main', 'develop', 'staging']
    };
  }

  /**
   * Simulate branch creation
   */
  createBranch(branchName: string, fromCommit?: string): void {
    logger.info({ branchName, fromCommit }, 'Branch created');
    // In a real implementation, this would manage branch pointers
  }

  /**
   * Simulate merge
   */
  async mergeBranch(sourceBranch: string, targetBranch: string): Promise<string> {
    logger.info({ sourceBranch, targetBranch }, 'Branch merge simulated');
    return this.generateCommitHash();
  }

  /**
   * Generate commit hash (simulated)
   */
  private generateCommitHash(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Generate commit message
   */
  private generateCommitMessage(changeSet: ChangeSet): string {
    const actionMap = {
      create: 'Created',
      update: 'Updated',
      delete: 'Deleted'
    };

    return `${actionMap[changeSet.action]} ${changeSet.entityType} ${changeSet.entityId}: ${changeSet.reason}`;
  }

  /**
   * Create audit log entry
   */
  private async createAuditLog(changeSet: ChangeSet, commitHash: string): Promise<void> {
    const auditLog = new AuditLog({
      entityType: changeSet.entityType,
      entityId: changeSet.entityId,
      action: changeSet.action,
      changeSet: {
        before: changeSet.before,
        after: changeSet.after
      },
      metadata: {
        userId: changeSet.userId,
        reason: changeSet.reason,
        source: changeSet.source,
        gitCommit: commitHash,
        environment: process.env.NODE_ENV || 'development'
      },
      impact: {
        affectedContent: changeSet.entityType === 'ranking-config' ? 1000 : 0, // Estimate
        affectedUsers: changeSet.entityType === 'ranking-config' ? 5000 : 0, // Estimate
        systemImpact: this.calculateSystemImpact(changeSet)
      },
      rollbackInfo: {
        canRollback: changeSet.action !== 'delete' || !!changeSet.before,
        rollbackToVersion: changeSet.before ? 'previous' : undefined,
        rollbackData: changeSet.before
      }
    });

    await auditLog.save();
  }

  /**
   * Calculate system impact
   */
  private calculateSystemImpact(changeSet: ChangeSet): 'low' | 'medium' | 'high' | 'critical' {
    if (changeSet.source === 'emergency') return 'critical';
    if (changeSet.entityType === 'ranking-config') return 'high';
    if (changeSet.entityType === 'scoring-formula') return 'medium';
    return 'low';
  }

  /**
   * Apply rollback changes
   */
  private async applyRollback(
    entityId: string, 
    entityType: string, 
    action: 'create' | 'update' | 'delete', 
    data: any
  ): Promise<void> {
    switch (entityType) {
      case 'ranking-config':
        if (action === 'delete') {
          await RankingConfigModel.deleteOne({ _id: entityId });
        } else if (action === 'create') {
          const config = new RankingConfigModel({ ...data, _id: entityId });
          await config.save();
        } else if (action === 'update') {
          await RankingConfigModel.updateOne({ _id: entityId }, data);
        }
        break;
      // Add other entity types as needed
      default:
        logger.warn({ entityType }, 'Rollback not implemented for entity type:');
    }
  }

  /**
   * Get recent commits
   */
  getRecentCommits(limit: number = 10): GitCommit[] {
    return this.commits.slice(-limit).reverse();
  }

  /**
   * Get commit details
   */
  getCommitDetails(commitHash: string): GitCommit | null {
    return this.commits.find(commit => commit.hash.startsWith(commitHash)) || null;
  }
}
