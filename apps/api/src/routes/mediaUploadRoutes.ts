import { Router } from "express";
import multer from "multer";
import {
  uploadMedia,
  uploadMultipleMedia,
  getOptimizedUrl,
  getUploadStatus
} from "../controllers/mediaUploadController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
    files: 10 // Max 10 files at once
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
      // Images
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      // Videos
      'video/mp4',
      'video/mov',
      'video/avi',
      'video/webm',
      // Audio
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/m4a',
      'audio/ogg'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
  }
});

// POST /api/upload/media - Upload single media file
router.post("/media", requireAuth, upload.single('file'), uploadMedia);

// POST /api/upload/multiple - Upload multiple media files
router.post("/multiple", requireAuth, upload.array('files', 10), uploadMultipleMedia);

// GET /api/upload/optimize - Get optimized media URL
router.get("/optimize", getOptimizedUrl);

// GET /api/upload/status/:uploadId - Get upload status
router.get("/status/:uploadId", getUploadStatus);

export default router;
