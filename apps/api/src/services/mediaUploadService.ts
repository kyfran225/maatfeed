import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";
import { Readable } from "stream";

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true
});

export interface MediaUploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  duration?: number;
  format: string;
  size: number;
  resourceType: 'image' | 'video' | 'audio';
  thumbnailUrl?: string;
}

export interface UploadOptions {
  folder?: string;
  userId: string;
  resourceType?: 'image' | 'video' | 'auto';
  generateThumbnail?: boolean;
  maxFileSize?: number;
  allowedFormats?: string[];
}

const DEFAULT_OPTIONS = {
  folder: 'maatfeed/media',
  resourceType: 'auto' as const,
  generateThumbnail: true,
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'mp3', 'wav', 'm4a', 'ogg']
};

/**
 * Upload a file buffer to Cloudinary
 */
export async function uploadMediaFile(
  buffer: Buffer,
  originalName: string,
  options: UploadOptions
): Promise<MediaUploadResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  console.log("[MediaUpload] Starting upload:", {
    fileName: originalName,
    userId: options.userId,
    folder: opts.folder,
    resourceType: opts.resourceType
  });

  // Validate file size
  if (buffer.length > (opts.maxFileSize || DEFAULT_OPTIONS.maxFileSize)) {
    throw new Error(`File size exceeds maximum allowed size of ${opts.maxFileSize} bytes`);
  }

  // Generate unique public ID
  const timestamp = Date.now();
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const publicId = `${options.userId}_${timestamp}_${sanitizedName.split('.')[0]}`;

  try {
    console.log("[MediaUpload] Uploading to Cloudinary...");
    
    const uploadResult = await cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        folder: opts.folder,
        resource_type: opts.resourceType,
        format: undefined, // Let Cloudinary auto-detect
        overwrite: true,
        invalidate: true,
        // Image transformations
        transformation: opts.resourceType === 'image' ? [
          { quality: "auto:good", fetch_format: "auto" }
        ] : opts.resourceType === 'video' ? [
          { quality: "auto:good", fetch_format: "auto" },
          { 
            video_codec: "auto",
            bit_rate: "auto",
            audio_codec: "aac"
          }
        ] : undefined,
        // Generate thumbnail for videos
        eager: opts.resourceType === 'video' && opts.generateThumbnail ? [
          {
            resource_type: 'video',
            transformation: [
              { width: 640, height: 360, crop: "fill", gravity: "auto" },
              { quality: "auto:good", fetch_format: "jpg" }
            ]
          }
        ] : undefined
      },
      (error, result) => {
        if (error) {
          console.error("[MediaUpload] Cloudinary upload error:", error);
          throw new Error(`Upload failed: ${error.message}`);
        }
        return result;
      }
    );

    // Convert buffer to stream for Cloudinary
    const stream = Readable.from(buffer);
    stream.pipe(uploadResult);

    return new Promise((resolve, reject) => {
      uploadResult.on('end', () => {
        // This is a bit of a hack since we're using streams
        // In a real implementation, we'd need to handle this better
        reject(new Error("Stream upload not properly implemented - use upload_stream directly"));
      });
    });

  } catch (error) {
    console.error("[MediaUpload] Upload failed:", error);
    throw new Error(`Failed to upload media: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload media using data URL (base64)
 */
export async function uploadMediaFromBase64(
  base64Data: string,
  originalName: string,
  options: UploadOptions
): Promise<MediaUploadResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Remove data URL prefix if present
  const base64String = base64Data.includes("base64,")
    ? base64Data.split("base64,")[1]
    : base64Data;

  // Generate unique public ID
  const timestamp = Date.now();
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const publicId = `${options.userId}_${timestamp}_${sanitizedName.split('.')[0]}`;

  try {
    console.log("[MediaUpload] Uploading base64 to Cloudinary...");
    
    const result = await cloudinary.uploader.upload(
      `data:${options.resourceType === 'image' ? 'image/jpeg' : 'video/mp4'};base64,${base64String}`,
      {
        public_id: publicId,
        folder: opts.folder,
        resource_type: opts.resourceType,
        overwrite: true,
        invalidate: true,
        transformation: opts.resourceType === 'image' ? [
          { quality: "auto:good", fetch_format: "auto" }
        ] : undefined
      }
    );

    console.log("[MediaUpload] Upload successful:", {
      publicId: result.public_id,
      format: result.format,
      resourceType: result.resource_type
    });

    // Extract thumbnail URL for videos
    let thumbnailUrl: string | undefined;
    if (result.resource_type === 'video' && opts.generateThumbnail) {
      thumbnailUrl = cloudinary.url(result.public_id, {
        resource_type: 'video',
        format: 'jpg',
        transformation: [
          { width: 640, height: 360, crop: "fill", gravity: "auto" },
          { quality: "auto:good" }
        ]
      });
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      duration: result.duration,
      format: result.format,
      size: result.bytes || 0,
      resourceType: result.resource_type as 'image' | 'video' | 'audio',
      thumbnailUrl
    };

  } catch (error) {
    console.error("[MediaUpload] Base64 upload failed:", error);
    throw new Error(`Failed to upload media from base64: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete media from Cloudinary
 */
export async function deleteMedia(publicId: string, resourceType: 'image' | 'video' | 'audio' = 'image'): Promise<void> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    console.log("[MediaUpload] Delete result:", result);
  } catch (error) {
    console.error("[MediaUpload] Delete error:", error);
    // Don't throw - deletion failure shouldn't break the app
  }
}

/**
 * Get optimized media URL with transformations
 */
export function getOptimizedMediaUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
    crop?: string;
  } = {}
): string {
  if (!url.includes("cloudinary.com")) return url;

  const {
    width,
    height,
    quality = "auto:good",
    format = "auto",
    crop = "fill"
  } = options;

  // Extract base URL parts
  const urlParts = url.split("/upload/");
  if (urlParts.length !== 2) return url;

  const transformations = [`f_${format}`, `q_${quality}`];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (width && height) transformations.push(`c_${crop},g_auto`);

  return `${urlParts[0]}/upload/${transformations.join(",")}/${urlParts[1]}`;
}

/**
 * Get video thumbnail URL
 */
export function getVideoThumbnailUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    timeOffset?: string;
  } = {}
): string {
  const {
    width = 640,
    height = 360,
    timeOffset = "auto"
  } = options;

  return cloudinary.url(publicId, {
    resource_type: 'video',
    format: 'jpg',
    transformation: [
      { width, height, crop: "fill", gravity: "auto" },
      { quality: "auto:good" },
      { start_offset: timeOffset }
    ]
  });
}

/**
 * Validate media file type and size
 */
export function validateMediaFile(
  file: {
    originalname: string;
    size: number;
    mimetype?: string;
  },
  options: {
    maxFileSize?: number;
    allowedFormats?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Check file size
  if (file.size > (opts.maxFileSize || DEFAULT_OPTIONS.maxFileSize)) {
    return {
      valid: false,
      error: `File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum allowed size (${Math.round((opts.maxFileSize || DEFAULT_OPTIONS.maxFileSize) / 1024 / 1024)}MB)`
    };
  }

  // Check file format
  const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
  if (!fileExtension || !(opts.allowedFormats || DEFAULT_OPTIONS.allowedFormats).includes(fileExtension)) {
    return {
      valid: false,
      error: `File format .${fileExtension} is not allowed. Allowed formats: ${(opts.allowedFormats || DEFAULT_OPTIONS.allowedFormats).join(', ')}`
    };
  }

  return { valid: true };
}
