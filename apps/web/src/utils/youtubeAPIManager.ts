declare global {
  interface Window {
    YT?: {
      Player: new (elementId: string, config: any) => any;
      ready: (callback: () => void) => void;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
  }
}

// Global YouTube API Manager - handles API loading and player instances
class YouTubeAPIManager {
  private static instance: YouTubeAPIManager;
  private isLoaded: boolean = false;
  private isLoading: boolean = false;
  private loadPromise: Promise<void> | null = null;
  private players: Map<string, any> = new Map();
  private onReadyCallbacks: (() => void)[] = [];
  private audioUnlocked: boolean = false;
  private readonly audioUnlockStorageKey = 'maat_yt_audio_unlocked';

  private constructor() {}

  static getInstance(): YouTubeAPIManager {
    if (!YouTubeAPIManager.instance) {
      YouTubeAPIManager.instance = new YouTubeAPIManager();
      YouTubeAPIManager.instance.audioUnlocked = YouTubeAPIManager.instance.readAudioUnlockedFromStorage();
    }
    return YouTubeAPIManager.instance;
  }

  private readAudioUnlockedFromStorage(): boolean {
    try {
      if (typeof window === 'undefined') return false;
      return window.sessionStorage?.getItem(this.audioUnlockStorageKey) === 'true';
    } catch {
      return false;
    }
  }

  private writeAudioUnlockedToStorage(value: boolean) {
    try {
      if (typeof window === 'undefined') return;
      window.sessionStorage?.setItem(this.audioUnlockStorageKey, value ? 'true' : 'false');
    } catch {
      // ignore
    }
  }

  hasAudioUnlocked(): boolean {
    return this.audioUnlocked;
  }

  markAudioUnlocked() {
    this.audioUnlocked = true;
    this.writeAudioUnlockedToStorage(true);
  }

  async loadAPI(): Promise<void> {
    if (this.isLoaded) return;
    if (this.isLoading) return this.loadPromise!;

    this.isLoading = true;
    this.loadPromise = new Promise((resolve) => {
      // Check if already loaded
      if (window.YT) {
        this.isLoaded = true;
        this.isLoading = false;
        resolve();
        return;
      }

      // Check if script is already being loaded
      if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const checkAPI = () => {
          if (window.YT) {
            this.isLoaded = true;
            this.isLoading = false;
            resolve();
          } else {
            setTimeout(checkAPI, 100);
          }
        };
        checkAPI();
        return;
      }

      // Load the script
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      
      script.onload = () => {
        const markReady = () => {
          this.isLoaded = true;
          this.isLoading = false;
          this.onReadyCallbacks.forEach(cb => cb());
          this.onReadyCallbacks = [];
          resolve();
        };

        if (window.YT?.ready) {
          window.YT.ready(() => {
            markReady();
          });
          return;
        }

        const checkAPI = () => {
          if (window.YT?.ready) {
            window.YT.ready(() => {
              markReady();
            });
          } else {
            setTimeout(checkAPI, 100);
          }
        };
        checkAPI();
      };

      script.onerror = () => {
        console.error('Failed to load YouTube API');
        this.isLoading = false;
        resolve(); // Still resolve to avoid blocking
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  onReady(callback: () => void) {
    if (this.isLoaded) {
      callback();
    } else {
      this.onReadyCallbacks.push(callback);
    }
  }

  registerPlayer(videoId: string, player: any) {
    this.players.set(videoId, player);
  }

  getPlayer(videoId: string): any | null {
    return this.players.get(videoId) || null;
  }

  destroyPlayer(videoId: string) {
    const player = this.players.get(videoId);
    if (player && player.destroy) {
      player.destroy();
    }
    this.players.delete(videoId);
  }

  isAPIReady(): boolean {
    return this.isLoaded;
  }
}

export default YouTubeAPIManager;
