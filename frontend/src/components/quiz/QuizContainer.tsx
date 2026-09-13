import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { 
  QuizQuestion, 
  QuizSubmissionItem, 
  QuizEvaluationResult, 
  PersonalizationPreferences 
} from '../../types';
import { generateQuiz, evaluateQuiz } from '../../services/api';
import { QuizQuestionCard } from './QuizQuestionCard';
import { QuizResultView } from './QuizResultView';

interface QuizContainerProps {
  fileId: string;
  preferences: PersonalizationPreferences;
  onEvaluationComplete: (result: QuizEvaluationResult) => void;
  onNavigateToExport: () => void;
  onNavigateToRevision: () => void;
  cachedQuestions: QuizQuestion[] | null;
  setCachedQuestions: (q: QuizQuestion[]) => void;
  cachedEvaluation: QuizEvaluationResult | null;
  setCachedEvaluation: (e: QuizEvaluationResult | null) => void;
}

export const QuizContainer: React.FC<QuizContainerProps> = ({
  fileId,
  preferences,
  onEvaluationComplete,
  onNavigateToExport,
  onNavigateToRevision,
  cachedQuestions,
  setCachedQuestions,
  cachedEvaluation,
  setCachedEvaluation,
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(cachedQuestions || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submissions, setSubmissions] = useState<QuizSubmissionItem[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentSelectedIdx, setCurrentSelectedIdx] = useState<number | null>(null);
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);
  const [isLoading, setIsLoading] = useState(!cachedQuestions || cachedQuestions.length === 0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cachedQuestions || cachedQuestions.length === 0) {
      loadQuizQuestions();
    }
  }, [fileId]);

  const loadQuizQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const q = await generateQuiz(fileId, preferences);
      setQuestions(q);
      setCachedQuestions(q);
      setCurrentIndex(0);
      setSubmissions([]);
      setHasAnsweredCurrent(false);
      setCurrentAnswer('');
      setCurrentSelectedIdx(null);
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = (userAnswer: string, selectedOptionIndex?: number) => {
    setCurrentAnswer(userAnswer);
    setCurrentSelectedIdx(selectedOptionIndex !== undefined ? selectedOptionIndex : null);
    setHasAnsweredCurrent(true);

    const q = questions[currentIndex];
    const newSubs = [
      ...submissions.filter(s => s.question_id !== q.id),
      {
        question_id: q.id,
        user_answer: userAnswer,
        selected_option_index: selectedOptionIndex !== undefined ? selectedOptionIndex : null
      }
    ];
    setSubmissions(newSubs);
  };

  const handleNextQuestion = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentAnswer('');
      setCurrentSelectedIdx(null);
      setHasAnsweredCurrent(false);
    } else {
      setIsEvaluating(true);
      try {
        const result = await evaluateQuiz(submissions, questions);
        setCachedEvaluation(result);
        onEvaluationComplete(result);
      } catch (err: any) {
        setError(err.message || 'Failed to score quiz');
      } finally {
        setIsEvaluating(false);
      }
    }
  };

  const handleRetake = () => {
    setCachedEvaluation(null);
    setCurrentIndex(0);
    setSubmissions([]);
    setHasAnsweredCurrent(false);
    setCurrentAnswer('');
    setCurrentSelectedIdx(null);
    loadQuizQuestions();
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900">Generating Active Recall Quiz...</h3>
        <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
          Drafting 5 practice questions with randomized option placement grounded in your uploaded lecture.
        </p>
      </div>
    );
  }

  if (isEvaluating) {
    return (
      <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900">Evaluating Responses Semantically...</h3>
        <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
          Comparing conceptual equivalence, mapping misses to lecture sections, and compiling your 5-minute study sprint.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-rose-50 border border-rose-200 rounded-3xl p-8 max-w-lg mx-auto shadow-xs">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 mb-2">Quiz Generation Issue</h3>
        <p className="text-xs text-rose-800 mb-6">{error}</p>
        <button
          onClick={loadQuizQuestions}
          className="px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 text-xs font-bold transition-colors inline-flex items-center space-x-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Quiz Generation</span>
        </button>
      </div>
    );
  }

  if (cachedEvaluation) {
    return (
      <QuizResultView
        evaluation={cachedEvaluation}
        onRetakeQuiz={handleRetake}
        onNavigateToExport={onNavigateToExport}
        onNavigateToRevision={onNavigateToRevision}
      />
    );
  }

  if (questions.length === 0) {
    return null;
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="py-4">
      <QuizQuestionCard
        question={currentQ}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        onAnswerSubmit={handleAnswerSubmit}
        onNextQuestion={handleNextQuestion}
        hasAnswered={hasAnsweredCurrent}
        userAnswer={currentAnswer}
        selectedOptionIndex={currentSelectedIdx}
        isLastQuestion={currentIndex === questions.length - 1}
      />
    </div>
  );
};
