# Smart FinTech Assistant

AI-powered trading terminal with paper trading, portfolio analytics, financial learning, and Gemini-driven insights.

![TradingView-style dark terminal UI](https://img.shields.io/badge/UI-TradingView%20Style-0a0e17?style=for-the-badge&labelColor=111827)

## Tech Stack

| Layer     | Technology                        |
| --------- | --------------------------------- |
| Frontend  | React 19 + Vite + TailwindCSS v4 |
| Charts    | Lightweight Charts (TradingView)  |
| Backend   | FastAPI (Python 3.11+)            |
| Cache     | Redis                             |
| AI Engine | Google Gemini API                 |

## Features

- 📊 **Professional Trading Terminal** – dark theme, candlestick charts, watchlist
- 📝 **Paper Trading Simulator** – place buy/sell orders with virtual funds
- 📈 **Portfolio Analytics** – allocation breakdown, P&L tracking
- 🤖 **AI Financial Insights** – Gemini-powered market analysis & chat
- 📚 **Financial Learning Center** – structured courses with progress tracking

## Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.11
- **Redis** server running locally
- **Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Clone & Configure

```bash
cd smart-fintech-assistant
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY with values like:
# ```env
# GEMINI_API_KEY=AIza...
# GEMINI_MODEL=models/gemini-2.5-flash
# REDIS_URL=redis://localhost:6379/0
# SECRET_KEY=yoursecret
# ```
```

> [!IMPORTANT]
> Never commit your `.env` file to Git. The `.gitignore` file is configured to prevent this.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

### 3. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at **http://localhost:8000**  
API docs at **http://localhost:8000/docs**

### 4. Redis

```bash
# Windows (if installed via Chocolatey / Memurai)
redis-server
```

## 🏗️ System Architecture

### 1. 5-Panel Terminal Layout
The dashboard utilizes a high-density "Operations Hub" layout:
- **Navigation (Top)**: Global route switcher and session management.
- **Watchlist (Left)**: Active tracking of Indian (NSE) and Global (US/Crypto) markets.
- **Intelligence Hub (Center)**: Real-time interactive charts with integrated interval controls.
- **Execution & Exposure (Right)**: Vertical stack containing live order entry and portfolio inventory.
- **Activity Log (Bottom)**: Audit trail of all buy/sell transactions.

### 2. Data Flow & Persistence
- **Communication**: Frontend (React) communicates with Backend (FastAPI) via highly-optimized asynchronous REST endpoints.
- **Persistence**: Portfolio state and session tokens are managed in **Redis**, ensuring low-latency access and state isolation.
- **Market Simulation**: Live prices are fetched from Yahoo Finance with a simulated **"Market Jitter"** logic to demonstrate real-time UI reactions during review.

### 3. AI Neural Link
The terminal integrates **Google Gemini 2.0 Flash** for two distinct purposes:
- **Strategy Insights**: Deep-dive analysis of market trends and historical performance.
- **Terminal Intelligence**: A persistent sidebar assistant that provides contextual feedback on your current holdings and risk profile.

## Project Structure

```
smart-fintech-assistant/
├── .env.example
├── README.md
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       └── components/
│           ├── TopNav.jsx
│           ├── Watchlist.jsx
│           ├── ChartPanel.jsx
│           ├── TradePanel.jsx
│           ├── PortfolioPanel.jsx
│           ├── TradeHistory.jsx
│           ├── LearningModule.jsx
│           └── AIInsights.jsx
└── backend/
    ├── main.py
    ├── requirements.txt
    ├── core/
    │   ├── config.py
    │   ├── redis_client.py
    │   └── gemini_client.py
    └── api/
        ├── ai_routes.py
        ├── trading_routes.py
        └── learning_routes.py
```

## API Endpoints

| Method | Endpoint                          | Description                    |
| ------ | --------------------------------- | ------------------------------ |
| GET    | `/api/health`                     | Health check                   |
| POST   | `/api/ai/chat`                    | Chat with AI advisor           |
| POST   | `/api/ai/analyze-portfolio`       | AI portfolio analysis          |
| GET    | `/api/ai/market-analysis/{sym}`   | AI market analysis per symbol  |
| POST   | `/api/trading/order`              | Place paper trade              |
| GET    | `/api/trading/balance`            | Paper trading balance          |
| GET    | `/api/trading/trades`             | Trade history                  |
| GET    | `/api/trading/holdings`           | Current holdings               |
| GET    | `/api/learning/courses`           | List learning courses          |
| GET    | `/api/learning/courses/{id}`      | Get course details             |

## License

MIT
