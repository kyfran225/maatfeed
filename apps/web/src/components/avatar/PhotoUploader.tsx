import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { compressImage, formatFileSize } from "../../utils/imageCompression";

interface PhotoUploaderProps {
  selectedPhoto: string | null;
  onPhotoSelect: (url: string, file: File) => void;
}

export function PhotoUploader({ selectedPhoto, onPhotoSelect }: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<{
    originalSize: number;
    compressedSize: number;
  } | null>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    
    setIsCompressing(true);
    setCompressionInfo(null);
    
    try {
      // Compress image before converting to base64
      const { base64Url, compressedFile, originalSize, compressedSize } = await compressImage(file, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.85,
        maxSizeMB: 1
      });
      
      setCompressionInfo({ originalSize, compressedSize });
      onPhotoSelect(base64Url, compressedFile);
    } catch (error) {
      console.error("Image compression failed:", error);
      // Fallback: use original file if compression fails
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        onPhotoSelect(url, file);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (isCompressing) return;
    fileInputRef.current?.click();
  };

  const handleDropWrapper = (event: React.DragEvent<HTMLDivElement>) => {
    if (isCompressing) return;
    handleDrop(event);
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Preview area */}
      {selectedPhoto ? (
        <div className="flex flex-col items-center gap-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gold/50">
              <img
                src={selectedPhoto}
                alt="Photo sélectionnée"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gold flex items-center justify-center">
              <svg className="w-5 h-5 text-ink" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </motion.div>

          {/* Compression info */}
          {compressionInfo && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <p className="text-xs text-green-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Image optimisée: {formatFileSize(compressionInfo.originalSize)} → {formatFileSize(compressionInfo.compressedSize)}
              </p>
              <p className="text-xs text-sand/50 mt-0.5">
                ({Math.round((1 - compressionInfo.compressedSize / compressionInfo.originalSize) * 100)}% réduction)
              </p>
            </motion.div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleClick}
              className="px-4 py-2 rounded-full bg-white/10 text-sand hover:bg-white/20 transition-colors text-sm"
            >
              Changer la photo
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          {isCompressing ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/90 backdrop-blur-sm rounded-2xl z-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 border-3 border-gold border-t-transparent rounded-full"
              />
              <p className="text-sm text-sand mt-4">Optimisation de l&apos;image...</p>
              <p className="text-xs text-sand/50 mt-1">Compression en cours</p>
            </div>
          ) : null}
          <motion.div
            onClick={handleClick}
            onDrop={handleDropWrapper}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative aspect-video rounded-2xl border-2 border-dashed
              flex flex-col items-center justify-center gap-3
              transition-all duration-300
              ${isDragging
                ? "border-gold bg-gold/10 cursor-pointer"
                : "border-white/30 bg-white/5 hover:border-gold/50 hover:bg-white/10 cursor-pointer"
              }
            `}
          >
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-sand/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>

          <div className="text-center">
            <p className="text-sand font-medium">
              Cliquez pour importer une photo
            </p>
            <p className="text-sm text-sand/50 mt-1">
              ou glissez-déposez ici
            </p>
          </div>

          <p className="text-xs text-sand/40">
            JPG, PNG - Auto-compression activée
          </p>
        </motion.div>
      </div>
    )}
  </div>
);
}
