import React, { useState } from 'react';
import {
  BarChart3,
  BookOpen,
  BrainCircuit,
  LogOut,
  Search,
  Activity,
  Globe,
  ChevronDown,
  User
} from 'lucide-react';

const tabs = [
  { id: 'terminal', label: 'Terminal', icon: BarChart3 },
  { id: 'analytics', label: 'Analytics', icon: Activity },
  { id: 'learning', label: 'Learning', icon: BookOpen },
  { id: 'ai', label: 'AI Advisor', icon: BrainCircuit },
];

export default function TopNav({ activeTab, setActiveTab, user, onLogout }) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <nav className="h-16 flex items-center justify-between px-6 bg-bg border-b border-card-border shrink-0 z-50 select-none shadow-terminal">
      {/* Left: Logo & Search */}
      <div className="flex items-center gap-8 w-1/3">
        <div 
          className="flex items-center gap-2.5 cursor-pointer group" 
          onClick={() => setActiveTab('terminal')}
        >
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <BarChart3 size={18} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-text-primary leading-tight">
              SmartFin
            </span>
            <span className="text-[10px] uppercase tracking-widest text-text-dim font-bold leading-none">
              Terminal Pro
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className={`relative hidden xl:flex items-center transition-all duration-300 ${searchFocused ? 'w-64' : 'w-48'}`}>
          <Search 
            size={14} 
            className={`absolute left-3 transition-colors ${searchFocused ? 'text-primary' : 'text-text-dim'}`} 
          />
          <input
            type="text"
            placeholder="Search symbols..."
            className="w-full bg-card border border-card-border rounded-full py-1.5 pl-9 pr-4 text-xs text-text-primary focus:outline-none focus:border-primary/50 transition-all placeholder:text-text-dim"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <div className="absolute right-3 hidden md:flex items-center gap-1">
             <span className="text-[10px] font-bold text-text-dim bg-bg px-1 rounded border border-card-border">⌘K</span>
          </div>
        </div>
      </div>

      {/* Center: Main Navigation */}
      <div className="flex items-center justify-center gap-1 w-1/3">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-semibold transition-all group ${
              activeTab === id
                ? 'text-primary bg-primary/5'
                : 'text-text-secondary hover:text-text-primary hover:bg-card-border/30'
            }`}
          >
            <Icon size={14} className={activeTab === id ? 'text-primary' : 'text-text-dim group-hover:text-text-secondary'} />
            {label}
            {activeTab === id && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center justify-end gap-4 w-1/3">
        <div className="hidden md:flex items-center gap-2 text-text-dim hover:text-text-secondary cursor-pointer transition-colors">
          <Globe size={14} />
          <span className="text-[11px] font-bold uppercase tracking-wider">Live Market</span>
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        </div>

        <div className="h-8 w-px bg-card-border mx-1" />

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-text-primary">
              {user?.email.split('@')[0]}
            </span>
            <span className="text-[10px] font-medium text-text-dim">Institutional</span>
          </div>
          
          <div className="relative group cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-card border border-card-border flex items-center justify-center hover:border-primary transition-colors overflow-hidden">
               <User size={18} className="text-text-secondary" />
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Sign out"
            className="p-2 rounded-full border border-card-border text-text-dim hover:text-danger hover:bg-danger/5 hover:border-danger/20 transition-all active:scale-90"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}
