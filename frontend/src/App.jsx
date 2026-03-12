import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/AuthPage';
import TopNav from './components/TopNav';
import Watchlist from './components/Watchlist';
import ChartPanel from './components/ChartPanel';
import TradePanel from './components/TradePanel';
import PortfolioPanel from './components/PortfolioPanel';
import TradeHistory from './components/TradeHistory';
import LearningModule from './components/LearningModule';
import AIInsights from './components/AIInsights';

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [activeSymbol, setActiveSymbol] = useState('AAPL');
  const [activeTab, setActiveTab] = useState('terminal');
  const [rightTab, setRightTab] = useState('trade');
  const [refreshKey, setRefreshKey] = useState(0);

  // Loading spinner while checking session
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-terminal-bg">
        <div className="w-10 h-10 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated → show login/register
  if (!user) {
    return <AuthPage />;
  }

  // Authenticated → show terminal
  return (
    <div className="flex flex-col h-screen bg-terminal-bg text-terminal-text overflow-hidden selection:bg-accent-cyan/30">
      <TopNav activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={logout} />

      {activeTab === 'terminal' && (
        <div className="flex flex-1 overflow-hidden p-1.5 gap-1.5 bg-black/40">
          {/* Left Sidebar – Watchlist */}
          <aside className="w-[280px] border border-terminal-border rounded flex flex-col bg-terminal-surface shadow-sm">
            <Watchlist activeSymbol={activeSymbol} onSelect={setActiveSymbol} />
          </aside>

          {/* Center – Chart + Bottom History */}
          <main className="flex-1 flex flex-col overflow-hidden gap-1.5">
            <div className="flex-1 border border-terminal-border rounded bg-terminal-surface shadow-sm flex flex-col overflow-hidden">
              <ChartPanel symbol={activeSymbol} refreshTrigger={refreshKey} />
            </div>
            <div className="h-64 border border-terminal-border rounded bg-terminal-surface shadow-sm flex flex-col overflow-hidden">
              <TradeHistory refreshTrigger={refreshKey} />
            </div>
          </main>

          {/* Right Sidebar – Trade / Portfolio */}
          <aside className="w-[340px] border border-terminal-border rounded flex flex-col bg-terminal-surface shadow-sm">
            <div className="flex border-b border-terminal-border">
              <button
                onClick={() => setRightTab('trade')}
                className={`flex-1 py-2.5 text-xs font-semibold tracking-wider uppercase transition-colors ${
                  rightTab === 'trade'
                    ? 'text-accent-cyan border-b-2 border-accent-cyan bg-terminal-card'
                    : 'text-terminal-text-muted hover:text-terminal-text'
                }`}
              >
                Trade
              </button>
              <button
                onClick={() => setRightTab('portfolio')}
                className={`flex-1 py-2.5 text-xs font-semibold tracking-wider uppercase transition-colors ${
                  rightTab === 'portfolio'
                    ? 'text-accent-cyan border-b-2 border-accent-cyan bg-terminal-card'
                    : 'text-terminal-text-muted hover:text-terminal-text'
                }`}
              >
                Portfolio
              </button>
            </div>
            {rightTab === 'trade' ? (
              <TradePanel symbol={activeSymbol} refreshTrigger={refreshKey} onTrade={() => setRefreshKey(k => k + 1)} />
            ) : (
              <PortfolioPanel refreshTrigger={refreshKey} />
            )}
          </aside>
        </div>
      )}

      {activeTab === 'learn' && <LearningModule />}
      {activeTab === 'ai' && <AIInsights symbol={activeSymbol} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
