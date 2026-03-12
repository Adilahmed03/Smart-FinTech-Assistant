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
import PortfolioAnalytics from './components/PortfolioAnalytics';
import AIAssistantSidebar from './components/AIAssistantSidebar';

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [activeSymbol, setActiveSymbol] = useState('AAPL');
  const [activeTab, setActiveTab] = useState('terminal');
  const [rightTab, setRightTab] = useState('trade');
  const [refreshKey, setRefreshKey] = useState(0);

  // Loading spinner while checking session
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated → show login/register
  if (!user) {
    return <AuthPage />;
  }

  const handleTradeExecuted = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-screen bg-bg text-text-primary overflow-hidden">
      <TopNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={logout} 
      />

      <main className="flex flex-1 overflow-hidden">
        {activeTab === 'terminal' && (
          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar: Watchlist */}
            <aside className="w-[260px] border-r border-card-border flex flex-col bg-bg hidden lg:flex">
              <Watchlist activeSymbol={activeSymbol} onSelect={setActiveSymbol} />
            </aside>

            {/* Center: Chart + Bottom Activity */}
            <section className="flex-1 flex flex-col overflow-hidden bg-black/10">
              <div className="flex-1 overflow-hidden p-4">
                 <div className="h-full terminal-card flex flex-col">
                    <ChartPanel symbol={activeSymbol} refreshTrigger={refreshKey} />
                 </div>
              </div>
              
              <div className="h-72 border-t border-card-border bg-bg flex flex-col overflow-hidden">
                <TradeHistory refreshTrigger={refreshKey} />
              </div>
            </section>

            {/* Right Panel: Trading & Portfolio */}
            <aside className="w-[320px] border-l border-card-border flex flex-col bg-bg overflow-y-auto">
              <div className="flex border-b border-card-border bg-card/30">
                <button
                  onClick={() => setRightTab('trade')}
                  className={`flex-1 py-3 text-[11px] font-bold tracking-widest uppercase transition-all ${
                    rightTab === 'trade'
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-text-dim hover:text-text-secondary'
                  }`}
                >
                  Execution
                </button>
                <button
                  onClick={() => setRightTab('portfolio')}
                  className={`flex-1 py-3 text-[11px] font-bold tracking-widest uppercase transition-all ${
                    rightTab === 'portfolio'
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-text-dim hover:text-text-secondary'
                  }`}
                >
                  Exposure
                </button>
              </div>
              
              <div className="flex-1">
                {rightTab === 'trade' ? (
                  <TradePanel 
                    symbol={activeSymbol} 
                    refreshTrigger={refreshKey} 
                    onTrade={handleTradeExecuted} 
                  />
                ) : (
                  <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                       <PortfolioPanel refreshTrigger={refreshKey} />
                    </div>
                    <AIAssistantSidebar symbol={activeSymbol} />
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="flex-1 overflow-y-auto bg-bg p-6">
            <PortfolioAnalytics refreshTrigger={refreshKey} />
          </div>
        )}

        {activeTab === 'learning' && (
          <LearningModule />
        )}

        {activeTab === 'ai' && (
          <div className="flex-1 overflow-hidden">
            <AIInsights symbol={activeSymbol} />
          </div>
        )}
      </main>
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
