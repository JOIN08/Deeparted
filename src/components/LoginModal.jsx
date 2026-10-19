import { User, Lock, Eye, EyeOff, ShieldAlert, Anchor } from 'lucide-react';

export default function LoginModal({
  username,
  setUsername,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  handleLogin,
  timeLeft,
  error,
  isSubmitting = false
}) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300">
      <div className="w-full max-w-md bg-white dark:bg-github-panel rounded-3xl shadow-2xl border border-sky-100/60 dark:border-github-border p-8 relative">
        
        {timeLeft === 0 && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Session locked due to inactivity. Log in again to resume.</span>
          </div>
        )}

        <div className="text-center mb-6">
          <div className="p-3 bg-blue-600 text-white rounded-2xl w-fit mx-auto mb-3">
            <Anchor className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Deeparted</h2>
          <p className="text-xs text-slate-500 dark:text-github-muted mt-1">Sign in with your Deeparted account.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-github-text mb-1">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-github-border bg-slate-50 dark:bg-github-canvas text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-github-text mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full pl-9 pr-10 py-2 text-sm rounded-lg border border-slate-200 dark:border-github-border bg-slate-50 dark:bg-github-canvas text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-600/30"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}