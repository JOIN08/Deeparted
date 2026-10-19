import { Anchor, ChevronDown } from 'lucide-react';
import { NAV_ITEMS } from '../data/mockData';

export default function Sidebar({
  activeTab,
  setActiveTab,
  isLoggedIn,
  navItems = NAV_ITEMS,
  displayName = 'Jeff Mabuhay',
  username = 'Jeff',
}) {
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <aside className={`sticky top-0 z-20 flex h-dvh max-h-dvh w-64 shrink-0 flex-col overflow-hidden border-r border-[#29495a] bg-ui-navy text-slate-300 transition-all duration-500 dark:border-github-border dark:bg-github-canvas ${!isLoggedIn ? 'blur-md pointer-events-none select-none' : ''}`}>
      <div className="flex shrink-0 items-center gap-3 border-b border-[#29495a] p-5 dark:border-github-border">
        <div className="rounded-md bg-ui-sea p-2 text-white shadow-md shadow-teal-700/25 dark:shadow-none">
          <Anchor className="w-6 h-6" />
        </div>
        <div className="leading-tight">
          <h1 className="font-extrabold text-white text-base tracking-wider">Deeparted</h1>
          <p className="text-[10px] text-orange-400 font-semibold tracking-widest uppercase">Vessel Operations</p>
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-ui-sea text-white shadow-md shadow-teal-700/30 dark:bg-github-raised dark:text-github-text dark:shadow-none'
                  : 'text-slate-400 hover:bg-black/5 hover:text-slate-200 dark:text-github-muted dark:hover:bg-github-raised dark:hover:text-github-text'
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

      <div className="shrink-0 border-t border-[#29495a] bg-white/5 p-3 dark:border-github-border dark:bg-github-panel">
        <div className="flex items-center justify-between gap-2 rounded-md border border-[#29495a] bg-slate-800/40 p-2 dark:border-github-border dark:bg-github-raised">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-600 bg-slate-700 text-xs font-semibold text-white">
              {initials || username.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 text-left leading-tight">
              <p className="truncate text-xs font-bold text-white">{displayName}</p>
              <p className="truncate text-[10px] text-slate-400">{username}</p>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        </div>
      </div>
    </aside>
  );
}