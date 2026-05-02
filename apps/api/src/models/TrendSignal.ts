import mongoose, { Schema, Document } from 'mongoose';

export interface TrendSignalDocument extends Document {
  contentId: string;
  bucket: 'viral' | 'educational' | 'deep';
  signalType: 'spike' | 'sustained' | 'declining';
  velocity: number; // rate of change
  acceleration: number; // rate of change of velocity
  momentum: number; // combined engagement force
  peakScore: number; // highest observed score
  currentScore: number; // latest computed score
  baselineScore: number; // pre-trend baseline
  detectedAt: Date;
  lastUpdated: Date;
  duration: number; // minutes since detection
  isActive: boolean;
  confidence: number; // 0-1 confidence in trend signal
  contributors: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    watches: number;
  };
  metadata: {
    sourceBreakdown?: Record<string, number>;
    geographicSignals?: Record<string, number>;
    timeOfDayPattern?: number[];
    contentTags?: string[];
  };
}

const trendSignalSchema = new Schema<TrendSignalDocument>({
  contentId: {
    type: String,
    required: true,
    ref: 'Content'
  },
  bucket: {
    type: String,
    required: true,
    enum: ['viral', 'educational', 'deep']
  },
  signalType: {
    type: String,
    required: true,
    enum: ['spike', 'sustained', 'declining']
  },
  velocity: {
    type: Number,
    required: true,
    default: 0
  },
  acceleration: {
    type: Number,
    required: true,
    default: 0
  },
  momentum: {
    type: Number,
    required: true,
    default: 0
  },
  peakScore: {
    type: Number,
    required: true,
    default: 0
  },
  currentScore: {
    type: Number,
    required: true,
    default: 0
  },
  baselineScore: {
    type: Number,
    required: true,
    default: 0
  },
  detectedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    required: true,
    default: Date.now
  },
  duration: {
    type: Number,
    required: true,
    default: 0
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
    default: 0.5
  },
  contributors: {
    likes: { type: Number, required: true, default: 0 },
    comments: { type: Number, required: true, default: 0 },
    shares: { type: Number, required: true, default: 0 },
    views: { type: Number, required: true, default: 0 },
    watches: { type: Number, required: true, default: 0 }
  },
  metadata: {
    sourceBreakdown: { type: Map, of: Number },
    geographicSignals: { type: Map, of: Number },
    timeOfDayPattern: [{ type: Number }],
    contentTags: [{ type: String }]
  }
});

// Compound indexes for trend queries
trendSignalSchema.index({ contentId: 1, isActive: 1 });
trendSignalSchema.index({ bucket: 1, signalType: 1, isActive: 1 });
trendSignalSchema.index({ detectedAt: -1, isActive: 1 });
trendSignalSchema.index({ momentum: -1, isActive: 1 });
trendSignalSchema.index({ confidence: -1, isActive: 1 });

// TTL index to automatically clean up inactive trends after 30 days
trendSignalSchema.index({ lastUpdated: 1 }, { 
  expireAfterSeconds: 30 * 24 * 60 * 60 // 30 days
});

export const TrendSignal = mongoose.model<TrendSignalDocument>('TrendSignal', trendSignalSchema);
