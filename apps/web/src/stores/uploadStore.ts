import { create } from 'zustand';

interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

interface UploadState {
  uploads: UploadFile[];
  isUploading: boolean;
  totalProgress: number;
  
  // Actions
  addFile: (file: File) => void;
  removeFile: (id: string) => void;
  updateProgress: (id: string, progress: number) => void;
  setFileStatus: (id: string, status: UploadFile['status'], url?: string, error?: string) => void;
  clearCompleted: () => void;
  clearAll: () => void;
  uploadFiles: () => Promise<void>;
  uploadSingleFile: (id: string) => Promise<void>;
}

export const useUploadStore = create<UploadState>((set, get) => ({
  uploads: [],
  isUploading: false,
  totalProgress: 0,

  addFile: (file: File) => {
    const uploadFile: UploadFile = {
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'pending',
    };

    set((state) => ({
      uploads: [...state.uploads, uploadFile],
    }));
  },

  removeFile: (id: string) => {
    set((state) => ({
      uploads: state.uploads.filter(upload => upload.id !== id),
    }));
  },

  updateProgress: (id: string, progress: number) => {
    set((state) => ({
      uploads: state.uploads.map(upload =>
        upload.id === id ? { ...upload, progress } : upload
      ),
    }));
  },

  setFileStatus: (id: string, status: UploadFile['status'], url?: string, error?: string) => {
    set((state) => ({
      uploads: state.uploads.map(upload =>
        upload.id === id ? { ...upload, status, url, error } : upload
      ),
    }));
  },

  clearCompleted: () => {
    set((state) => ({
      uploads: state.uploads.filter(upload => upload.status !== 'success'),
    }));
  },

  clearAll: () => {
    set({
      uploads: [],
      isUploading: false,
      totalProgress: 0,
    });
  },

  uploadFiles: async () => {
    const { uploads } = get();
    const pendingFiles = uploads.filter(upload => upload.status === 'pending');
    
    if (pendingFiles.length === 0) return;

    set({ isUploading: true });

    try {
      // Upload files sequentially for simplicity
      for (const upload of pendingFiles) {
        await get().uploadSingleFile(upload.id);
      }
    } finally {
      set({ isUploading: false });
    }
  },

  uploadSingleFile: async (id: string) => {
    const { uploads } = get();
    const upload = uploads.find(u => u.id === id);
    
    if (!upload) return;

    get().setFileStatus(id, 'uploading');

    try {
      const formData = new FormData();
      formData.append('file', upload.file);

      // Get auth token from localStorage
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/upload/media', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          get().setFileStatus(id, 'success', data.data.url);
        } else {
          throw new Error(data.error || 'Upload failed');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
    } catch (error) {
      get().setFileStatus(id, 'error', undefined, error instanceof Error ? error.message : 'Unknown error');
    }
  },
}));
