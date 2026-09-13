import React from 'react';
import { Search, Filter } from 'lucide-react';

interface TopicFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedPriority: string;
  setSelectedPriority: (p: string) => void;
  selectedStatus: string;
  setSelectedStatus: (s: string) => void;
  counts: {
    total: number;
    high: number;
    medium: number;
    low: number;
    reviewed: number;
  };
}

export const TopicFilter: React.FC<TopicFilterProps> = ({
  searchQuery,
  setSearchQuery,
  selectedPriority,
  setSelectedPriority,
  selectedStatus,
  setSelectedStatus,
  counts,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 mb-6 space-y-4 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search key concepts, formulas, definitions, topics..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <span className="text-[11px] font-bold text-slate-500 mr-1 hidden sm:inline">Status:</span>
          {(['ALL', 'NEEDS_REVIEW', 'REVIEWED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedStatus === status
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-300 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {status === 'ALL' ? 'All' : status === 'NEEDS_REVIEW' ? 'Needs Review' : 'Reviewed'}
            </button>
          ))}
        </div>
      </div>

      {/* Priority Filters */}
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
        <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center space-x-1">
          <Filter className="w-3 h-3 text-slate-400" />
          <span>Priority:</span>
        </span>

        <button
          onClick={() => setSelectedPriority('ALL')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
            selectedPriority === 'ALL'
              ? 'bg-slate-800 text-white'
              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
          }`}
        >
          All ({counts.total})
        </button>

        <button
          onClick={() => setSelectedPriority('HIGH')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
            selectedPriority === 'HIGH'
              ? 'bg-rose-100 text-rose-800 border-rose-300'
              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
          }`}
        >
          High Priority ({counts.high})
        </button>

        <button
          onClick={() => setSelectedPriority('MEDIUM')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
            selectedPriority === 'MEDIUM'
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
          }`}
        >
          Medium ({counts.medium})
        </button>

        <button
          onClick={() => setSelectedPriority('LOW')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
            selectedPriority === 'LOW'
              ? 'bg-blue-100 text-blue-800 border-blue-300'
              : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
          }`}
        >
          Low ({counts.low})
        </button>
      </div>
    </div>
  );
};
