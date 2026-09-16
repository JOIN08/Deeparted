import React from 'react';
import { Search, Clock, Sun, Moon, Bell, ChevronDown, LogOut } from 'lucide-react';

export default function Header({ timeLeft, isDarkMode, setIsDarkMode, handleLogout }) {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0f172a] px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <span className="text-xs font-medium text-slate-400">System Dashboard / Overview</span>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-semibold border border-orange-500/20">
          <Clock className="w-3.5 h-3.5 animate-pulse" />
          <span>Inactivity Lock: {timeLeft}s</span>
        </div>

        <button
          type="button"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 shadow-sm text-slate-600 dark:text-slate-300 hover:scale-105 transition-all cursor-pointer"
        >
          <Sun className={`w-3.5 h-3.5 ${!isDarkMode ? 'text-amber-500' : 'text-slate-400'}`} />
          <div className="w-7 h-3.5 bg-slate-300 dark:bg-slate-600 rounded-full relative p-0.5">
            <div className={`w-2.5 h-2.5 bg-orange-500 rounded-full transition-transform ${isDarkMode ? 'translate-x-3.5' : 'translate-x-0'}`} />
          </div>
          <Moon className={`w-3.5 h-3.5 ${isDarkMode ? 'text-sky-400' : 'text-slate-400'}`} />
        </button>

        <button className="relative p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium bg-white dark:bg-[#1e293b] text-slate-700 dark:text-slate-200 shadow-sm">
          <span>Aug 24, 2026</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>

        <button
          onClick={handleLogout}
          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
          title="Log Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}