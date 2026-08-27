import React from 'react';
import { Anchor, ChevronDown } from 'lucide-react';
import { NAV_ITEMS } from '../data/mockData';

export default function Sidebar({ activeTab, setActiveTab, isLoggedIn }) {
  return (
    <aside className={`w-64 bg-[#0b1329] text-slate-300 flex flex-col shrink-0 z-20 border-r border-slate-800 transition-all duration-500 ${!isLoggedIn ? 'blur-md pointer-events-none select-none' : ''}`}>
      <div className="p-5 flex items-center gap-3 border-b border-slate-800/80">
        <div className="p-2 bg-blue-600 rounded-xl text-white">
          <Anchor className="w-6 h-6" />
        </div>
        <div className="leading-tight">
          <h1 className="font-extrabold text-white text-base tracking-wider uppercase">PHILIPPINE</h1>
          <p className="text-[10px] text-orange-400 font-semibold tracking-widest uppercase">SHIPPING HUB</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-blue-600/90 text-white shadow-md shadow-blue-600/30' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800/80 bg-[#080e1e]">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-700 text-white font-semibold flex items-center justify-center text-xs border border-slate-600">
              JM
            </div>
            <div className="text-left leading-tight">
              <p className="text-xs font-bold text-white">Jeff Mabuhay</p>
              <p className="text-[10px] text-slate-400">Administrator</p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </aside>
  );
}