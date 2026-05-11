/**
 * Video Recording Service with MediaRecorder API
 * Optimized for mobile Africa with compression and quality settings
 */

export interface VideoRecordingOptions {
  mimeType?: string;
  videoConstraints?: MediaTrackConstraints;
  audioConstraints?: MediaTrackConstraints;
  maxDuration?: number; // seconds
  compressionQuality?: number; // 0.0 to 1.0
  width?: number;
  height?: number;
  frameRate?: number;
}

export interface VideoRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  error?: string;
  cameraActive: boolean;
  microphoneActive: boolean;
}

export interface VideoRecordingResult {
  videoBlob: Blob;
  videoUrl: string;
  duration: number;
  size: number;
  format: string;
  width: number;
  height: number;
  frameRate: number;
}

class VideoRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private videoTrack: MediaStreamTrack | null = null;
  private audioTrack: MediaStreamTrack | null = null;
  private chunks: Blob[] = [];
  private startTime: number = 0;
  private pauseTime: number = 0;
  private videoElement: HTMLVideoElement | null = null;
  
  // Event listeners
  private listeners: {
    onStateChange?: (state: VideoRecordingState) => void;
    onDurationChange?: (duration: number) => void;
    onError?: (error: string) => void;
    onCameraToggle?: (active: boolean) => void;
    onMicrophoneToggle?: (active: boolean) => void;
  } = {};

  /**
   * Initialize video recording with optimized settings for mobile
   */
  async initialize(options: VideoRecordingOptions = {}): Promise<void> {
    try {
      // Default options optimized for mobile Africa
      const defaultOptions: VideoRecordingOptions = {
        mimeType: this.getBestSupportedMimeType(),
        width: 720, // HD but not too heavy
        height: 1280, // Portrait mode for mobile
        frameRate: 24, // Balanced quality vs size
        maxDuration: 600, // 10 minutes max
        compressionQuality: 0.6,
        videoConstraints: {
          width: { ideal: 720, max: 1080 },
          height: { ideal: 1280, max: 1920 },
          frameRate: { ideal: 24, max: 30 },
          facingMode: 'user', // Front camera by default
          aspectRatio: 9/16 // Portrait mode
        },
        audioConstraints: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 22050
        }
      };

      const finalOptions = { ...defaultOptions, ...options };

      // Request camera and microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: finalOptions.videoConstraints,
        audio: finalOptions.audioConstraints
      });

      // Get tracks for control
      const tracks = this.stream.getTracks();
      this.videoTrack = tracks.find(track => track.kind === 'video') || null;
      this.audioTrack = tracks.find(track => track.kind === 'audio') || null;

      // Setup MediaRecorder with compression
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: finalOptions.mimeType
      });

      // Setup event handlers
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.handleRecordingStop();
      };

      this.mediaRecorder.onerror = (event) => {
        this.handleError('Recording error: ' + (event as any).error);
      };

      this.updateState({ 
        isRecording: false, 
        isPaused: false, 
        duration: 0,
        cameraActive: !!this.videoTrack?.enabled,
        microphoneActive: !!this.audioTrack?.enabled
      });

    } catch (error) {
      this.handleError('Failed to initialize video recording: ' + (error as Error).message);
      throw error;
    }
  }

  /**
   * Start recording
   */
  startRecording(): void {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'recording') {
      return;
    }

    if (this.mediaRecorder.state === 'paused') {
      this.resumeRecording();
      return;
    }

    this.chunks = [];
    this.startTime = Date.now();
    this.pauseTime = 0;

    try {
      this.mediaRecorder.start(1000); // Collect data every 1 second
      this.startDurationMonitoring();
      this.updateState({ isRecording: true, isPaused: false });
    } catch (error) {
      this.handleError('Failed to start recording: ' + (error as Error).message);
    }
  }

  /**
   * Pause recording
   */
  pauseRecording(): void {
    if (!this.mediaRecorder || this.mediaRecorder.state !== 'recording') {
      return;
    }

    this.pauseTime = Date.now();
    this.mediaRecorder.pause();
    this.stopDurationMonitoring();
    this.updateState({ isRecording: true, isPaused: true });
  }

  /**
   * Resume recording
   */
  resumeRecording(): void {
    if (!this.mediaRecorder || this.mediaRecorder.state !== 'paused') {
      return;
    }

    // Adjust start time to account for pause duration
    if (this.pauseTime > 0) {
      this.startTime += Date.now() - this.pauseTime;
      this.pauseTime = 0;
    }

    this.mediaRecorder.resume();
    this.startDurationMonitoring();
    this.updateState({ isRecording: true, isPaused: false });
  }

  /**
   * Stop recording and return video blob
   */
  async stopRecording(): Promise<VideoRecordingResult> {
    if (!this.mediaRecorder || (this.mediaRecorder.state !== 'recording' && this.mediaRecorder.state !== 'paused')) {
      throw new Error('No active recording to stop');
    }

    return new Promise((resolve, reject) => {
      try {
        this.mediaRecorder!.onstop = () => {
          this.handleRecordingStop();
          const result = this.createRecordingResult();
          if (result) {
            resolve(result);
          } else {
            reject(new Error('Failed to create recording result'));
          }
        };

        this.mediaRecorder!.stop();
        this.stopDurationMonitoring();
        this.updateState({ isRecording: false, isPaused: false, duration: 0 });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Cancel recording without saving
   */
  cancelRecording(): void {
    if (this.mediaRecorder && (this.mediaRecorder.state === 'recording' || this.mediaRecorder.state === 'paused')) {
      this.mediaRecorder.stop();
    }
    
    this.chunks = [];
    this.stopDurationMonitoring();
    this.updateState({ isRecording: false, isPaused: false, duration: 0 });
  }

  /**
   * Toggle camera on/off
   */
  toggleCamera(): boolean {
    if (!this.videoTrack) return false;

    const newState = !this.videoTrack.enabled;
    this.videoTrack.enabled = newState;
    
    this.updateState({ cameraActive: newState });
    this.listeners.onCameraToggle?.(newState);
    
    return newState;
  }

  /**
   * Toggle microphone on/off
   */
  toggleMicrophone(): boolean {
    if (!this.audioTrack) return false;

    const newState = !this.audioTrack.enabled;
    this.audioTrack.enabled = newState;
    
    this.updateState({ microphoneActive: newState });
    this.listeners.onMicrophoneToggle?.(newState);
    
    return newState;
  }

  /**
   * Switch between front and back camera
   */
  async switchCamera(): Promise<boolean> {
    if (!this.videoTrack || !this.stream) return false;

    try {
      const currentConstraints = this.videoTrack.getConstraints();
      const currentFacingMode = currentConstraints.facingMode as string || 'user';
      const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

      // Stop current track
      this.videoTrack.stop();

      // Get new stream with opposite camera
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          ...currentConstraints,
          facingMode: newFacingMode
        },
        audio: this.audioTrack ? this.audioTrack.getConstraints() : false
      });

      // Replace track in existing stream
      const newVideoTrack = newStream.getVideoTracks()[0];
      if (newVideoTrack) {
        this.stream.removeTrack(this.videoTrack);
        this.stream.addTrack(newVideoTrack);
        this.videoTrack = newVideoTrack;

        // Update MediaRecorder if needed
        if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
          // Recreate MediaRecorder with new stream
          this.mediaRecorder = new MediaRecorder(this.stream, {
            mimeType: this.mediaRecorder.mimeType
          });
        }
      }

      return true;
    } catch (error) {
      this.handleError('Failed to switch camera: ' + (error as Error).message);
      return false;
    }
  }

  /**
   * Get video preview element
   */
  getVideoPreview(): HTMLVideoElement | null {
    if (!this.videoElement) {
      this.videoElement = document.createElement('video');
      this.videoElement.autoplay = true;
      this.videoElement.muted = true;
      this.videoElement.playsInline = true;
      
      if (this.stream) {
        this.videoElement.srcObject = this.stream;
      }
    }
    
    return this.videoElement;
  }

  /**
   * Get current recording state
   */
  getState(): VideoRecordingState {
    return {
      isRecording: this.mediaRecorder?.state === 'recording',
      isPaused: this.mediaRecorder?.state === 'paused',
      duration: this.getDuration(),
      cameraActive: !!this.videoTrack?.enabled,
      microphoneActive: !!this.audioTrack?.enabled
    };
  }

  /**
   * Add event listener
   */
  addEventListener<K extends keyof typeof this.listeners>(
    event: K,
    callback: NonNullable<typeof this.listeners[K]>
  ): void {
    this.listeners[event] = callback;
  }

  /**
   * Remove event listener
   */
  removeEventListener<K extends keyof typeof this.listeners>(
    event: K
  ): void {
    delete this.listeners[event];
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.cancelRecording();
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }

    this.videoTrack = null;
    this.audioTrack = null;
    this.mediaRecorder = null;
    this.chunks = [];
  }

  // Private methods

  private getBestSupportedMimeType(): string {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm',
      'video/mp4',
      'video/quicktime'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'video/webm'; // Fallback
  }

  private startDurationMonitoring(): void {
    const monitor = () => {
      if (this.mediaRecorder?.state === 'recording') {
        this.listeners.onDurationChange?.(this.getDuration());
        requestAnimationFrame(monitor);
      }
    };

    requestAnimationFrame(monitor);
  }

  private stopDurationMonitoring(): void {
    // Duration monitoring stops automatically when recording stops
  }

  private getDuration(): number {
    if (this.startTime === 0) return 0;
    
    const currentTime = this.pauseTime > 0 ? this.pauseTime : Date.now();
    return Math.floor((currentTime - this.startTime) / 1000);
  }

  private handleRecordingStop(): void {
    // This is called when MediaRecorder stops
  }

  private createRecordingResult(): VideoRecordingResult | null {
    if (this.chunks.length === 0) return null;

    const blob = new Blob(this.chunks, { 
      type: this.mediaRecorder?.mimeType || 'video/webm' 
    });
    
    const url = URL.createObjectURL(blob);
    const duration = this.getDuration();
    const format = this.mediaRecorder?.mimeType || 'video/webm';

    // Get video track settings
    const videoSettings = this.videoTrack?.getSettings();
    const width = videoSettings?.width || 720;
    const height = videoSettings?.height || 1280;
    const frameRate = videoSettings?.frameRate || 24;

    return {
      videoBlob: blob,
      videoUrl: url,
      duration,
      size: blob.size,
      format,
      width,
      height,
      frameRate
    };
  }

  private updateState(state: Partial<VideoRecordingState>): void {
    const currentState = this.getState();
    const newState = { ...currentState, ...state };
    this.listeners.onStateChange?.(newState);
  }

  private handleError(error: string): void {
    this.updateState({ error });
    this.listeners.onError?.(error);
  }
}

// Singleton instance
export const videoRecordingService = new VideoRecordingService();

// Export types and utilities
export type { VideoRecordingService as VideoRecordingServiceClass };

/**
 * Utility function to check if video recording is supported
 */
export function isVideoRecordingSupported(): boolean {
  return !!(
    navigator.mediaDevices && 
    'getUserMedia' in navigator.mediaDevices && 
    typeof MediaRecorder !== 'undefined'
  );
}

/**
 * Utility function to get camera permissions status
 */
export async function getCameraPermission(): Promise<PermissionState> {
  try {
    const permission = await navigator.permissions.query({ name: 'camera' });
    return permission.state;
  } catch (error) {
    // Fallback for browsers that don't support permissions API
    return 'prompt';
  }
}

/**
 * Utility function to request camera access
 */
export async function requestCameraAccess(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Utility function to get available cameras
 */
export async function getAvailableCameras(): Promise<MediaDeviceInfo[]> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'videoinput');
  } catch (error) {
    return [];
  }
}
