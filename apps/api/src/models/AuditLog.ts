import mongoose, { Schema, Document } from 'mongoose';

export interface AuditLogDocument extends Document {
  entityType: 'ranking-config' | 'content-bucket' | 'scoring-formula' | 'system-config';
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'rollback' | 'deploy';
  changeSet: {
    before?: any;
    after?: any;
    diff?: string;
  };
  metadata: {
    userId?: string;
    reason?: string;
    source: 'manual' | 'automated' | 'evolution' | 'emergency';
    version?: string;
    gitCommit?: string;
    environment: string;
  };
  impact: {
    affectedContent?: number;
    affectedUsers?: number;
    systemImpact: 'low' | 'medium' | 'high' | 'critical';
  };
  rollbackInfo?: {
    canRollback: boolean;
    rollbackToVersion?: string;
    rollbackData?: any;
  };
  createdAt: Date;
}

const auditLogSchema = new Schema<AuditLogDocument>({
  entityType: {
    type: String,
    required: true,
    enum: ['ranking-config', 'content-bucket', 'scoring-formula', 'system-config']
  },
  entityId: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete', 'rollback', 'deploy']
  },
  changeSet: {
    before: {
      type: Schema.Types.Mixed,
      default: null
    },
    after: {
      type: Schema.Types.Mixed,
      default: null
    },
    diff: {
      type: String,
      default: null
    }
  },
  metadata: {
    userId: {
      type: String,
      default: null
    },
    reason: {
      type: String,
      default: null
    },
    source: {
      type: String,
      required: true,
      enum: ['manual', 'automated', 'evolution', 'emergency'],
      default: 'manual'
    },
    version: {
      type: String,
      default: null
    },
    gitCommit: {
      type: String,
      default: null
    },
    environment: {
      type: String,
      required: true,
      default: 'development'
    }
  },
  impact: {
    affectedContent: {
      type: Number,
      default: 0
    },
    affectedUsers: {
      type: Number,
      default: 0
    },
    systemImpact: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    }
  },
  rollbackInfo: {
    canRollback: {
      type: Boolean,
      required: true,
      default: false
    },
    rollbackToVersion: {
      type: String,
      default: null
    },
    rollbackData: {
      type: Schema.Types.Mixed,
      default: null
    }
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  }
});

// Compound indexes for efficient queries
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ 'metadata.source': 1, createdAt: -1 });
auditLogSchema.index({ 'impact.systemImpact': 1, createdAt: -1 });
auditLogSchema.index({ 'rollbackInfo.canRollback': 1, createdAt: -1 });

// TTL index to automatically clean up old logs after 1 year
// Note: This index may conflict if it already exists. The TTL cleanup will be handled by the application.

export const AuditLog = mongoose.model<AuditLogDocument>('AuditLog', auditLogSchema);
