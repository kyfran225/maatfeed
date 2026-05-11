import { Response } from 'express';
import { seriesService, CreateSeriesData, CreateEpisodeData } from '../services/seriesService';
import { validationResult } from 'express-validator';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class SeriesController {
  // Series Management
  async createSeries(req: AuthenticatedRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const data: CreateSeriesData = {
        ...req.body as any,
        creatorId: req.user!.userId
      };

      const series = await seriesService.createSeries(data);
      res.status(201).json({ success: true, data: series });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to create series' 
      });
    }
  }

  async getSeries(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params as any;
      const series = await seriesService.getSeriesById(id);
      
      if (!series) {
        return res.status(404).json({ success: false, error: 'Series not found' });
      }

      res.json({ success: true, data: series });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to get series' 
      });
    }
  }

  async getSeriesByCreator(req: AuthenticatedRequest, res: Response) {
    try {
      const { creatorId } = req.params as any;
      const page = parseInt((req.query as any).page as string) || 1;
      const limit = parseInt((req.query as any).limit as string) || 20;

      const result = await seriesService.getSeriesByCreator(creatorId, page, limit);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to get series by creator' 
      });
    }
  }

  async getPopularSeries(req: AuthenticatedRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await seriesService.getPopularSeries(page, limit);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to get popular series' 
      });
    }
  }

  async getSeriesByCategory(req: AuthenticatedRequest, res: Response) {
    try {
      const { category } = req.params as any;
      const page = parseInt((req.query as any).page as string) || 1;
      const limit = parseInt((req.query as any).limit as string) || 20;

      const result = await seriesService.getSeriesByCategory(category, page, limit);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to get series by category' 
      });
    }
  }

  async updateSeries(req: AuthenticatedRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params as any;
      const data = req.body;

      const series = await seriesService.getSeriesById(id);
      if (!series) {
        return res.status(404).json({ success: false, error: 'Series not found' });
      }

      if (series.creatorId.toString() !== req.user!.userId) {
        return res.status(403).json({ success: false, error: 'Not authorized to update this series' });
      }

      const updatedSeries = await seriesService.updateSeries(id, data);
      res.json({ success: true, data: updatedSeries });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to update series' 
      });
    }
  }

  async deleteSeries(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params as any;

      const series = await seriesService.getSeriesById(id);
      if (!series) {
        return res.status(404).json({ success: false, error: 'Series not found' });
      }

      if (series.creatorId.toString() !== req.user!.userId) {
        return res.status(403).json({ success: false, error: 'Not authorized to delete this series' });
      }

      const deleted = await seriesService.deleteSeries(id);
      if (deleted) {
        res.json({ success: true, message: 'Series deleted successfully' });
      } else {
        res.status(400).json({ success: false, error: 'Failed to delete series' });
      }
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to delete series' 
      });
    }
  }

  // Episode Management
  async createEpisode(req: AuthenticatedRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const data: CreateEpisodeData = req.body as any;

      // Verify user owns the series
      const series = await seriesService.getSeriesById(data.seriesId);
      if (!series) {
        return res.status(404).json({ success: false, error: 'Series not found' });
      }

      if (series.creatorId.toString() !== req.user!.userId) {
        return res.status(403).json({ success: false, error: 'Not authorized to add episodes to this series' });
      }

      const episode = await seriesService.createEpisode(data);
      res.status(201).json({ success: true, data: episode });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to create episode' 
      });
    }
  }

  async getEpisode(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params as any;
      const episode = await seriesService.getEpisodeById(id);
      
      if (!episode) {
        return res.status(404).json({ success: false, error: 'Episode not found' });
      }

      res.json({ success: true, data: episode });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to get episode' 
      });
    }
  }

  async getEpisodesBySeries(req: AuthenticatedRequest, res: Response) {
    try {
      const { seriesId } = req.params as any;
      const page = parseInt((req.query as any).page as string) || 1;
      const limit = parseInt((req.query as any).limit as string) || 20;

      const result = await seriesService.getEpisodesBySeries(seriesId, page, limit);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to get episodes' 
      });
    }
  }

  async updateEpisode(req: AuthenticatedRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params as any;
      const data = req.body;

      const episode = await seriesService.getEpisodeById(id);
      if (!episode) {
        return res.status(404).json({ success: false, error: 'Episode not found' });
      }

      const series = await seriesService.getSeriesById(episode.seriesId.toString());
      if (series && series.creatorId.toString() !== req.user!.userId) {
        return res.status(403).json({ success: false, error: 'Not authorized to update this episode' });
      }

      const updatedEpisode = await seriesService.updateEpisode(id, data);
      res.json({ success: true, data: updatedEpisode });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to update episode' 
      });
    }
  }

  async deleteEpisode(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params as any;

      const episode = await seriesService.getEpisodeById(id);
      if (!episode) {
        return res.status(404).json({ success: false, error: 'Episode not found' });
      }

      const series = await seriesService.getSeriesById(episode.seriesId.toString());
      if (series && series.creatorId.toString() !== req.user!.userId) {
        return res.status(403).json({ success: false, error: 'Not authorized to delete this episode' });
      }

      const deleted = await seriesService.deleteEpisode(id);
      if (deleted) {
        res.json({ success: true, message: 'Episode deleted successfully' });
      } else {
        res.status(400).json({ success: false, error: 'Failed to delete episode' });
      }
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to delete episode' 
      });
    }
  }

  // Follow Management
  async followSeries(req: AuthenticatedRequest, res: Response) {
    try {
      const { seriesId } = req.params as any;
      const { notifications } = req.body as any;

      const follow = await seriesService.followSeries(
        req.user!.userId, 
        seriesId, 
        notifications
      );
      res.status(201).json({ success: true, data: follow });
    } catch (error: any) {
      if (error.message === 'User already follows this series') {
        res.status(409).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ 
          success: false, 
          error: error.message || 'Failed to follow series' 
        });
      }
    }
  }

  async unfollowSeries(req: AuthenticatedRequest, res: Response) {
    try {
      const { seriesId } = req.params as any;

      const success = await seriesService.unfollowSeries(req.user!.userId, seriesId);
      if (success) {
        res.json({ success: true, message: 'Series unfollowed successfully' });
      } else {
        res.status(400).json({ success: false, error: 'Failed to unfollow series' });
      }
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to unfollow series' 
      });
    }
  }

  async getUserFollowedSeries(req: AuthenticatedRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await seriesService.getUserFollowedSeries(req.user!.userId, page, limit);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to get followed series' 
      });
    }
  }

  // Progress Tracking
  async updateEpisodeProgress(req: AuthenticatedRequest, res: Response) {
    try {
      const { seriesId, episodeId } = req.params as any;
      const { watchDuration, completed } = req.body as any;

      const progress = await seriesService.updateEpisodeProgress(
        req.user!.userId,
        seriesId,
        episodeId,
        watchDuration,
        completed
      );

      res.json({ success: true, data: progress });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to update episode progress' 
      });
    }
  }

  async getSeriesProgress(req: AuthenticatedRequest, res: Response) {
    try {
      const { seriesId } = req.params as any;

      const progress = await seriesService.getSeriesProgress(req.user!.userId, seriesId);
      res.json({ success: true, data: progress });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to get series progress' 
      });
    }
  }

  // Analytics
  async getSeriesAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      const { seriesId } = req.params as any;

      const series = await seriesService.getSeriesById(seriesId);
      if (!series) {
        return res.status(404).json({ success: false, error: 'Series not found' });
      }

      if (series.creatorId.toString() !== req.user!.userId) {
        return res.status(403).json({ success: false, error: 'Not authorized to view analytics for this series' });
      }

      const analytics = await seriesService.getSeriesAnalytics(seriesId);
      res.json({ success: true, data: analytics });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to get series analytics' 
      });
    }
  }

  // Search
  async searchSeries(req: AuthenticatedRequest, res: Response) {
    try {
      const { q } = req.query as any;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ success: false, error: 'Search query is required' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await seriesService.searchSeries(q, page, limit);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to search series' 
      });
    }
  }
}

export const seriesController = new SeriesController();
