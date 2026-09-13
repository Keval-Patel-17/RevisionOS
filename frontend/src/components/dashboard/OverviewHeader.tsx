import React from 'react';
import { Play, FileDown, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { RevisionPack } from '../../types';

interface OverviewHeaderProps {
  pack: RevisionPack;
  readiness: number;
  reviewedCount: number;
  quizScore: number | null;
  quizTotal: number;
  onNavigateTab: (tab: 'revision' | 'quiz' | 'export') => void;
}

export const OverviewHeader: React.FC<OverviewHeaderProps> = ({
  pack,
  readiness,
  reviewedCount,
  quizScore,
  quizTotal,
  onNavigateTab,
}) => {
  const coveragePct = Math.round((reviewedCount / Math.max(1, pack.topics.length)) * 100);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-8 relative overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Course & Source Metadata */}
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold uppercase">
              Active Revision Workspace
            </span>
            <span className="text-slate-400">&bull;</span>
            <span className="text-slate-600 font-medium truncate max-w-xs">{pack.source_document_name}</span>
            <span className="text-slate-400">&bull;</span>
            {/* Document Coverage Metric */}
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Coverage: {pack.coverage_percentage}% ({pack.processed_units}/{pack.total_units} units)</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {pack.course_name}
          </h1>

          <p className="text-xs text-slate-600 mt-2 max-w-xl leading-relaxed">
            {pack.grounding_statement}
          </p>
        </div>

        {/* Readiness Gauge Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex items-center space-x-5 shrink-0 shadow-xs">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
            {/* SVG Circular Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 transition-all duration-700 ease-out"
                strokeDasharray={`${readiness}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base sm:text-lg font-black text-slate-900">{readiness}%</span>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase font-bold text-slate-700 tracking-wider">
              Revision Readiness
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Coverage: <span className="text-slate-900 font-semibold">{coveragePct}%</span> ({reviewedCount}/{pack.topics.length} reviewed)
            </div>
            <div className="text-xs text-slate-500">
              Quiz: {quizScore !== null ? (
                <span className="text-emerald-700 font-semibold">{quizScore}/{quizTotal} score</span>
              ) : (
                <span className="text-slate-400">Not taken yet</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-100">
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
          <div className="text-[11px] uppercase font-bold text-slate-500">Topics Detected</div>
          <div className="text-2xl font-black text-slate-900 mt-1 flex items-center space-x-2">
            <span>{pack.topics.length}</span>
            <span className="text-[10px] font-semibold text-indigo-600 font-mono">Grounded</span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
          <div className="text-[11px] uppercase font-bold text-rose-600">High Priority</div>
          <div className="text-2xl font-black text-rose-700 mt-1 flex items-center space-x-2">
            <span>{pack.high_priority_count}</span>
            <span className="text-[10px] font-semibold text-rose-500 font-mono">Exam Yield</span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
          <div className="text-[11px] uppercase font-bold text-slate-500">Study Estimate</div>
          <div className="text-2xl font-black text-slate-900 mt-1 flex items-center space-x-2">
            <span>{pack.study_time_estimate}</span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
          <div className="text-[11px] uppercase font-bold text-emerald-700">Reviewed Topics</div>
          <div className="text-2xl font-black text-emerald-800 mt-1 flex items-center space-x-2">
            <span>{reviewedCount} / {pack.topics.length}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-6 border-t border-slate-100">
        <div className="text-xs text-slate-500">
          Recommended Next Step: {quizScore === null ? 'Test yourself with the active recall quiz.' : 'Download your full Revision Pack.'}
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => onNavigateTab('revision')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
          >
            Review Notes
          </button>
          <button
            onClick={() => onNavigateTab('quiz')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-all shadow-xs flex items-center space-x-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{quizScore !== null ? 'Retake Quiz' : 'Take Practice Quiz'}</span>
          </button>
          <button
            onClick={() => onNavigateTab('export')}
            className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors flex items-center space-x-1.5"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Pack</span>
          </button>
        </div>
      </div>
    </div>
  );
};
