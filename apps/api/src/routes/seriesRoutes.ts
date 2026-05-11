import { Router } from 'express';
import { seriesController } from '../controllers/seriesController';
import { authenticateToken } from '../middleware/authMiddleware';
import { body, param, query } from 'express-validator';

const router = Router();

// Validation middleware
const createSeriesValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  body('coverImage')
    .isURL()
    .withMessage('Cover image must be a valid URL'),
  body('category')
    .isIn(['education', 'entertainment', 'news', 'culture', 'technology', 'business', 'health', 'sports', 'other'])
    .withMessage('Invalid category'),
  body('language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language must be 2-5 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag must be max 30 characters'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean')
];

const updateSeriesValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  body('coverImage')
    .optional()
    .isURL()
    .withMessage('Cover image must be a valid URL'),
  body('category')
    .optional()
    .isIn(['education', 'entertainment', 'news', 'culture', 'technology', 'business', 'health', 'sports', 'other'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag must be max 30 characters')
];

const createEpisodeValidation = [
  body('seriesId')
    .isMongoId()
    .withMessage('Invalid series ID'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  body('episodeNumber')
    .isInt({ min: 1 })
    .withMessage('Episode number must be a positive integer'),
  body('seasonNumber')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Season number must be a positive integer'),
  body('audioUrl')
    .isURL()
    .withMessage('Audio URL must be a valid URL'),
  body('videoUrl')
    .optional()
    .isURL()
    .withMessage('Video URL must be a valid URL'),
  body('coverImage')
    .isURL()
    .withMessage('Cover image must be a valid URL'),
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),
  body('fileSize')
    .isInt({ min: 1 })
    .withMessage('File size must be a positive integer'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag must be max 30 characters'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean')
];

const updateEpisodeValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  body('episodeNumber')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Episode number must be a positive integer'),
  body('seasonNumber')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Season number must be a positive integer'),
  body('audioUrl')
    .optional()
    .isURL()
    .withMessage('Audio URL must be a valid URL'),
  body('videoUrl')
    .optional()
    .isURL()
    .withMessage('Video URL must be a valid URL'),
  body('coverImage')
    .optional()
    .isURL()
    .withMessage('Cover image must be a valid URL'),
  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),
  body('fileSize')
    .optional()
    .isInt({ min: 1 })
    .withMessage('File size must be a positive integer')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

const seriesIdValidation = [
  param('seriesId')
    .isMongoId()
    .withMessage('Invalid series ID format')
];

const episodeIdValidation = [
  param('episodeId')
    .isMongoId()
    .withMessage('Invalid episode ID format')
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const searchValidation = [
  query('q')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
    .escape()
];

// Series Routes
router.post('/', authenticateToken, createSeriesValidation, seriesController.createSeries);
router.get('/popular', paginationValidation, seriesController.getPopularSeries);
router.get('/search', searchValidation, paginationValidation, seriesController.searchSeries);
router.get('/category/:category', paginationValidation, seriesController.getSeriesByCategory);
router.get('/creator/:creatorId', paginationValidation, seriesController.getSeriesByCreator);
router.get('/followed', authenticateToken, paginationValidation, seriesController.getUserFollowedSeries);
router.get('/:id', idValidation, seriesController.getSeries);
router.put('/:id', authenticateToken, updateSeriesValidation, seriesController.updateSeries);
router.delete('/:id', authenticateToken, idValidation, seriesController.deleteSeries);

// Series Follow Routes
router.post('/:seriesId/follow', authenticateToken, seriesIdValidation, seriesController.followSeries);
router.delete('/:seriesId/follow', authenticateToken, seriesIdValidation, seriesController.unfollowSeries);

// Series Progress Routes
router.get('/:seriesId/progress', authenticateToken, seriesIdValidation, seriesController.getSeriesProgress);
router.post('/:seriesId/progress/:episodeId', authenticateToken, seriesIdValidation, episodeIdValidation, seriesController.updateEpisodeProgress);

// Episode Routes
router.get('/episodes/:id', idValidation, seriesController.getEpisode);
router.get('/:seriesId/episodes', seriesIdValidation, paginationValidation, seriesController.getEpisodesBySeries);
router.post('/episodes', authenticateToken, createEpisodeValidation, seriesController.createEpisode);
router.put('/episodes/:id', authenticateToken, updateEpisodeValidation, seriesController.updateEpisode);
router.delete('/episodes/:id', authenticateToken, idValidation, seriesController.deleteEpisode);

// Analytics Routes
router.get('/:seriesId/analytics', authenticateToken, seriesIdValidation, seriesController.getSeriesAnalytics);

export default router;
