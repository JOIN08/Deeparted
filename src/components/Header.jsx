import { Clock, Sun, Moon, Bell, ChevronDown, LogOut } from 'lucide-react';

export default function Header({ timeLeft, isDarkMode, setIsDarkMode, handleLogout }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-ui-line bg-white px-8 dark:border-github-border dark:bg-github-panel max-md:px-4">
      <div className="flex items-center gap-4 max-sm:hidden">
        <span className="text-xs font-medium text-slate-400">System Dashboard / Overview</span>
      </div>

      <div className="flex min-w-0 items-center gap-5 max-md:gap-2">
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#fff4e6] text-[#a65b13] dark:bg-orange-500/10 dark:text-orange-400 text-xs font-semibold border border-[#f0cf9e] dark:border-orange-500/20">
          <Clock className="w-3.5 h-3.5 animate-pulse" />
          <span className="max-sm:hidden">Inactivity Lock: {timeLeft}s</span>
        </div>

        <button
          type="button"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 py-1.5 text-slate-600 shadow-sm transition-all hover:scale-105 dark:border-github-border dark:bg-github-canvas dark:text-github-text"
        >
          <Sun className={`w-3.5 h-3.5 ${!isDarkMode ? 'text-amber-500' : 'text-slate-400'}`} />
          <div className="relative h-3.5 w-7 rounded-full bg-slate-300 p-0.5 dark:bg-github-raised">
            <div className={`w-2.5 h-2.5 bg-orange-500 rounded-full transition-transform ${isDarkMode ? 'translate-x-3.5' : 'translate-x-0'}`} />
          </div>
          <Moon className={`w-3.5 h-3.5 ${isDarkMode ? 'text-github-accent' : 'text-slate-400'}`} />
        </button>

        <button className="relative rounded-md p-2 text-slate-400 hover:bg-slate-100 dark:text-github-muted dark:hover:bg-github-raised">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500" />
        </button>

        <div className="hidden items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm dark:border-github-border dark:bg-github-canvas dark:text-github-text md:flex">
          <span>Aug 24, 2026</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>

        <button
          onClick={handleLogout}
          className="p-1.5 text-slate-400 transition-colors hover:text-red-500 dark:text-github-muted"
          title="Log Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}