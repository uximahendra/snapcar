import { create } from 'zustand';

export interface CapturedImage {
  id: string;
  angle: string;
  uri: string;
  base64?: string;
}

interface CaptureState {
  currentSessionId: string | null;
  currentMode: 'exterior' | 'interior' | null;
  selectedAngle: string | null;
  capturedImages: CapturedImage[];
  setSession: (sessionId: string, mode: 'exterior' | 'interior') => void;
  setSelectedAngle: (angle: string) => void;
  addCapturedImage: (image: CapturedImage) => void;
  clearCapture: () => void;
}

export const useCaptureStore = create<CaptureState>((set) => ({
  currentSessionId: null,
  currentMode: null,
  selectedAngle: null,
  capturedImages: [],
  
  setSession: (sessionId, mode) => {
    set({ currentSessionId: sessionId, currentMode: mode, capturedImages: [] });
  },
  
  setSelectedAngle: (angle) => {
    set({ selectedAngle: angle });
  },
  
  addCapturedImage: (image) => {
    set((state) => ({
      capturedImages: [...state.capturedImages, image],
    }));
  },
  
  clearCapture: () => {
    set({
      currentSessionId: null,
      currentMode: null,
      selectedAngle: null,
      capturedImages: [],
    });
  },
}));