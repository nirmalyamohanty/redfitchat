import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const auth = {
  googleToken: (credential) => api.post('/api/auth/google/token', { credential }),
  guest: () => api.post('/api/auth/guest'),
  logout: () => api.post('/api/auth/logout')
};

export const users = {
  me: () => api.get('/api/users/me'),
  search: (q) => api.get('/api/users/search', { params: { q } }),
  get: (id) => api.get(`/api/users/${id}`),
  update: (data) => api.patch('/api/users/me', data),
  avatar: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/api/users/me/avatar', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  block: (userId) => api.post(`/api/users/block/${userId}`),
  unblock: (userId) => api.post(`/api/users/unblock/${userId}`)
};

export const messages = {
  global: (params) => api.get('/api/messages/global', { params }),
  personal: (chatId, params) => api.get(`/api/messages/personal/${chatId}`, { params }),
  sendGlobal: (data) => api.post('/api/messages/global', data),
  sendPersonal: (chatId, data) => api.post(`/api/messages/personal/${chatId}`, data),
  report: (messageId, reason) => api.post(`/api/messages/report/${messageId}`, { reason })
};

export const chats = {
  list: () => api.get('/api/chats'),
  withUser: (userId) => api.post(`/api/chats/with/${userId}`)
};

export const upload = {
  file: (file, type = 'file') => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', type);
    return api.post('/api/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export const translate = {
  text: (text, targetLang = 'en') => api.post('/api/translate', { text, targetLang })
};

export const ai = {
  chat: (message, reset = false) => api.post('/api/ai/chat', { message, reset })
};

export default api;
