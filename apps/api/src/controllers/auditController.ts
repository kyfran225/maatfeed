import type { Request, Response } from "express";
import { AuditLog } from "../models/AuditLog.js";

export async function getAuditLogsController(request: Request, response: Response) {
  try {
    const limit = Math.min(parseInt(request.query.limit as string) || 50, 100);
    const offset = Math.max(parseInt(request.query.offset as string) || 0, 0);
    const entityType = request.query.entityType as string;
    const action = request.query.action as string;
    const source = request.query.source as string;
    const userId = request.query.userId as string;

    const query: any = {};
    
    if (entityType) {
      query.entityType = entityType;
    }

    if (action) {
      query.action = action;
    }

    if (source) {
      query['metadata.source'] = source;
    }

    if (userId) {
      query['metadata.userId'] = userId;
    }

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    const total = await AuditLog.countDocuments(query);

    response.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      }
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: "Failed to retrieve audit logs"
    });
  }
}

export async function getAuditLogByIdController(request: Request, response: Response) {
  try {
    const { id } = request.params;

    const log = await AuditLog.findById(id);
    
    if (!log) {
      response.status(404).json({
        success: false,
        error: "Audit log not found"
      });
      return;
    }

    response.status(200).json({
      success: true,
      data: log
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: "Failed to retrieve audit log"
    });
  }
}

export async function getEntityHistoryController(request: Request, response: Response) {
  try {
    const { entityType, entityId } = request.params;
    const limit = Math.min(parseInt(request.query.limit as string) || 20, 50);

    const logs = await AuditLog.find({
      entityType,
      entityId
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

    response.status(200).json({
      success: true,
      data: {
        entityType,
        entityId,
        logs,
        totalChanges: logs.length
      }
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: "Failed to retrieve entity history"
    });
  }
}

export async function getRollbackOptionsController(request: Request, response: Response) {
  try {
    const { entityType, entityId } = request.params;

    // Find logs that can be rolled back
    const rollbackableLogs = await AuditLog.find({
      entityType,
      entityId,
      'rollbackInfo.canRollback': true
    })
    .sort({ createdAt: -1 })
    .lean();

    const rollbackOptions = rollbackableLogs.map(log => ({
      version: log.metadata.version,
      createdAt: log.createdAt,
      action: log.action,
      reason: log.metadata.reason,
      rollbackToVersion: log.rollbackInfo?.rollbackToVersion,
      rollbackData: log.rollbackInfo?.rollbackData
    }));

    response.status(200).json({
      success: true,
      data: {
        entityType,
        entityId,
        rollbackOptions
      }
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: "Failed to retrieve rollback options"
    });
  }
}

export async function createRollbackController(request: Request, response: Response) {
  try {
    const { entityType, entityId } = request.params;
    const { toVersion, reason } = request.body;

    if (!toVersion) {
      response.status(400).json({
        success: false,
        error: "Target version is required"
      });
      return;
    }

    // Find the target version log
    const targetLog = await AuditLog.findOne({
      entityType,
      entityId,
      'metadata.version': toVersion,
      'rollbackInfo.canRollback': true
    });

    if (!targetLog) {
      response.status(404).json({
        success: false,
        error: "Target version not found or not rollbackable"
      });
      return;
    }

    // In a real implementation, this would:
    // 1. Execute the actual rollback using targetLog.rollbackData
    // 2. Create a new audit log for the rollback action
    
    const rollbackLog = new AuditLog({
      entityType,
      entityId,
      action: 'rollback',
      changeSet: {
        before: null, // Would be current state
        after: targetLog.rollbackInfo?.rollbackData,
        diff: `Rollback to version ${toVersion}`
      },
      metadata: {
        userId: 'system', // Would come from auth context
        reason: reason || `Manual rollback to version ${toVersion}`,
        source: 'manual',
        version: `${toVersion}-rollback-${Date.now()}`,
        environment: process.env.NODE_ENV || 'development'
      },
      impact: {
        affectedContent: 0, // Would calculate based on entity type
        affectedUsers: 0, // Would calculate based on impact
        systemImpact: 'medium'
      },
      rollbackInfo: {
        canRollback: true,
        rollbackToVersion: toVersion,
        rollbackData: null // Would be current state for future rollback
      }
    });

    await rollbackLog.save();

    response.status(201).json({
      success: true,
      data: rollbackLog
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: "Failed to create rollback"
    });
  }
}

export async function getAuditStatsController(request: Request, response: Response) {
  try {
    const timeRange = parseInt(request.query.timeRange as string) || 24; // hours
    const startDate = new Date(Date.now() - timeRange * 60 * 60 * 1000);

    const stats = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalChanges: { $sum: 1 },
          changesByType: {
            $push: {
              entityType: '$entityType',
              count: 1
            }
          },
          changesByAction: {
            $push: {
              action: '$action',
              count: 1
            }
          },
          changesBySource: {
            $push: {
              source: '$metadata.source',
              count: 1
            }
          },
          highImpactChanges: {
            $sum: { $cond: [{ $in: ['$impact.systemImpact', ['high', 'critical']] }, 1, 0] }
          },
          rollbackableChanges: {
            $sum: { $cond: ['$rollbackInfo.canRollback', 1, 0] }
          }
        }
      }
    ]);

    const changesByHour = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            hour: { $hour: '$createdAt' },
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1, '_id.hour': 1 } }
    ]);

    response.status(200).json({
      success: true,
      data: {
        stats: stats[0] || {
          totalChanges: 0,
          highImpactChanges: 0,
          rollbackableChanges: 0
        },
        changesByHour
      }
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: "Failed to retrieve audit statistics"
    });
  }
}
