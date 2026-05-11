import React, { useState, useCallback, useRef } from 'react';
import { useUploadStore } from '../../stores/uploadStore';
import { CloudUpload, X, Play, Image, Video } from 'lucide-react';

interface MediaUploadProps {
  onUploadComplete?: (results: any[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  className?: string;
}

const ACCEPTED_TYPES = {
  'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  'video/*': ['.mp4', '.mov', '.avi', '.webm'],
  'audio/*': ['.mp3', '.wav', '.m4a', '.ogg']
};

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export function MediaUpload({ 
  onUploadComplete, 
  maxFiles = 10, 
  acceptedTypes = Object.keys(ACCEPTED_TYPES),
  className = ''
}: MediaUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    uploads, 
    isUploading, 
    addFile, 
    removeFile, 
    uploadFiles, 
    clearCompleted 
  } = useUploadStore();

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File ${file.name} is too large. Maximum size is 100MB.`;
    }

    // Check file type
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -2));
      }
      return file.type === type;
    });

    if (!isValidType) {
      return `File ${file.name} has an unsupported type.`;
    }

    return null;
  }, [acceptedTypes]);

  const handleFiles = useCallback((files: FileList) => {
    setError(null);
    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(validationError);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setError(errors.join(' '));
    }

    // Check max files limit
    const totalFiles = uploads.length + validFiles.length;
    if (totalFiles > maxFiles) {
      setError(`Cannot add more than ${maxFiles} files. Current: ${uploads.length}, Adding: ${validFiles.length}`);
      return;
    }

    // Add valid files to store
    validFiles.forEach(file => addFile(file));
  }, [uploads.length, maxFiles, validateFile, addFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleUpload = useCallback(async () => {
    try {
      await uploadFiles();
      
      // Get successful uploads
      const successfulUploads = uploads.filter(upload => upload.status === 'success');
      if (successfulUploads.length > 0 && onUploadComplete) {
        onUploadComplete(successfulUploads.map(upload => ({
          id: upload.id,
          name: upload.name,
          url: upload.url,
          size: upload.size,
          type: upload.type
        })));
      }
      
      // Clear completed uploads after a delay
      setTimeout(() => {
        clearCompleted();
      }, 2000);
    } catch (err) {
      setError('Upload failed. Please try again.');
    }
  }, [uploads, uploadFiles, onUploadComplete, clearCompleted]);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (type.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (type.startsWith('audio/')) return <Play className="w-5 h-5" />;
    return <CloudUpload className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const pendingUploads = uploads.filter(upload => upload.status === 'pending');
  const hasPendingFiles = pendingUploads.length > 0;

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragOver 
            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <CloudUpload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Images, videos, and audio files up to 100MB each
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* File List */}
      {uploads.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Files to Upload ({uploads.length})
            </h3>
            <button
              onClick={() => useUploadStore.getState().clearAll()}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2">
            {uploads.map((upload) => (
              <div
                key={upload.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="text-gray-400 dark:text-gray-500">
                    {getFileIcon(upload.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {upload.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(upload.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Status */}
                  {upload.status === 'pending' && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">Ready</span>
                  )}
                  {upload.status === 'uploading' && (
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${upload.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {upload.progress}%
                      </span>
                    </div>
                  )}
                  {upload.status === 'success' && (
                    <span className="text-xs text-green-600 dark:text-green-400">Uploaded</span>
                  )}
                  {upload.status === 'error' && (
                    <span className="text-xs text-red-600 dark:text-red-400">
                      {upload.error || 'Failed'}
                    </span>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(upload.id)}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    disabled={upload.status === 'uploading'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          {hasPendingFiles && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? 'Uploading...' : `Upload ${pendingUploads.length} File${pendingUploads.length > 1 ? 's' : ''}`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
