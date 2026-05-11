/**
 * Audio Recording Service with WebRTC
 * Optimized for mobile Africa with compression and quality settings
 */

export interface AudioRecordingOptions {
  mimeType?: string;
  sampleRate?: number;
  bitRate?: number;
  maxDuration?: number; // seconds
  compressionQuality?: number; // 0.0 to 1.0
}

export interface AudioRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  volume: number;
  error?: string;
}

export interface AudioRecordingResult {
  blob: Blob;
  url: string;
  duration: number;
  size: number;
  format: string;
}

class AudioRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private startTime: number = 0;
  private pauseTime: number = 0;
  private animationFrameId: number | null = null;
  
  // Event listeners
  private listeners: {
    onStateChange?: (state: AudioRecordingState) => void;
    onVolumeChange?: (volume: number) => void;
    onDurationChange?: (duration: number) => void;
    onError?: (error: string) => void;
  } = {};

  /**
   * Initialize audio recording with optimized settings for mobile
   */
  async initialize(options: AudioRecordingOptions = {}): Promise<void> {
    try {
      // Default options optimized for mobile Africa
      const defaultOptions: AudioRecordingOptions = {
        mimeType: this.getBestSupportedMimeType(),
        sampleRate: 22050, // Lower sample rate for mobile data saving
        bitRate: 32000, // Lower bitrate for mobile networks
        maxDuration: 300, // 5 minutes max
        compressionQuality: 0.7 // Good quality with compression
      };

      const finalOptions = { ...defaultOptions, ...options };

      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: finalOptions.sampleRate
        }
      });

      // Setup audio context for volume monitoring
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      this.microphone.connect(this.analyser);

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

      this.updateState({ isRecording: false, isPaused: false, duration: 0, volume: 0 });

    } catch (error) {
      this.handleError('Failed to initialize audio recording: ' + (error as Error).message);
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
      this.mediaRecorder.start(100); // Collect data every 100ms
      this.startVolumeMonitoring();
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
    this.stopVolumeMonitoring();
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
    this.startVolumeMonitoring();
    this.updateState({ isRecording: true, isPaused: false });
  }

  /**
   * Stop recording and return the audio blob
   */
  async stopRecording(): Promise<AudioRecordingResult> {
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
        this.stopVolumeMonitoring();
        this.updateState({ isRecording: false, isPaused: false, duration: 0, volume: 0 });

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
    this.stopVolumeMonitoring();
    this.updateState({ isRecording: false, isPaused: false, duration: 0, volume: 0 });
  }

  /**
   * Get current recording state
   */
  getState(): AudioRecordingState {
    return {
      isRecording: this.mediaRecorder?.state === 'recording',
      isPaused: this.mediaRecorder?.state === 'paused',
      duration: this.getDuration(),
      volume: this.getVolume()
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

    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.mediaRecorder = null;
    this.chunks = [];
  }

  // Private methods

  private getBestSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm'; // Fallback
  }

  private startVolumeMonitoring(): void {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const monitor = () => {
      if (!this.analyser) return;

      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      const volume = Math.min(100, (average / 128) * 100);

      this.listeners.onVolumeChange?.(volume);
      
      // Update duration
      if (this.mediaRecorder?.state === 'recording') {
        this.listeners.onDurationChange?.(this.getDuration());
      }

      this.animationFrameId = requestAnimationFrame(monitor);
    };

    monitor();
  }

  private stopVolumeMonitoring(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private getDuration(): number {
    if (this.startTime === 0) return 0;
    
    const currentTime = this.pauseTime > 0 ? this.pauseTime : Date.now();
    return Math.floor((currentTime - this.startTime) / 1000);
  }

  private getVolume(): number {
    if (!this.analyser) return 0;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }

    return Math.min(100, (sum / bufferLength / 128) * 100);
  }

  private handleRecordingStop(): void {
    // This is called when MediaRecorder stops
  }

  private createRecordingResult(): AudioRecordingResult | null {
    if (this.chunks.length === 0) return null;

    const blob = new Blob(this.chunks, { 
      type: this.mediaRecorder?.mimeType || 'audio/webm' 
    });
    
    const url = URL.createObjectURL(blob);
    const duration = this.getDuration();
    const format = this.mediaRecorder?.mimeType || 'audio/webm';

    return {
      blob,
      url,
      duration,
      size: blob.size,
      format
    };
  }

  private updateState(state: Partial<AudioRecordingState>): void {
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
export const audioRecordingService = new AudioRecordingService();

// Export types and utilities
export type { AudioRecordingService as AudioRecordingServiceClass };

/**
 * Utility function to check if audio recording is supported
 */
export function isAudioRecordingSupported(): boolean {
  return !!(
    navigator.mediaDevices && 
    'getUserMedia' in navigator.mediaDevices && 
    typeof MediaRecorder !== 'undefined'
  );
}

/**
 * Utility function to get recording permissions status
 */
export async function getMicrophonePermission(): Promise<PermissionState> {
  try {
    const permission = await navigator.permissions.query({ name: 'microphone' });
    return permission.state;
  } catch (error) {
    // Fallback for browsers that don't support permissions API
    return 'prompt';
  }
}

/**
 * Utility function to request microphone access
 */
export async function requestMicrophoneAccess(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    return false;
  }
}
