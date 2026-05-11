import { Router } from 'express';
import { ContentController } from '../../controllers/contentController';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();
const contentController = new ContentController();

// Public routes
router.get('/:id', contentController.getContentById.bind(contentController));

// Protected routes (à implémenter plus tard)
router.use(authenticateToken);
// router.post('/', contentController.createContent.bind(contentController));
// router.put('/:id', contentController.updateContent.bind(contentController));
// router.delete('/:id', contentController.deleteContent.bind(contentController));

export default router;
