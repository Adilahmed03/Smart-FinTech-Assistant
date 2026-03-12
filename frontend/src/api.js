import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // send session cookie
  headers: { 'Content-Type': 'application/json' },
});

// ── Auth ────────────────────────────────────────────────────────────────────

export const authAPI = {
  register: (email, password) => api.post('/auth/register', { email, password }),  // note: proxy strips /api prefix handled by vite
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// Re-map:  our FastAPI routes are /auth/* not /api/auth/*
// Vite proxies /api → localhost:8000, so we need the full path as it is on the backend.
// The backend routes are /auth/* so we must hit /auth/* directly through the proxy.

const raw = axios.create({
  baseURL: '',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export const auth = {
  register: (email, password) => raw.post('/auth/register', { email, password }),
  login: (email, password) => raw.post('/auth/login', { email, password }),
  logout: () => raw.post('/auth/logout'),
  me: () => raw.get('/auth/me'),
};

// ── Trading ─────────────────────────────────────────────────────────────────

export const tradingAPI = {
  buy: (symbol, quantity, price) => api.post('/trade/buy', { symbol, quantity, price }),
  sell: (symbol, quantity, price) => api.post('/trade/sell', { symbol, quantity, price }),
  getPortfolio: () => api.get('/trade/portfolio'),
  getTrades: () => api.get('/trade/trades'),
  
  // Market Data
  getMarketPrice: (symbol) => api.get(`/market/price/${symbol}`),
  getMarketPrices: () => api.get('/market/prices'),
  getMarketHistory: (symbol, period = '1mo', interval = '1d') => 
    api.get(`/market/history/${symbol}`, { params: { period, interval } }),
  getAnalytics: () => api.get('/portfolio/analytics'),
};

// ── Learning ────────────────────────────────────────────────────────────────

export const learningAPI = {
  getCourses: () => api.get('/learning/courses'),
  getCourse: (id) => api.get(`/learning/courses/${id}`),
};

// ── AI ──────────────────────────────────────────────────────────────────────

export const aiAPI = {
  chat: (message, symbol) => api.post('/ai/chat', { message, symbol }),
  analyzePortfolio: (holdings) => api.post('/ai/analyze-portfolio', { holdings }),
  marketAnalysis: (symbol) => api.get(`/ai/market-analysis/${symbol}`),
};

export default api;
