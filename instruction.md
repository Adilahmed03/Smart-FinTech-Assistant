# Smart FinTech Assistant: Technical Deep-Dive

This document provides a comprehensive technical overview of the Smart FinTech Assistant for developers and architects.

---

## 🏗 Project Architecture

The application follows a modular **Client-Server** architecture designed for high performance and scalability.

- **Frontend**: A Single Page Application (SPA) built with React and Vite. It uses a component-based architecture for UI modularity and Axios for asynchronous backend communication.
- **Backend**: A FastAPI-based REST API that prioritizes speed and developer productivity. It utilizes asynchronous programming (`async/await`) for I/O-bound tasks like fetching market data and calling AI services.
- **Caching/State**: A hybrid state management system using **Redis** for persistence (portfolio and trade history) and in-memory caches for volatile real-time market data.

---

## 📦 Backend Modules

- **`api/`**: Contains the route definitions.
  - `auth_routes.py`: Logic for user sessions and identification.
  - `trading_routes.py`: Endpoints for executing BUY/SELL orders.
  - `analytics_routes.py`: Serves portfolio performance metrics.
  - `ai_routes.py`: Entry points for chat and diagnostic services.
- **`core/`**: The brain of the backend.
  - `config.py`: Centralized settings (Pydantic-based) and environment variable management.
  - `gemini_client.py`: The low-level interface to the Google Generative AI SDK, featuring robust error handling and fallback logic.
  - `redis_client.py`: Connection pooling and management for Redis/In-Memory storage.
- **`models/`**: Domain-driven data structures.
  - `portfolio.py`: Defines holdings, cash balances, and time-series history.
  - `market.py`: Handles Yahoo Finance integration and background price broadcasting.
- **`services/`**: Complex business logic.
  - `ai_insight_service.py`: Orchestrates portfolio data and historical context to build rich, actionable prompts for the AI.
  - `demo_service.py`: Handles automatic user and portfolio seeding for a seamless first-run experience.

---

## 🎨 Frontend Structure

- **`components/`**: Modularized UI elements.
  - `ChartPanel.jsx`: High-performance candlestick charts using Lightweight Charts.
  - `PortfolioAnalytics.jsx`: Visual performance breakdown using Recharts.
  - `AIAssistantSidebar.jsx`: Floating AI chat for quick market queries.
- **`src/api.js`**: A centralized Axios configuration that handles environment-based routing (`VITE_API_URL`) and credential persistence.

---

## 🤖 AI Integration (Gemini API)

The platform leverages **Google Gemini 2.5 Flash** to provide institutional-grade financial intelligence.

### How it Works:
1. **Context Building**: When a user requests an insight, the system gathers their current holdings, recent trades, and account valuation.
2. **Prompt Engineering**: This data is injected into a structured, role-based prompt (e.g., "You are a professional financial advisor...").
3. **Execution**: The `gemini_client` sends the prompt to the configured model.
4. **Resilience**: The client includes specific error trapping for the Gemini Free Tier (e.g., handling `429 RESOURCE_EXHAUSTED` with user-friendly retry messages).

### 🔍 Debug Endpoint: `/api/ai/debug-models`
For developers, this endpoint provides a window into the AI service health:
- Lists all Gemini models accessible by your API key.
- Identifies which models support `generateContent`.
- Performs a live, low-latency test call to verify that your `GEMINI_API_KEY` and `GEMINI_MODEL` are correctly configured.

---

## 🔐 Environment Variables

- `GEMINI_API_KEY`: Required for AI features. Found in Google AI Studio.
- `GEMINI_MODEL`: Defaults to `models/gemini-2.5-flash`.
- `VITE_API_URL`: (Frontend) The URL of the backend API for cross-origin production requests.
- `REDIS_URL`: The path to your Redis instance. If left blank or incorrect, the system automatically falls back to **In-Memory** mode for a zero-config setup.
- `SECRET_KEY`: Used to sign session cookies.

---

## 🛠 Feature Logic: Terminal Intelligence
The "Terminal Intelligence" feature uses real-time market sentiment analysis. It takes the current active chart symbol and queries Gemini for a "Quick Logic" assessment, helping users make data-driven decisions during high-volatility events.
