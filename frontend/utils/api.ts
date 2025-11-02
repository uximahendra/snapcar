import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL || '';

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },
  
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  demoLogin: async () => {
    const response = await api.post('/auth/demo');
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },
};

// Session APIs
export const sessionAPI = {
  createSession: async (title: string, mode: string) => {
    const response = await api.post('/sessions', { title, mode });
    return response.data;
  },
  
  getSessions: async () => {
    const response = await api.get('/sessions');
    return response.data;
  },
  
  getSession: async (sessionId: string) => {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data;
  },
  
  updateSession: async (sessionId: string, data: any) => {
    const response = await api.put(`/sessions/${sessionId}`, data);
    return response.data;
  },
  
  deleteSession: async (sessionId: string) => {
    const response = await api.delete(`/sessions/${sessionId}`);
    return response.data;
  },
};

// Enhancement APIs
export const enhanceAPI = {
  enhanceImage: async (sessionId: string, imageId: string, angle: string, beforeBase64: string, background?: string) => {
    const response = await api.post('/enhance', {
      session_id: sessionId,
      image_id: imageId,
      angle,
      before_base64: beforeBase64,
      background: background || 'studio_white',
    });
    return response.data;
  },
  
  getEnhancementResult: async (jobId: string) => {
    const response = await api.get(`/enhance/${jobId}`);
    return response.data;
  },
};

// Export APIs
export const exportAPI = {
  exportSession: async (sessionId: string, size: string = 'web') => {
    const response = await api.post('/export', { session_id: sessionId, size });
    return response.data;
  },
  
  getExportStatus: async (jobId: string) => {
    const response = await api.get(`/export/${jobId}`);
    return response.data;
  },
};

export default api;