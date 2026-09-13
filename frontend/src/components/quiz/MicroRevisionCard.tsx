import React from 'react';
import { Sparkles, Clock, Target } from 'lucide-react';
import { WeakTopic } from '../../types';

interface MicroRevisionCardProps {
  weakTopics: WeakTopic[];
  summary: string;
}

export const MicroRevisionCard: React.FC<MicroRevisionCardProps> = ({
  weakTopics,
  summary,
}) => {
  if (!weakTopics || weakTopics.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center shadow-xs">
        <Sparkles className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
        <h4 className="text-base font-bold text-slate-900">Full Concept Mastery Achieved!</h4>
        <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
          You achieved full recall across all tested topics. All tested principles are verified. You can now download your Revision Pack or explore deeper notes.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Revise This Next — Your 5-Minute Targeted Sprint
            </h4>
            <p className="text-[11px] text-amber-800 font-semibold">
              Closed-Loop Adaptation: Derived strictly from your quiz performance
            </p>
          </div>
        </div>

        <span className="text-[11px] uppercase font-mono font-bold px-2.5 py-1 rounded-full bg-white text-amber-800 border border-amber-200 shadow-xs">
          {weakTopics.length} Focus Area{weakTopics.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Summary instruction */}
      <div className="p-3.5 rounded-2xl bg-white border border-amber-200 text-xs text-slate-700 leading-relaxed mb-5 shadow-xs">
        <span className="font-bold text-amber-900">Action Plan: </span>
        {summary}
      </div>

      {/* Weak Topics List */}
      <div className="space-y-3.5">
        {weakTopics.map((wt, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-amber-600 shrink-0" />
                <h5 className="text-sm font-bold text-slate-900">{wt.topic_title}</h5>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                Source: {wt.source_reference}
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-3 font-medium">
              {wt.reason}
            </p>

            {/* Targeted bullets */}
            <ul className="space-y-1.5 text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {wt.recommended_revision_points.map((pt, pIdx) => (
                <li key={pIdx} className="flex items-start space-x-2">
                  <span className="text-amber-600 font-bold shrink-0">&bull;</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
