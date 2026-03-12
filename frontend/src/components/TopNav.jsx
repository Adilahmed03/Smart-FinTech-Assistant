import React from 'react';
import {
  BarChart3,
  BookOpen,
  BrainCircuit,
  Bell,
  LogOut,
  Search,
  Settings,
  Activity,
} from 'lucide-react';

const tabs = [
  { id: 'terminal', label: 'Terminal', icon: BarChart3 },
  { id: 'analytics', label: 'Analytics', icon: Activity },
  { id: 'ai', label: 'AI Advisor', icon: BrainCircuit },
];

export default function TopNav({ activeTab, setActiveTab, user, onLogout }) {
  const initial = user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <nav className="h-14 flex items-center justify-between px-6 bg-[#131722] border-b border-[#2a2e39] shrink-0 z-50 select-none">
      {/* Left: Logo */}
      <div className="w-[30%] flex items-center justify-start">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('terminal')}>
          <div className="w-8 h-8 rounded bg-[#2962ff] flex items-center justify-center">
            <BarChart3 size={16} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-bold tracking-wide text-[#d1d4dc]">
              SmartFinTech
            </span>
            <span className="text-[9px] uppercase tracking-wider text-[#787b86] font-semibold">Pro Terminal</span>
          </div>
        </div>
      </div>

      {/* Center: Tabs */}
      <div className="w-[40%] flex items-center justify-center gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded text-[13px] font-semibold transition-colors ${
              activeTab === id
                ? 'bg-[#2962ff]/10 text-[#2962ff]'
                : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#2a2e39]/50'
            }`}
          >
            <Icon size={14} className={activeTab === id ? 'text-[#2962ff]' : 'text-[#787b86]'} />
            {label}
          </button>
        ))}
      </div>

      {/* Right: Actions */}
      <div className="w-[30%] flex items-center justify-end gap-3">
        <div className="flex flex-col items-end hidden sm:flex">
          <span className="text-[12px] font-medium text-[#d1d4dc]">
            {user?.email.split('@')[0]}
          </span>
        </div>
        <div className="w-8 h-8 rounded bg-[#1e222d] border border-[#2a2e39] flex items-center justify-center text-[13px] font-bold text-[#d1d4dc]">
          {initial}
        </div>
        <button
          onClick={onLogout}
          title="Sign out"
          className="p-1.5 rounded text-[#787b86] hover:text-[#f23645] hover:bg-[#f23645]/10 transition-colors"
        >
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
}
