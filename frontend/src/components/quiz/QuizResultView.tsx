import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, 
  RotateCcw, 
  FileDown, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Lightbulb, 
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { QuizEvaluationResult } from '../../types';
import { MicroRevisionCard } from './MicroRevisionCard';

interface QuizResultViewProps {
  evaluation: QuizEvaluationResult;
  onRetakeQuiz: () => void;
  onNavigateToExport: () => void;
  onNavigateToRevision: () => void;
}

export const QuizResultView: React.FC<QuizResultViewProps> = ({
  evaluation,
  onRetakeQuiz,
  onNavigateToExport,
  onNavigateToRevision,
}) => {
  useEffect(() => {
    if (evaluation.percentage >= 60) {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#6366f1', '#f59e0b']
      });
    }
  }, [evaluation]);

  const isGoodScore = evaluation.percentage >= 70;
  const isModerateScore = evaluation.percentage >= 40 && evaluation.percentage < 70;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Score Summary Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4 text-indigo-600">
          <Award className="w-8 h-8" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Quiz Completed!
        </h2>

        <div className="flex items-center justify-center space-x-3 my-4">
          <span className="text-4xl sm:text-5xl font-black text-slate-900">
            {evaluation.score}
            <span className="text-2xl sm:text-3xl font-semibold text-slate-400"> / {evaluation.total_questions}</span>
          </span>
          <span className={`text-sm font-bold px-3.5 py-1.5 rounded-full border ${
            isGoodScore 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
              : isModerateScore
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : 'bg-rose-50 text-rose-800 border-rose-300'
          }`}>
            {evaluation.percentage}% Recall Score
          </span>
        </div>

        <div className="flex items-center justify-center space-x-2 text-xs text-slate-600">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Updated Revision Readiness: <strong className="text-emerald-700 font-mono font-bold">{evaluation.updated_readiness_estimate}%</strong></span>
        </div>

        {/* Quick Action Buttons */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onRetakeQuiz}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors flex items-center space-x-2 shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Quiz</span>
          </button>
          <button
            onClick={onNavigateToRevision}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors"
          >
            Review Notes
          </button>
          <button
            onClick={onNavigateToExport}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm flex items-center space-x-1.5"
          >
            <FileDown className="w-4 h-4" />
            <span>Export Full Revision Pack</span>
          </button>
        </div>
      </div>

      {/* Adaptive Micro-Revision Section ("Revise This Next") */}
      <MicroRevisionCard
        weakTopics={evaluation.weak_topics}
        summary={evaluation.revise_this_next_summary}
      />

      {/* Question-by-Question Deep Dive */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <span>Question-by-Question Evaluation & Grounding</span>
        </h3>

        <div className="space-y-4">
          {evaluation.evaluated_questions.map((eq, idx) => {
            const isCorrect = eq.status === 'CORRECT' || (eq.is_correct && !eq.status);
            const isPartial = eq.status === 'PARTIAL';

            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition-all ${
                  isCorrect
                    ? 'bg-emerald-50/30 border-emerald-200'
                    : isPartial
                    ? 'bg-amber-50/40 border-amber-200'
                    : 'bg-rose-50/30 border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center space-x-2.5">
                    {isCorrect ? (
                      <span className="flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>✓ Correct</span>
                      </span>
                    ) : isPartial ? (
                      <span className="flex items-center space-x-1 text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>△ Partially Correct ({Math.round((eq.score_earned || 0.5) * 100)}%)</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>✗ Needs Review</span>
                      </span>
                    )}

                    <span className="text-xs font-mono font-bold text-slate-500">
                      Q{idx + 1}: {eq.topic_title}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 shadow-xs">
                    Source: {eq.source_reference}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mb-3">
                  {eq.question}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">Your Submission:</span>
                    <span className={isCorrect ? 'text-emerald-800 font-semibold' : isPartial ? 'text-amber-900 font-semibold' : 'text-rose-800 font-semibold'}>
                      {eq.user_answer}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">Verified Answer:</span>
                    <span className="text-slate-900 font-semibold font-mono">
                      {eq.correct_answer}
                    </span>
                  </div>
                </div>

                {/* Feedback and missing concepts if present */}
                {eq.feedback && (
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 mb-2 shadow-xs">
                    <span className="font-bold text-slate-900">Feedback: </span>
                    {eq.feedback}
                    {eq.missing_concepts && eq.missing_concepts.length > 0 && (
                      <div className="mt-1 text-amber-800 font-medium">
                        Missing Concept(s): {eq.missing_concepts.join(', ')}
                      </div>
                    )}
                  </div>
                )}

                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 flex items-start space-x-2 shadow-xs">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold text-slate-900">Grounded Context: </span>
                    {eq.explanation}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
