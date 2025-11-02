import { create } from 'zustand';

interface Session {
  id: string;
  title: string;
  mode: string;
  created_at: string;
  image_count: number;
  status: string;
  thumbnail?: string;
}

interface GalleryState {
  sessions: Session[];
  isLoading: boolean;
  setSessions: (sessions: Session[]) => void;
  setLoading: (loading: boolean) => void;
  removeSession: (sessionId: string) => void;
}

export const useGalleryStore = create<GalleryState>((set) => ({
  sessions: [],
  isLoading: false,
  
  setSessions: (sessions) => {
    set({ sessions });
  },
  
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
  
  removeSession: (sessionId) => {
    set((state) => ({
      sessions: state.sessions.filter(s => s.id !== sessionId),
    }));
  },
}));