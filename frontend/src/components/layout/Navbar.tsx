import React from 'react';
import { BookOpen, Sparkles, RefreshCw } from 'lucide-react';

interface NavbarProps {
  currentTab: 'upload' | 'revision' | 'quiz' | 'export';
  setCurrentTab: (tab: 'upload' | 'revision' | 'quiz' | 'export') => void;
  hasPack: boolean;
  readiness: number;
  onReset: () => void;
  onTryDemo: () => void;
  isDemoLoading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  hasPack,
  readiness,
  onReset,
  onTryDemo,
  isDemoLoading,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={onReset}
          className="flex items-center space-x-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">Revision<span className="text-indigo-600">OS</span></span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                PROMPT WARS
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">From lecture to exam-ready revision</p>
          </div>
        </div>

        {/* Workflow Navigation Tabs - Desktop */}
        {hasPack && (
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setCurrentTab('revision')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'revision'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Revision Notes
            </button>
            <button
              onClick={() => setCurrentTab('quiz')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'quiz'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Practice Quiz
            </button>
            <button
              onClick={() => setCurrentTab('export')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'export'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Export Pack
            </button>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {hasPack ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Readiness indicator pill */}
              <div className="flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
                <span className="text-[10px] sm:text-[11px] font-medium text-slate-600">Readiness:</span>
                <span className={`text-xs font-bold ${
                  readiness >= 75 ? 'text-emerald-700' : readiness >= 40 ? 'text-amber-700' : 'text-slate-700'
                }`}>
                  {readiness}%
                </span>
                <div className="w-8 sm:w-10 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${readiness}%` }}
                  />
                </div>
              </div>

              <button
                onClick={onReset}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                title="Start New Revision"
                aria-label="Start New Revision"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onTryDemo}
              disabled={isDemoLoading}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-all shadow-xs group"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 group-hover:rotate-12 transition-transform" />
              <span>{isDemoLoading ? 'Loading Demo...' : 'Try Demo (OS Scheduling)'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Workflow Navigation Tabs - Mobile Bar */}
      {hasPack && (
        <div className="md:hidden border-t border-slate-200/80 bg-slate-50/95 px-4 py-2 flex items-center justify-around">
          <button
            onClick={() => setCurrentTab('revision')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              currentTab === 'revision'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600'
            }`}
          >
            Notes
          </button>
          <button
            onClick={() => setCurrentTab('quiz')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              currentTab === 'quiz'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600'
            }`}
          >
            Quiz
          </button>
          <button
            onClick={() => setCurrentTab('export')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              currentTab === 'export'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600'
            }`}
          >
            Export
          </button>
        </div>
      )}
    </header>
  );
};
