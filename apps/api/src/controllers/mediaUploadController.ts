import { Request, Response } from "express";
import { uploadMediaFromBase64, validateMediaFile, getOptimizedMediaUrl } from "../services/mediaUploadService.js";
import { ContentModel } from "../models/Content.js";
import { AudioTrackModel } from "../models/AudioTrack.js";
import { UserModel } from "../models/User.js";


/**
 * Upload media file (image/video/audio)
 */
export async function uploadMedia(req: Request, res: Response) {
  try {
    console.log("[MediaUploadController] Upload request received");

    // Get authenticated user ID from locals (as used in other controllers)
    const userId = res.locals.auth?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Get user details
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Validate file
    const validation = validateMediaFile(req.file);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Determine resource type from file mimetype
    const mimetype = req.file.mimetype || '';
    let resourceType: 'image' | 'video' | 'audio' = 'image';
    
    if (mimetype.startsWith('video/')) {
      resourceType = 'video';
    } else if (mimetype.startsWith('audio/')) {
      resourceType = 'audio';
    } else if (!mimetype.startsWith('image/')) {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    // Convert buffer to base64 for upload
    const base64Data = req.file.buffer.toString('base64');
    const originalName = req.file.originalname;

    // Upload to Cloudinary with proper resource type mapping
    const uploadResult = await uploadMediaFromBase64(base64Data, originalName, {
      userId: user.id,
      resourceType: resourceType as 'image' | 'video', // Cloudinary doesn't support 'audio' directly
      folder: `maatfeed/${resourceType}s`,
      generateThumbnail: resourceType === 'video'
    });

    console.log("[MediaUploadController] Upload successful:", {
      publicId: uploadResult.publicId,
      resourceType: uploadResult.resourceType,
      url: uploadResult.url
    });

    // Create content record if it's a video or audio file
    if (resourceType === 'video' || resourceType === 'audio') {
      const content = new ContentModel({
        title: req.body.title || originalName,
        description: req.body.description || '',
        mediaType: resourceType,
        mediaUrl: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl || uploadResult.url,
        duration: uploadResult.duration || 0,
        createdBy: user.id,
        processingStatus: 'published',
        isPublic: req.body.isPublic !== false,
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        categories: req.body.categories ? JSON.parse(req.body.categories) : [],
        metadata: {
          originalName,
          fileSize: uploadResult.size,
          format: uploadResult.format,
          width: uploadResult.width,
          height: uploadResult.height,
          cloudinaryPublicId: uploadResult.publicId
        }
      });

      await content.save();

      // If it's audio, also create AudioTrack record
      if (resourceType === 'audio') {
        const audioTrack = new AudioTrackModel({
          title: req.body.title || originalName,
          artist: req.body.artist || user.username,
          mediaUrl: uploadResult.url,
          duration: uploadResult.duration || 0,
          isPublic: req.body.isPublic !== false,
          contentId: content._id,
          createdBy: user.id,
          metadata: {
            originalName,
            fileSize: uploadResult.size,
            format: uploadResult.format,
            cloudinaryPublicId: uploadResult.publicId
          }
        });

        await audioTrack.save();
      }

      return res.status(201).json({
        success: true,
        data: {
          ...uploadResult,
          contentId: content._id,
          contentType: resourceType
        }
      });
    }

    // For images, just return the upload result
    return res.status(201).json({
      success: true,
      data: uploadResult
    });

  } catch (error) {
    console.error("[MediaUploadController] Upload error:", error);
    return res.status(500).json({ 
      error: "Upload failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

/**
 * Get optimized media URL
 */
export async function getOptimizedUrl(req: Request, res: Response) {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: "URL parameter is required" });
    }

    const { width, height, quality, format, crop } = req.query;

    const optimizedUrl = getOptimizedMediaUrl(url, {
      width: width ? parseInt(width as string) : undefined,
      height: height ? parseInt(height as string) : undefined,
      quality: quality as string,
      format: format as string,
      crop: crop as string
    });

    return res.json({
      success: true,
      data: {
        originalUrl: url,
        optimizedUrl,
        transformations: { width, height, quality, format, crop }
      }
    });

  } catch (error) {
    console.error("[MediaUploadController] Optimization error:", error);
    return res.status(500).json({ 
      error: "URL optimization failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

/**
 * Upload multiple media files
 */
export async function uploadMultipleMedia(req: Request, res: Response) {
  try {
    console.log("[MediaUploadController] Multiple upload request received");

    // Get authenticated user
    const userId = res.locals.auth?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Check if files were uploaded
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const results = [];
    const errors = [];

    // Process each file
    for (const file of req.files) {
      try {
        // Validate file
        const validation = validateMediaFile(file);
        if (!validation.valid) {
          errors.push({
            fileName: file.originalname,
            error: validation.error
          });
          continue;
        }

        // Determine resource type
        const mimetype = file.mimetype || '';
        let resourceType: 'image' | 'video' | 'audio' = 'image';
        
        if (mimetype.startsWith('video/')) {
          resourceType = 'video';
        } else if (mimetype.startsWith('audio/')) {
          resourceType = 'audio';
        } else if (!mimetype.startsWith('image/')) {
          errors.push({
            fileName: file.originalname,
            error: "Unsupported file type"
          });
          continue;
        }

        // Upload to Cloudinary
        const base64Data = file.buffer.toString('base64');
        const uploadResult = await uploadMediaFromBase64(base64Data, file.originalname, {
          userId: user.id,
          resourceType: resourceType as 'image' | 'video', // Cloudinary limitation
          folder: `maatfeed/${resourceType}s`,
          generateThumbnail: resourceType === 'video'
        });

        results.push({
          fileName: file.originalname,
          success: true,
          data: uploadResult
        });

      } catch (error) {
        errors.push({
          fileName: file.originalname,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    console.log("[MediaUploadController] Multiple upload completed:", {
      totalFiles: req.files.length,
      successful: results.length,
      failed: errors.length
    });

    return res.status(201).json({
      success: true,
      data: {
        results,
        errors,
        summary: {
          total: req.files.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });

  } catch (error) {
    console.error("[MediaUploadController] Multiple upload error:", error);
    return res.status(500).json({ 
      error: "Multiple upload failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

/**
 * Get upload status and progress
 */
export async function getUploadStatus(req: Request, res: Response) {
  try {
    const { uploadId } = req.params;

    // This is a placeholder for upload status tracking
    // In a real implementation, you'd track upload progress in Redis or a database
    return res.json({
      success: true,
      data: {
        uploadId,
        status: "completed",
        progress: 100,
        message: "Upload completed successfully"
      }
    });

  } catch (error) {
    console.error("[MediaUploadController] Status check error:", error);
    return res.status(500).json({ 
      error: "Status check failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
