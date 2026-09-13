import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, Lightbulb, ShieldCheck } from 'lucide-react';
import { QuizQuestion } from '../../types';

interface QuizQuestionCardProps {
  question: QuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  onAnswerSubmit: (userAnswer: string, selectedOptionIndex?: number) => void;
  onNextQuestion: () => void;
  hasAnswered: boolean;
  userAnswer: string;
  selectedOptionIndex?: number | null;
  isLastQuestion: boolean;
}

export const QuizQuestionCard: React.FC<QuizQuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  onAnswerSubmit,
  onNextQuestion,
  hasAnswered,
  userAnswer,
  selectedOptionIndex,
  isLastQuestion,
}) => {
  const [shortAnswerInput, setShortAnswerInput] = useState('');
  const isMCQ = question.question_type === 'MCQ' && question.options && question.options.length > 0;

  const handleShortSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortAnswerInput.trim()) return;
    onAnswerSubmit(shortAnswerInput.trim());
  };

  const handleOptionClick = (opt: string, idx: number) => {
    onAnswerSubmit(opt, idx);
  };

  const isOptionSelected = (opt: string, idx: number) => {
    if (selectedOptionIndex !== undefined && selectedOptionIndex !== null) {
      return selectedOptionIndex === idx;
    }
    return userAnswer.toLowerCase() === opt.toLowerCase();
  };

  const isOptionCorrect = (opt: string, idx: number) => {
    if (question.correct_option_index !== undefined && question.correct_option_index !== null) {
      return question.correct_option_index === idx;
    }
    return question.correct_answer.toLowerCase() === opt.toLowerCase();
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="text-xs text-slate-500 font-semibold truncate max-w-xs">
            {question.topic_title}
          </span>
        </div>

        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
          Source: {question.source_reference}
        </span>
      </div>

      {/* Linear progress bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
        <div
          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question Text */}
      <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-relaxed mb-6">
        {question.question}
      </h2>

      {/* MCQ Options */}
      {isMCQ ? (
        <div className="space-y-2.5 mb-6">
          {question.options!.map((opt, idx) => {
            let btnStyle = 'bg-white border-slate-200 text-slate-800 hover:border-indigo-300 hover:bg-slate-50/80';

            if (hasAnswered) {
              if (isOptionCorrect(opt, idx)) {
                btnStyle = 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold';
              } else if (isOptionSelected(opt, idx) && !isOptionCorrect(opt, idx)) {
                btnStyle = 'bg-rose-50 border-rose-300 text-rose-950';
              } else {
                btnStyle = 'bg-slate-50 border-slate-100 text-slate-400 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                disabled={hasAnswered}
                onClick={() => handleOptionClick(opt, idx)}
                className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-semibold flex items-center justify-between transition-all ${btnStyle}`}
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-mono font-bold text-slate-600 shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </div>

                {hasAnswered && (
                  <div>
                    {isOptionCorrect(opt, idx) && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />
                    )}
                    {isOptionSelected(opt, idx) && !isOptionCorrect(opt, idx) && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 ml-2" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        /* Short Answer Input */
        <div className="mb-6">
          {!hasAnswered ? (
            <form onSubmit={handleShortSubmit} className="space-y-3">
              <input
                type="text"
                value={shortAnswerInput}
                onChange={(e) => setShortAnswerInput(e.target.value)}
                placeholder="Type your concise recall answer here..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
                autoFocus
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!shortAnswerInput.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-xs"
                >
                  Submit Answer
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800">
              <span className="text-slate-500 block text-[11px] font-bold mb-1 uppercase font-mono">Your Submission:</span>
              "{userAnswer}"
            </div>
          )}
        </div>
      )}

      {/* Feedback & Grounding Explanation once answered */}
      {hasAnswered && (
        <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 animate-in fade-in duration-300">
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-700">
            <Lightbulb className="w-4 h-4 text-indigo-600" />
            <span>Explanation & Source Citation:</span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            {question.explanation}
          </p>

          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
            <span className="font-mono font-medium">Expected: <strong className="text-slate-900">{question.correct_answer}</strong></span>
            <span className="flex items-center space-x-1 font-mono font-semibold text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Grounded in {question.source_reference}</span>
            </span>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              onClick={onNextQuestion}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm flex items-center space-x-1.5"
            >
              <span>{isLastQuestion ? 'View Results & Weak Areas' : 'Next Question'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
