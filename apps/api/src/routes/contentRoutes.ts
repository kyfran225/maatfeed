import { Router } from 'express';
import { ContentController } from '../controllers/contentController.js';

const router = Router();
const contentController = new ContentController();

/**
 * Content routes
 * Base path: /api/content
 */

// GET /api/content/:id - Get single content by ID
router.get('/:id', contentController.getContentById.bind(contentController));

export { router as contentRouter };
