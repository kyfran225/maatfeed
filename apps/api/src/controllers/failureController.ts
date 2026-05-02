import type { Request, Response } from "express";
import { JobFailure } from "../models/JobFailure.js";
import { SelfHealingService } from "../services/selfHealingService.js";

export async function getFailuresController(request: Request, response: Response) {
  try {
    const limit = Math.min(parseInt(request.query.limit as string) || 50, 100);
    const offset = Math.max(parseInt(request.query.offset as string) || 0, 0);
    const status = request.query.status as string;
    const severity = request.query.severity as string;
    const jobType = request.query.jobType as string;

    const query: any = {};
    
    if (status === 'unresolved') {
      query['resolution.type'] = { $exists: false };
    } else if (status === 'resolved') {
      query['resolution.type'] = { $exists: true };
    }

    if (severity) {
      query['impact.systemImpact'] = severity;
    }

    if (jobType) {
      query.jobType = { $regex: jobType, $options: 'i' };
    }

    const failures = await JobFailure.find(query)
      .sort({ failedAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    const total = await JobFailure.countDocuments(query);

    response.status(200).json({
      success: true,
      data: {
        failures,
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
      error: "Failed to retrieve failures"
    });
  }
}

export async function getFailureByIdController(request: Request, response: Response) {
  try {
    const { id } = request.params;

    const failure = await JobFailure.findById(id);
    
    if (!failure) {
      response.status(404).json({
        success: false,
        error: "Failure not found"
      });
      return;
    }

    response.status(200).json({
      success: true,
      data: failure
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: "Failed to retrieve failure"
    });
  }
}

export async function resolveFailureController(request: Request, response: Response) {
  try {
    const { id } = request.params;
    const { resolutionType, notes } = request.body;

    if (!resolutionType || !['auto-retry', 'manual-intervention', 'ignored', 'fixed'].includes(resolutionType)) {
      response.status(400).json({
        success: false,
        error: "Invalid resolution type"
      });
      return;
    }

    const failure = await JobFailure.findByIdAndUpdate(
      id,
      {
        $set: {
          'resolution.type': resolutionType,
          'resolution.resolvedAt': new Date(),
          'resolution.resolvedBy': 'manual', // Would come from auth context
          'resolution.notes': notes || ''
        }
      },
      { new: true }
    );

    if (!failure) {
      response.status(404).json({
        success: false,
        error: "Failure not found"
      });
      return;
    }

    response.status(200).json({
      success: true,
      data: failure
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: "Failed to resolve failure"
    });
  }
}

export async function getFailureStatsController(request: Request, response: Response) {
  try {
    const timeRange = parseInt(request.query.timeRange as string) || 24; // hours
    const startDate = new Date(Date.now() - timeRange * 60 * 60 * 1000);

    const stats = await JobFailure.aggregate([
      { $match: { failedAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalFailures: { $sum: 1 },
          unresolvedFailures: {
            $sum: { $cond: [{ $eq: ['$resolution.type', null] }, 1, 0] }
          },
          criticalFailures: {
            $sum: { $cond: [{ $eq: ['$impact.systemImpact', 'critical'] }, 1, 0] }
          },
          autoRecoveryPossible: {
            $sum: { $cond: ['$autoRecoveryPossible', 1, 0] }
          },
          failuresByType: {
            $push: {
              jobType: '$jobType',
              count: 1
            }
          }
        }
      }
    ]);

    const failuresByHour = await JobFailure.aggregate([
      { $match: { failedAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            hour: { $hour: '$failedAt' },
            date: { $dateToString: { format: '%Y-%m-%d', date: '$failedAt' } }
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
          totalFailures: 0,
          unresolvedFailures: 0,
          criticalFailures: 0,
          autoRecoveryPossible: 0
        },
        failuresByHour
      }
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: "Failed to retrieve failure statistics"
    });
  }
}

export async function getRootCauseAnalysisController(request: Request, response: Response) {
  try {
    const selfHealingService = new SelfHealingService();
    const report = await selfHealingService.analyzeSystemFailures();

    response.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: "Failed to generate root cause analysis"
    });
  }
}

export async function getHealingReportsController(request: Request, response: Response) {
  try {
    const limit = Math.min(parseInt(request.query.limit as string) || 10, 50);
    
    const selfHealingService = new SelfHealingService();
    const reports = await selfHealingService.getHealingReports(limit);

    response.status(200).json({
      success: true,
      data: reports
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: "Failed to retrieve healing reports"
    });
  }
}
