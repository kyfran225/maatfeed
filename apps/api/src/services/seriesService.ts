import { SeriesModel, ISeries } from '../models/Series';
import { SeriesEpisodeModel, ISeriesEpisode } from '../models/SeriesEpisode';
import { SeriesFollowModel, ISeriesFollow } from '../models/SeriesFollow';
import mongoose from 'mongoose';

export interface CreateSeriesData {
  title: string;
  description: string;
  coverImage: string;
  creatorId: string;
  category: string;
  tags?: string[];
  language?: string;
  isPublic?: boolean;
}

export interface CreateEpisodeData {
  seriesId: string;
  title: string;
  description: string;
  episodeNumber: number;
  seasonNumber?: number;
  audioUrl: string;
  videoUrl?: string;
  coverImage: string;
  duration: number;
  fileSize: number;
  tags?: string[];
  isPublic?: boolean;
  isPublished?: boolean;
}

export interface SeriesProgress {
  currentEpisode?: {
    episodeId: string;
    episodeNumber: number;
    seasonNumber: number;
    watchedAt: Date;
  };
  completedEpisodes: Array<{
    episodeId: string;
    episodeNumber: number;
    seasonNumber: number;
    completedAt: Date;
    watchDuration: number;
  }>;
  totalWatchTime: number;
  completionPercentage: number;
}

class SeriesService {
  // Series Management
  async createSeries(data: CreateSeriesData): Promise<ISeries> {
    const series = new SeriesModel(data);
    return await series.save();
  }

  async getSeriesById(seriesId: string): Promise<ISeries | null> {
    return await SeriesModel.findById(seriesId)
      .populate('creatorId', 'username avatar')
      .exec();
  }

  async getSeriesByCreator(creatorId: string, page = 1, limit = 20): Promise<{series: ISeries[], total: number}> {
    const skip = (page - 1) * limit;
    const series = await SeriesModel.find({ creatorId, isPublic: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    
    const total = await SeriesModel.countDocuments({ creatorId, isPublic: true });
    
    return { series, total };
  }

  async getPopularSeries(page = 1, limit = 20): Promise<{series: ISeries[], total: number}> {
    const skip = (page - 1) * limit;
    const series = await SeriesModel.find({ isPublic: true })
      .sort({ followerCount: -1, playCount: -1 })
      .skip(skip)
      .limit(limit)
      .populate('creatorId', 'username avatar')
      .exec();
    
    const total = await SeriesModel.countDocuments({ isPublic: true });
    
    return { series, total };
  }

  async getSeriesByCategory(category: string, page = 1, limit = 20): Promise<{series: ISeries[], total: number}> {
    const skip = (page - 1) * limit;
    const series = await SeriesModel.find({ category, isPublic: true })
      .sort({ followerCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('creatorId', 'username avatar')
      .exec();
    
    const total = await SeriesModel.countDocuments({ category, isPublic: true });
    
    return { series, total };
  }

  async updateSeries(seriesId: string, data: Partial<CreateSeriesData>): Promise<ISeries | null> {
    return await SeriesModel.findByIdAndUpdate(
      seriesId,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).exec();
  }

  async deleteSeries(seriesId: string): Promise<boolean> {
    const result = await SeriesModel.findByIdAndDelete(seriesId).exec();
    
    if (result) {
      // Delete all episodes and follows
      await SeriesEpisodeModel.deleteMany({ seriesId }).exec();
      await SeriesFollowModel.deleteMany({ seriesId }).exec();
    }
    
    return !!result;
  }

  // Episode Management
  async createEpisode(data: CreateEpisodeData): Promise<ISeriesEpisode> {
    const episode = new SeriesEpisodeModel(data);
    const savedEpisode = await episode.save();

    // Update series episode count and total duration
    await SeriesModel.findByIdAndUpdate(
      data.seriesId,
      {
        $inc: { 
          episodeCount: 1,
          totalDuration: data.duration
        },
        updatedAt: new Date()
      }
    ).exec();

    return savedEpisode;
  }

  async getEpisodeById(episodeId: string): Promise<ISeriesEpisode | null> {
    return await SeriesEpisodeModel.findById(episodeId)
      .populate('seriesId', 'title creatorId')
      .exec();
  }

  async getEpisodesBySeries(seriesId: string, page = 1, limit = 20): Promise<{episodes: ISeriesEpisode[], total: number}> {
    const skip = (page - 1) * limit;
    const episodes = await SeriesEpisodeModel.find({ seriesId, isPublic: true, isPublished: true })
      .sort({ seasonNumber: 1, episodeNumber: 1 })
      .skip(skip)
      .limit(limit)
      .exec();
    
    const total = await SeriesEpisodeModel.countDocuments({ seriesId, isPublic: true, isPublished: true });
    
    return { episodes, total };
  }

  async updateEpisode(episodeId: string, data: Partial<CreateEpisodeData>): Promise<ISeriesEpisode | null> {
    const oldEpisode = await SeriesEpisodeModel.findById(episodeId).exec();
    if (!oldEpisode) return null;

    const updatedEpisode = await SeriesEpisodeModel.findByIdAndUpdate(
      episodeId,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).exec();

    // Update series total duration if duration changed
    if (data.duration && data.duration !== oldEpisode.duration) {
      const durationDiff = data.duration - oldEpisode.duration;
      await SeriesModel.findByIdAndUpdate(
        oldEpisode.seriesId,
        {
          $inc: { totalDuration: durationDiff },
          updatedAt: new Date()
        }
      ).exec();
    }

    return updatedEpisode;
  }

  async deleteEpisode(episodeId: string): Promise<boolean> {
    const episode = await SeriesEpisodeModel.findByIdAndDelete(episodeId).exec();
    
    if (episode) {
      // Update series episode count and total duration
      await SeriesModel.findByIdAndUpdate(
        episode.seriesId,
        {
          $inc: { 
            episodeCount: -1,
            totalDuration: -episode.duration
          },
          updatedAt: new Date()
        }
      ).exec();
    }
    
    return !!episode;
  }

  // Follow Management
  async followSeries(userId: string, seriesId: string, notifications?: any): Promise<ISeriesFollow> {
    const existingFollow = await SeriesFollowModel.findOne({ userId, seriesId }).exec();
    
    if (existingFollow) {
      throw new Error('User already follows this series');
    }

    const follow = new SeriesFollowModel({
      userId,
      seriesId,
      notifications: notifications || {
        newEpisodes: true,
        seriesUpdates: false
      }
    });

    const savedFollow = await follow.save();

    // Update series follower count
    await SeriesModel.findByIdAndUpdate(
      seriesId,
      {
        $inc: { followerCount: 1 },
        updatedAt: new Date()
      }
    ).exec();

    return savedFollow;
  }

  async unfollowSeries(userId: string, seriesId: string): Promise<boolean> {
    const result = await SeriesFollowModel.findOneAndDelete({ userId, seriesId }).exec();
    
    if (result) {
      // Update series follower count
      await SeriesModel.findByIdAndUpdate(
        seriesId,
        {
          $inc: { followerCount: -1 },
          updatedAt: new Date()
        }
      ).exec();
    }
    
    return !!result;
  }

  async getUserFollowedSeries(userId: string, page = 1, limit = 20): Promise<{follows: ISeriesFollow[], total: number}> {
    const skip = (page - 1) * limit;
    const follows = await SeriesFollowModel.find({ userId })
      .sort({ followedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('seriesId')
      .populate('progress.currentEpisode.episodeId')
      .exec();
    
    const total = await SeriesFollowModel.countDocuments({ userId });
    
    return { follows, total };
  }

  // Progress Tracking
  async updateEpisodeProgress(
    userId: string, 
    seriesId: string, 
    episodeId: string, 
    watchDuration: number,
    completed: boolean = false
  ): Promise<ISeriesFollow | null> {
    const follow = await SeriesFollowModel.findOne({ userId, seriesId }).exec();
    
    if (!follow) {
      // Auto-follow if not already following
      return await this.followSeries(userId, seriesId);
    }

    const episode = await SeriesEpisodeModel.findById(episodeId).exec();
    if (!episode) return null;

    // Update current episode
    follow.progress.currentEpisode = {
      episodeId: episode._id,
      episodeNumber: episode.episodeNumber,
      seasonNumber: episode.seasonNumber,
      watchedAt: new Date()
    };

    // Add to completed episodes if completed
    if (completed) {
      const existingCompleted = follow.progress.completedEpisodes.find(
        (ep: any) => ep.episodeId.toString() === episodeId
      );

      if (!existingCompleted) {
        follow.progress.completedEpisodes.push({
          episodeId: episode._id,
          episodeNumber: episode.episodeNumber,
          seasonNumber: episode.seasonNumber,
          completedAt: new Date(),
          watchDuration
        });
      } else {
        existingCompleted.watchDuration = watchDuration;
        existingCompleted.completedAt = new Date();
      }
    }

    // Calculate total watch time and completion percentage
    follow.progress.totalWatchTime += watchDuration;
    
    // Get total episodes count for completion calculation
    const totalEpisodes = await SeriesEpisodeModel.countDocuments({ 
      seriesId, 
      isPublic: true, 
      isPublished: true 
    });
    
    follow.progress.completionPercentage = totalEpisodes > 0 
      ? (follow.progress.completedEpisodes.length / totalEpisodes) * 100 
      : 0;

    return await follow.save();
  }

  async getSeriesProgress(userId: string, seriesId: string): Promise<SeriesProgress | null> {
    const follow = await SeriesFollowModel.findOne({ userId, seriesId }).exec();
    return follow ? follow.progress : null;
  }

  // Analytics
  async getSeriesAnalytics(seriesId: string): Promise<any> {
    const series = await SeriesModel.findById(seriesId).exec();
    if (!series) return null;

    const episodeStats = await SeriesEpisodeModel.aggregate([
      { $match: { seriesId: new mongoose.Types.ObjectId(seriesId) } },
      {
        $group: {
          _id: null,
          totalEpisodes: { $sum: 1 },
          totalPlays: { $sum: '$playCount' },
          totalLikes: { $sum: '$likeCount' },
          totalComments: { $sum: '$commentCount' },
          averageDuration: { $avg: '$duration' },
          averageRating: { $avg: '$rating.average' }
        }
      }
    ]).exec();

    const followerGrowth = await SeriesFollowModel.aggregate([
      { $match: { seriesId: new mongoose.Types.ObjectId(seriesId) } },
      {
        $group: {
          _id: {
            year: { $year: '$followedAt' },
            month: { $month: '$followedAt' },
            day: { $dayOfMonth: '$followedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]).exec();

    return {
      series,
      stats: episodeStats[0] || {},
      followerGrowth
    };
  }

  async searchSeries(query: string, page = 1, limit = 20): Promise<{series: ISeries[], total: number}> {
    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(query, 'i');

    const series = await SeriesModel.find({
      isPublic: true,
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex }
      ]
    })
    .sort({ followerCount: -1, 'rating.average': -1 })
    .skip(skip)
    .limit(limit)
    .populate('creatorId', 'username avatar')
    .exec();

    const total = await SeriesModel.countDocuments({
      isPublic: true,
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex }
      ]
    });

    return { series, total };
  }
}

export const seriesService = new SeriesService();
