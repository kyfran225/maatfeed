import { Router } from 'express';
import { SearchController } from '../controllers/searchController.js';

const router = Router();
const searchController = new SearchController();

/**
 * Search routes
 * Base path: /api/search
 */

// GET /api/search?q=query&bucket=viral&page=1&limit=20
router.get('/', searchController.search.bind(searchController));

// GET /api/search/suggestions?q=query
router.get('/suggestions', searchController.getSuggestions.bind(searchController));

export { router as searchRouter };
