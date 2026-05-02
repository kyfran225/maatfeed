import mongoose, { Schema, Document } from 'mongoose';

export interface JobFailureDocument extends Document {
  jobId: string;
  queueName: string;
  jobType: string;
  failureReason: string;
  errorDetails: string;
  stackTrace?: string;
  attempts: number;
  failedAt: Date;
  data?: any; // Original job data
  resolution?: {
    type: 'auto-retry' | 'manual-intervention' | 'ignored' | 'fixed';
    resolvedAt?: Date;
    resolvedBy?: string;
    notes?: string;
  };
  impact: {
    affectedContent?: string[];
    affectedUsers?: string[];
    systemImpact: 'low' | 'medium' | 'high' | 'critical';
  };
  recommendations?: string[];
  autoRecoveryPossible: boolean;
}

const jobFailureSchema = new Schema<JobFailureDocument>({
  jobId: {
    type: String,
    required: true
  },
  queueName: {
    type: String,
    required: true
  },
  jobType: {
    type: String,
    required: true
  },
  failureReason: {
    type: String,
    required: true
  },
  errorDetails: {
    type: String,
    required: true
  },
  stackTrace: {
    type: String,
    default: null
  },
  attempts: {
    type: Number,
    required: true,
    default: 0
  },
  failedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  data: {
    type: Schema.Types.Mixed,
    default: null
  },
  resolution: {
    type: {
      type: String,
      enum: ['auto-retry', 'manual-intervention', 'ignored', 'fixed'],
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    resolvedBy: {
      type: String,
      default: null
    },
    notes: {
      type: String,
      default: null
    }
  },
  impact: {
    affectedContent: [{
      type: String
    }],
    affectedUsers: [{
      type: String
    }],
    systemImpact: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
      default: 'low'
    }
  },
  recommendations: [{
    type: String
  }],
  autoRecoveryPossible: {
    type: Boolean,
    required: true,
    default: false
  }
});

// Compound indexes for efficient queries
jobFailureSchema.index({ queueName: 1, failedAt: -1 });
jobFailureSchema.index({ jobType: 1, failedAt: -1 });
jobFailureSchema.index({ 'impact.systemImpact': 1, failedAt: -1 });
jobFailureSchema.index({ autoRecoveryPossible: 1, failedAt: -1 });
jobFailureSchema.index({ 'resolution.type': 1, resolvedAt: -1 });

// TTL index to automatically clean up resolved failures after 90 days
jobFailureSchema.index({ resolvedAt: 1 }, { 
  expireAfterSeconds: 90 * 24 * 60 * 60, // 90 days
  partialFilterExpression: { 'resolution.type': { $exists: true } }
});

export const JobFailure = mongoose.model<JobFailureDocument>('JobFailure', jobFailureSchema);
