import React, { useState } from 'react';
import { BookOpen, ChevronRight, Play, CheckCircle, Clock, Star, TrendingUp, Shield, Landmark } from 'lucide-react';

const COURSES = [
  {
    id: 1,
    category: 'Fundamentals',
    icon: Landmark,
    color: 'text-accent-cyan',
    bg: 'bg-accent-cyan/10',
    modules: [
      { title: 'Introduction to Stock Markets', duration: '15 min', completed: true },
      { title: 'Understanding Market Orders', duration: '12 min', completed: true },
      { title: 'Reading Financial Statements', duration: '20 min', completed: false },
      { title: 'Valuation Methods (P/E, P/B, DCF)', duration: '25 min', completed: false },
    ],
  },
  {
    id: 2,
    category: 'Technical Analysis',
    icon: TrendingUp,
    color: 'text-accent-purple',
    bg: 'bg-accent-purple/10',
    modules: [
      { title: 'Candlestick Patterns Explained', duration: '18 min', completed: true },
      { title: 'Support & Resistance Levels', duration: '14 min', completed: false },
      { title: 'Moving Averages (SMA, EMA)', duration: '16 min', completed: false },
      { title: 'RSI, MACD and Bollinger Bands', duration: '22 min', completed: false },
    ],
  },
  {
    id: 3,
    category: 'Risk Management',
    icon: Shield,
    color: 'text-gain',
    bg: 'bg-gain/10',
    modules: [
      { title: 'Position Sizing Strategies', duration: '10 min', completed: false },
      { title: 'Stop-Loss & Take-Profit', duration: '12 min', completed: false },
      { title: 'Portfolio Diversification', duration: '15 min', completed: false },
      { title: 'Managing Drawdowns', duration: '14 min', completed: false },
    ],
  },
  {
    id: 4,
    category: 'Crypto & DeFi',
    icon: Star,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    modules: [
      { title: 'Blockchain Fundamentals', duration: '20 min', completed: false },
      { title: 'Understanding DeFi Protocols', duration: '18 min', completed: false },
      { title: 'NFTs and Tokenomics', duration: '15 min', completed: false },
    ],
  },
];

export default function LearningModule() {
  const [expandedCourse, setExpandedCourse] = useState(1);

  return (
    <div className="flex-1 overflow-y-auto bg-[#131722] p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header & Progress */}
        <div className="flex items-center justify-between gap-6 mb-8 border-b border-[#2a2e39] pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-[#1e222d] border border-[#2a2e39] flex items-center justify-center">
              <BookOpen size={24} className="text-[#d1d4dc]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#d1d4dc] tracking-tight">Financial Academy</h1>
              <p className="text-sm text-[#787b86] mt-1">Structured modules to master trading mechanics</p>
            </div>
          </div>
          
          <div className="bg-[#1e222d] rounded border border-[#2a2e39] p-4 w-72">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-[#787b86] uppercase tracking-wider">Overall Progress</span>
              <span className="text-[12px] font-bold text-[#d1d4dc]">3 / 15 Done</span>
            </div>
            <div className="w-full bg-[#131722] rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#2962ff] h-full rounded-full w-1/5" />
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {COURSES.map((course) => {
            const completed = course.modules.filter((m) => m.completed).length;
            const total = course.modules.length;
            const isExpanded = expandedCourse === course.id;
            const Icon = course.icon;
            const progressPct = (completed / total) * 100;

            return (
              <div
                key={course.id}
                className={`bg-[#1e222d] border rounded overflow-hidden transition-colors ${
                  isExpanded ? 'border-[#2962ff]' : 'border-[#2a2e39] hover:border-[#434651]'
                }`}
              >
                <div
                  onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                  className="w-full flex items-center justify-between p-5 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-[#131722] flex items-center justify-center border border-[#2a2e39]">
                      <Icon size={18} className="text-[#d1d4dc]" />
                    </div>
                    <div className="text-left">
                      <div className="text-[15px] font-bold text-[#d1d4dc] mb-1.5">{course.category}</div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1 bg-[#131722] rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-[#089981]" style={{ width: `${progressPct}%` }} />
                        </div>
                        <span className="text-[10px] font-medium text-[#787b86] uppercase">{completed}/{total} COMPLETED</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[#787b86]">
                    <ChevronRight size={18} className={`transition-transform duration-200 ${isExpanded ? 'rotate-90 text-[#2962ff]' : ''}`} />
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-[#2a2e39] bg-[#131722]">
                    {course.modules.map((mod, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-5 py-3 hover:bg-[#1e222d] transition-colors border-t border-[#2a2e39] first:border-t-0 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          {mod.completed ? (
                            <CheckCircle size={14} className="text-[#089981] shrink-0" />
                          ) : (
                            <Play size={12} className="text-[#787b86] shrink-0 translate-x-[1px]" />
                          )}
                          <span className={`text-[13px] font-medium ${mod.completed ? 'text-[#787b86]' : 'text-[#d1d4dc]'}`}>
                            {mod.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#787b86]">
                          <Clock size={12} />
                          {mod.duration}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
