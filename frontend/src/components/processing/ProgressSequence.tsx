import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

interface ProgressSequenceProps {
  onComplete?: () => void;
  courseName: string;
}

const STAGES = [
  { id: 1, label: 'Reading all material', detail: 'Extracting pages, slides, sections, and text' },
  { id: 2, label: 'Extracting concepts', detail: 'Tokenizing definitions, rules, and formulas' },
  { id: 3, label: 'Identifying important topics', detail: 'Determining high-priority exam areas across the document' },
  { id: 4, label: 'Building revision notes', detail: 'Synthesizing concise high-yield study cards' },
  { id: 5, label: 'Generating practice questions', detail: 'Drafting grounded active recall questions with randomized options' },
  { id: 6, label: 'Verifying content & grounding', detail: 'Tracing citations to original pages and slides' },
  { id: 7, label: 'Preparing workspace', detail: 'Finalizing interactive revision dashboard' },
];

export const ProgressSequence: React.FC<ProgressSequenceProps> = ({ courseName }) => {
  const [currentStage, setCurrentStage] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev < 7 ? prev + 1 : prev));
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto my-12 bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-3 text-indigo-600">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
          Generating Revision Workspace
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          Grounding concepts from <span className="text-indigo-600 font-semibold">{courseName}</span>
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {STAGES.map((stage) => {
          const isDone = currentStage > stage.id;
          const isCurrent = currentStage === stage.id;

          return (
            <div
              key={stage.id}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
                isCurrent
                  ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950 shadow-xs'
                  : isDone
                  ? 'bg-slate-50 border-slate-200 text-slate-800'
                  : 'bg-transparent border-transparent text-slate-400'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-in zoom-in duration-200" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold tracking-wide">
                    {stage.label}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {stage.detail}
                  </div>
                </div>
              </div>

              {isDone && (
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer reassurance */}
      <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-center space-x-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Strict multi-page source tracing &bull; Evidence-based priority</span>
      </div>
    </div>
  );
};
