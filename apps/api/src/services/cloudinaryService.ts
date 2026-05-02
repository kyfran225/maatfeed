import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true
});

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Upload a base64 image to Cloudinary
 * @param base64Data - Base64 encoded image data (data:image/xxx;base64,...)
 * @param folder - Cloudinary folder path
 * @param userId - User ID for naming
 * @returns Upload result with URL and metadata
 */
export async function uploadBase64Image(
  base64Data: string,
  folder: string = "maatfeed/avatars",
  userId: string
): Promise<UploadResult> {
  console.log("[Cloudinary] Starting upload for user:", userId);
  console.log("[Cloudinary] Folder:", folder);
  console.log("[Cloudinary] Cloud name:", env.CLOUDINARY_CLOUD_NAME);
  
  // Remove data URL prefix if present
  const base64String = base64Data.includes("base64,")
    ? base64Data.split("base64,")[1]
    : base64Data;
  
  console.log("[Cloudinary] Base64 string length:", base64String.length);

  // Generate a unique public_id
  const timestamp = Date.now();
  const publicId = `${userId}_${timestamp}`;
  
  console.log("[Cloudinary] Public ID:", publicId);

  try {
    console.log("[Cloudinary] Calling cloudinary.uploader.upload...");
    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${base64String}`,
      {
        public_id: publicId,
        folder: folder,
        transformation: [
          { width: 512, height: 512, crop: "fill", gravity: "face" },
          { quality: "auto:good", fetch_format: "auto" }
        ],
        overwrite: true
      }
    );
    
    console.log("[Cloudinary] Upload result:", {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    console.error("[Cloudinary] Upload error:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
}

/**
 * Delete an image from Cloudinary
 * @param publicId - Cloudinary public ID
 */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    // Don't throw - deletion failure shouldn't break the app
  }
}

/**
 * Get optimized image URL with transformations
 * @param url - Original Cloudinary URL
 * @param width - Desired width
 * @param height - Desired height
 * @returns Optimized URL
 */
export function getOptimizedUrl(
  url: string,
  width?: number,
  height?: number
): string {
  if (!url.includes("cloudinary.com")) return url;

  // Extract base URL parts
  const urlParts = url.split("/upload/");
  if (urlParts.length !== 2) return url;

  const transformations = ["f_auto", "q_auto:good"];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (width && height) transformations.push("c_fill,g_face");

  return `${urlParts[0]}/upload/${transformations.join(",")}/${urlParts[1]}`;
}
