import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Image, 
  File, 
  Send, 
  X, 
  Pause, 
  Play,
  Square,
  RotateCw,
  Upload,
  Trash2,
  AlertCircle,
  Check
} from 'lucide-react';
import { 
  audioRecordingService, 
  AudioRecordingState, 
  AudioRecordingResult,
  isAudioRecordingSupported 
} from '../../services/audioRecordingService';
import { 
  videoRecordingService, 
  VideoRecordingState, 
  VideoRecordingResult,
  isVideoRecordingSupported 
} from '../../services/videoRecordingService';

export interface ResponseComposerProps {
  onSubmit: (response: MultimodalResponse) => void;
  onCancel?: () => void;
  placeholder?: string;
  maxLength?: number;
  allowText?: boolean;
  allowAudio?: boolean;
  allowVideo?: boolean;
  allowImages?: boolean;
  allowDocuments?: boolean;
  maxFileSize?: number; // bytes
  maxAudioDuration?: number; // seconds
  maxVideoDuration?: number; // seconds
  disabled?: boolean;
  loading?: boolean;
}

export interface MultimodalResponse {
  text?: string;
  audio?: AudioRecordingResult;
  video?: VideoRecordingResult;
  images?: File[];
  documents?: File[];
  createdAt: Date;
}

interface MediaPreview {
  type: 'audio' | 'video' | 'image' | 'document';
  url?: string;
  file?: File;
  duration?: number;
  size?: number;
  name?: string;
}

export const ResponseComposer: React.FC<ResponseComposerProps> = ({
  onSubmit,
  onCancel,
  placeholder = "Partagez votre réponse...",
  maxLength = 2000,
  allowText = true,
  allowAudio = true,
  allowVideo = true,
  allowImages = true,
  allowDocuments = true,
  maxFileSize = 50 * 1024 * 1024, // 50MB
  maxAudioDuration = 300, // 5 minutes
  maxVideoDuration = 600, // 10 minutes
  disabled = false,
  loading = false
}) => {
  // Text state
  const [text, setText] = useState('');
  const [isTextFocused, setIsTextFocused] = useState(false);
  
  // Audio recording state
  const [audioState, setAudioState] = useState<AudioRecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    volume: 0
  });
  const [audioResult, setAudioResult] = useState<AudioRecordingResult | null>(null);
  
  // Video recording state
  const [videoState, setVideoState] = useState<VideoRecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    cameraActive: false,
    microphoneActive: false
  });
  const [videoResult, setVideoResult] = useState<VideoRecordingResult | null>(null);
  const [videoPreview, setVideoPreview] = useState<HTMLVideoElement | null>(null);
  
  // File uploads state
  const [mediaPreviews, setMediaPreviews] = useState<MediaPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'text' | 'audio' | 'video' | 'media'>('text');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize recording services
  useEffect(() => {
    const initServices = async () => {
      try {
        if (allowAudio && isAudioRecordingSupported()) {
          await audioRecordingService.initialize({
            maxDuration: maxAudioDuration
          });
          
          audioRecordingService.addEventListener('onStateChange', setAudioState);
          audioRecordingService.addEventListener('onVolumeChange', (volume) => {
            setAudioState(prev => ({ ...prev, volume }));
          });
          audioRecordingService.addEventListener('onDurationChange', (duration) => {
            setAudioState(prev => ({ ...prev, duration }));
          });
          audioRecordingService.addEventListener('onError', (error) => {
            setError(error);
          });
        }

        if (allowVideo && isVideoRecordingSupported()) {
          await videoRecordingService.initialize({
            maxDuration: maxVideoDuration
          });
          
          videoRecordingService.addEventListener('onStateChange', setVideoState);
          videoRecordingService.addEventListener('onDurationChange', (duration) => {
            setVideoState(prev => ({ ...prev, duration }));
          });
          videoRecordingService.addEventListener('onError', (error) => {
            setError(error);
          });
        }
      } catch (error) {
        console.error('Failed to initialize recording services:', error);
      }
    };

    initServices();

    return () => {
      audioRecordingService.cleanup();
      videoRecordingService.cleanup();
    };
  }, [allowAudio, allowVideo, maxAudioDuration, maxVideoDuration]);

  // Audio recording handlers
  const handleStartAudioRecording = useCallback(async () => {
    try {
      setError(null);
      await audioRecordingService.startRecording();
    } catch (error) {
      setError('Failed to start audio recording');
    }
  }, []);

  const handlePauseAudioRecording = useCallback(() => {
    audioRecordingService.pauseRecording();
  }, []);

  const handleResumeAudioRecording = useCallback(() => {
    audioRecordingService.resumeRecording();
  }, []);

  const handleStopAudioRecording = useCallback(async () => {
    try {
      const result = await audioRecordingService.stopRecording();
      setAudioResult(result);
      setActiveTab('text'); // Switch back to text tab
    } catch (error) {
      setError('Failed to stop audio recording');
    }
  }, []);

  const handleCancelAudioRecording = useCallback(() => {
    audioRecordingService.cancelRecording();
    setAudioResult(null);
  }, []);

  // Video recording handlers
  const handleStartVideoRecording = useCallback(async () => {
    try {
      setError(null);
      await videoRecordingService.startRecording();
    } catch (error) {
      setError('Failed to start video recording');
    }
  }, []);

  const handlePauseVideoRecording = useCallback(() => {
    videoRecordingService.pauseRecording();
  }, []);

  const handleResumeVideoRecording = useCallback(() => {
    videoRecordingService.resumeRecording();
  }, []);

  const handleStopVideoRecording = useCallback(async () => {
    try {
      const result = await videoRecordingService.stopRecording();
      setVideoResult(result);
      setActiveTab('text'); // Switch back to text tab
    } catch (error) {
      setError('Failed to stop video recording');
    }
  }, []);

  const handleCancelVideoRecording = useCallback(() => {
    videoRecordingService.cancelRecording();
    setVideoResult(null);
  }, []);

  const handleToggleCamera = useCallback(() => {
    videoRecordingService.toggleCamera();
  }, []);

  const handleToggleMicrophone = useCallback(() => {
    videoRecordingService.toggleMicrophone();
  }, []);

  const handleSwitchCamera = useCallback(async () => {
    await videoRecordingService.switchCamera();
  }, []);

  // File upload handlers
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const newPreviews: MediaPreview[] = [];
    const validFiles: File[] = [];

    Array.from(files).forEach(file => {
      // Check file size
      if (file.size > maxFileSize) {
        setError(`File ${file.name} is too large. Maximum size is ${maxFileSize / 1024 / 1024}MB`);
        return;
      }

      // Determine file type
      if (file.type.startsWith('image/')) {
        if (!allowImages) return;
        const url = URL.createObjectURL(file);
        newPreviews.push({
          type: 'image',
          url,
          file,
          size: file.size,
          name: file.name
        });
      } else if (file.type.startsWith('video/')) {
        if (!allowVideo) return;
        const url = URL.createObjectURL(file);
        newPreviews.push({
          type: 'video',
          url,
          file,
          size: file.size,
          name: file.name
        });
      } else if (file.type.startsWith('audio/')) {
        if (!allowAudio) return;
        const url = URL.createObjectURL(file);
        newPreviews.push({
          type: 'audio',
          url,
          file,
          size: file.size,
          name: file.name
        });
      } else {
        if (!allowDocuments) return;
        newPreviews.push({
          type: 'document',
          file,
          size: file.size,
          name: file.name
        });
      }

      validFiles.push(file);
    });

    setMediaPreviews(prev => [...prev, ...newPreviews]);
    setActiveTab('text');
  }, [allowImages, allowVideo, allowAudio, allowDocuments, maxFileSize]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleRemoveMedia = useCallback((index: number) => {
    setMediaPreviews(prev => {
      const newPreviews = [...prev];
      const removed = newPreviews.splice(index, 1)[0];
      if (removed.url) {
        URL.revokeObjectURL(removed.url);
      }
      return newPreviews;
    });
  }, []);

  const handleClearAudio = useCallback(() => {
    if (audioResult?.url) {
      URL.revokeObjectURL(audioResult.url);
    }
    setAudioResult(null);
  }, [audioResult]);

  const handleClearVideo = useCallback(() => {
    if (videoResult?.videoUrl) {
      URL.revokeObjectURL(videoResult.videoUrl);
    }
    setVideoResult(null);
  }, [videoResult]);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (disabled || loading || isSubmitting) return;

    // Validate at least one type of content
    const hasContent = 
      text.trim() || 
      audioResult || 
      videoResult || 
      mediaPreviews.length > 0;

    if (!hasContent) {
      setError('Please add text, audio, video, or media to your response');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response: MultimodalResponse = {
        text: text.trim() || undefined,
        audio: audioResult || undefined,
        video: videoResult || undefined,
        images: mediaPreviews.filter(p => p.type === 'image').map(p => p.file!).filter(Boolean),
        documents: mediaPreviews.filter(p => p.type === 'document').map(p => p.file!).filter(Boolean),
        createdAt: new Date()
      };

      await onSubmit(response);
      
      // Reset form
      setText('');
      setMediaPreviews([]);
      handleClearAudio();
      handleClearVideo();
      setActiveTab('text');
      
    } catch (error) {
      setError('Failed to submit response');
    } finally {
      setIsSubmitting(false);
    }
  }, [disabled, loading, isSubmitting, text, audioResult, videoResult, mediaPreviews, onSubmit, handleClearAudio, handleClearVideo]);

  // Format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Error display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 flex items-center gap-2">
          <AlertCircle size={16} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex border-b border-gray-800">
        {allowText && (
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'text' 
                ? 'text-[#FF6B35] border-b-2 border-[#FF6B35]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Texte
          </button>
        )}
        {allowAudio && isAudioRecordingSupported() && (
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'audio' 
                ? 'text-[#FF6B35] border-b-2 border-[#FF6B35]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Audio
          </button>
        )}
        {allowVideo && isVideoRecordingSupported() && (
          <button
            onClick={() => setActiveTab('video')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'video' 
                ? 'text-[#FF6B35] border-b-2 border-[#FF6B35]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Vidéo
          </button>
        )}
        {(allowImages || allowDocuments) && (
          <button
            onClick={() => setActiveTab('media')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'media' 
                ? 'text-[#FF6B35] border-b-2 border-[#FF6B35]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Médias
          </button>
        )}
      </div>

      {/* Content area */}
      <div className="p-4">
        {/* Text tab */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, maxLength))}
              onFocus={() => setIsTextFocused(true)}
              onBlur={() => setIsTextFocused(false)}
              placeholder={placeholder}
              className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]"
              maxLength={maxLength}
              disabled={disabled}
            />
            
            {/* Character count */}
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{text.length} / {maxLength} caractères</span>
              {text.length > maxLength * 0.9 && (
                <span className="text-orange-400">Limite proche</span>
              )}
            </div>
          </div>
        )}

        {/* Audio tab */}
        {activeTab === 'audio' && (
          <div className="space-y-4">
            {!audioResult ? (
              <div className="text-center py-8">
                {/* Recording controls */}
                <div className="flex justify-center items-center gap-4 mb-6">
                  {!audioState.isRecording ? (
                    <button
                      onClick={handleStartAudioRecording}
                      disabled={disabled}
                      className="w-16 h-16 bg-[#FF6B35] hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                      <Mic size={24} className="text-white" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={audioState.isPaused ? handleResumeAudioRecording : handlePauseAudioRecording}
                        className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
                      >
                        {audioState.isPaused ? <Play size={20} className="text-white" /> : <Pause size={20} className="text-white" />}
                      </button>
                      <button
                        onClick={handleStopAudioRecording}
                        className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                      >
                        <Square size={20} className="text-white" />
                      </button>
                      <button
                        onClick={handleCancelAudioRecording}
                        className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
                      >
                        <X size={20} className="text-white" />
                      </button>
                    </>
                  )}
                </div>

                {/* Status display */}
                <div className="space-y-2">
                  <div className="text-white font-medium">
                    {audioState.isRecording ? (audioState.isPaused ? 'En pause' : 'Enregistrement...') : 'Prêt à enregistrer'}
                  </div>
                  
                  {/* Duration */}
                  {audioState.isRecording && (
                    <div className="text-2xl font-mono text-[#FF6B35]">
                      {formatDuration(audioState.duration)}
                    </div>
                  )}

                  {/* Volume indicator */}
                  {audioState.isRecording && (
                    <div className="flex justify-center">
                      <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#FF6B35] transition-all duration-100"
                          style={{ width: `${audioState.volume}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Max duration warning */}
                  {audioState.duration > maxAudioDuration * 0.8 && (
                    <div className="text-orange-400 text-sm">
                      Durée maximale approchée ({maxAudioDuration}s)
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Audio preview */
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FF6B35] rounded-full flex items-center justify-center">
                      <Mic size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Audio enregistré</div>
                      <div className="text-gray-400 text-sm">
                        {formatDuration(audioResult.duration)} • {formatFileSize(audioResult.size)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleClearAudio}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                {/* Audio player */}
                <audio 
                  ref={audioRef}
                  src={audioResult.url}
                  controls
                  className="w-full"
                />
              </div>
            )}
          </div>
        )}

        {/* Video tab */}
        {activeTab === 'video' && (
          <div className="space-y-4">
            {!videoResult ? (
              <div className="space-y-4">
                {/* Video preview */}
                <div className="relative bg-black rounded-lg overflow-hidden aspect-[9/16] max-h-96">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Recording overlay */}
                  {videoState.isRecording && (
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-white text-sm font-medium">
                        {videoState.isPaused ? 'En pause' : 'Enregistrement...'}
                      </span>
                    </div>
                  )}

                  {/* Duration display */}
                  {videoState.isRecording && (
                    <div className="absolute bottom-4 right-4 bg-black/50 px-2 py-1 rounded">
                      <span className="text-white text-sm font-mono">
                        {formatDuration(videoState.duration)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Recording controls */}
                <div className="flex justify-center items-center gap-4">
                  {!videoState.isRecording ? (
                    <button
                      onClick={handleStartVideoRecording}
                      disabled={disabled}
                      className="w-16 h-16 bg-[#FF6B35] hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                      <Video size={24} className="text-white" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={videoState.isPaused ? handleResumeVideoRecording : handlePauseVideoRecording}
                        className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
                      >
                        {videoState.isPaused ? <Play size={20} className="text-white" /> : <Pause size={20} className="text-white" />}
                      </button>
                      <button
                        onClick={handleStopVideoRecording}
                        className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                      >
                        <Square size={20} className="text-white" />
                      </button>
                      <button
                        onClick={handleCancelVideoRecording}
                        className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
                      >
                        <X size={20} className="text-white" />
                      </button>
                    </>
                  )}
                </div>

                {/* Additional controls */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleToggleCamera}
                    className={`p-2 rounded-lg transition-colors ${
                      videoState.cameraActive 
                        ? 'bg-[#FF6B35] text-white' 
                        : 'bg-gray-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    {videoState.cameraActive ? <Video size={18} /> : <VideoOff size={18} />}
                  </button>
                  <button
                    onClick={handleToggleMicrophone}
                    className={`p-2 rounded-lg transition-colors ${
                      videoState.microphoneActive 
                        ? 'bg-[#FF6B35] text-white' 
                        : 'bg-gray-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    {videoState.microphoneActive ? <Mic size={18} /> : <MicOff size={18} />}
                  </button>
                  <button
                    onClick={handleSwitchCamera}
                    className="p-2 bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                  >
                    <RotateCw size={18} />
                  </button>
                </div>

                {/* Max duration warning */}
                {videoState.duration > maxVideoDuration * 0.8 && (
                  <div className="text-orange-400 text-sm text-center">
                    Durée maximale approchée ({maxVideoDuration}s)
                  </div>
                )}
              </div>
            ) : (
              /* Video preview */
              <div className="space-y-4">
                <div className="relative">
                  <video
                    src={videoResult.videoUrl}
                    controls
                    className="w-full rounded-lg"
                  />
                  <button
                    onClick={handleClearVideo}
                    className="absolute top-2 right-2 p-2 bg-black/50 text-white hover:bg-black/70 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <div className="text-center text-gray-400 text-sm">
                  {formatDuration(videoResult.duration)} • {formatFileSize(videoResult.size)} • {videoResult.width}x{videoResult.height}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Media tab */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            {/* Drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-[#FF6B35] bg-[#FF6B35]/5' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <Upload size={48} className="mx-auto mb-4 text-gray-500" />
              <div className="text-white font-medium mb-2">
                {isDragging ? 'Déposez les fichiers ici' : 'Glissez-déposez les fichiers ici'}
              </div>
              <div className="text-gray-400 text-sm mb-4">
                ou
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-[#FF6B35] hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
              >
                Parcourir les fichiers
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={
                  (allowImages ? 'image/*,' : '') +
                  (allowVideo ? 'video/*,' : '') +
                  (allowAudio ? 'audio/*,' : '') +
                  (allowDocuments ? '.pdf,.doc,.docx,.txt' : '')
                }
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
              <div className="text-gray-500 text-xs mt-4">
                Taille maximale: {formatFileSize(maxFileSize)}
              </div>
            </div>

            {/* Media previews */}
            {mediaPreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {mediaPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    {preview.type === 'image' && preview.url && (
                      <img
                        src={preview.url}
                        alt={preview.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                    {preview.type === 'video' && preview.url && (
                      <video
                        src={preview.url}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                    {preview.type === 'audio' && (
                      <div className="w-full h-32 bg-gray-800 rounded-lg flex items-center justify-center">
                        <File size={32} className="text-gray-500" />
                      </div>
                    )}
                    {preview.type === 'document' && (
                      <div className="w-full h-32 bg-gray-800 rounded-lg flex flex-col items-center justify-center p-4">
                        <File size={32} className="text-gray-500 mb-2" />
                        <div className="text-gray-400 text-xs text-center truncate w-full">
                          {preview.name}
                        </div>
                      </div>
                    )}
                    
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveMedia(index)}
                      className="absolute top-2 right-2 p-1 bg-black/50 text-white hover:bg-black/70 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                    
                    {/* File info */}
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {preview.name && (
                        <div className="truncate max-w-[120px]">{preview.name}</div>
                      )}
                      {preview.size && (
                        <div>{formatFileSize(preview.size)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2">
            {/* Summary of content */}
            {(text.trim() || audioResult || videoResult || mediaPreviews.length > 0) && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                {text.trim() && <span>Texte</span>}
                {audioResult && <span>Audio</span>}
                {videoResult && <span>Vidéo</span>}
                {mediaPreviews.length > 0 && <span>{mediaPreviews.length} fichier(s)</span>}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {onCancel && (
              <button
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={disabled || loading || isSubmitting || (!text.trim() && !audioResult && !videoResult && mediaPreviews.length === 0)}
              className="px-6 py-2 bg-[#FF6B35] hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Envoyer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
