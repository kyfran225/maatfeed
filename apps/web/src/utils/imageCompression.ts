/**
 * Image compression utility for MAAT FEED
 * Compresses images client-side before upload to reduce bandwidth and storage
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 - 1.0
  maxSizeMB?: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.8,
  maxSizeMB: 1, // Target 1MB max
};

/**
 * Compress an image file using canvas
 * Returns compressed base64 data URL and File object
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<{ base64Url: string; compressedFile: File; originalSize: number; compressedSize: number }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = calculateDimensions(
        img.width,
        img.height,
        opts.maxWidth!,
        opts.maxHeight!
      );
      
      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Use better quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to base64 with compression
      const base64Url = canvas.toDataURL('image/jpeg', opts.quality);
      
      // Calculate sizes
      const originalSize = file.size;
      const compressedSize = Math.round((base64Url.length * 3) / 4); // Approximate binary size from base64
      
      // Create a File object from the compressed image (for consistency with API)
      const byteString = atob(base64Url.split(',')[1]);
      const mimeString = base64Url.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      const compressedBlob = new Blob([ab], { type: mimeString });
      const compressedFile = new File(
        [compressedBlob], 
        `compressed_${file.name.replace(/\.[^/.]+$/, '')}.jpg`, 
        { type: 'image/jpeg' }
      );
      
      resolve({
        base64Url,
        compressedFile,
        originalSize,
        compressedSize
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Calculate new dimensions maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = originalWidth;
  let height = originalHeight;
  
  // Scale down if necessary
  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }
  
  if (height > maxHeight) {
    width = Math.round((width * maxHeight) / height);
    height = maxHeight;
  }
  
  return { width, height };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if image needs compression (over target size)
 */
export function needsCompression(file: File, maxSizeMB: number = 1): boolean {
  return file.size > maxSizeMB * 1024 * 1024;
}
