import React, { useState } from 'react';
import { 
  FileDown, 
  X, 
  FileText, 
  Download, 
  CheckCircle2, 
  FileCode, 
  Loader2,
  ShieldCheck,
  Award
} from 'lucide-react';
import { RevisionPack, QuizQuestion, QuizEvaluationResult } from '../../types';
import { downloadRevisionPack } from '../../services/api';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pack: RevisionPack;
  quizQuestions?: QuizQuestion[] | null;
  quizEvaluation?: QuizEvaluationResult | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  pack,
  quizQuestions,
  quizEvaluation,
}) => {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async (format: 'pdf' | 'docx' | 'markdown') => {
    setDownloadingFormat(format);
    setError(null);
    try {
      await downloadRevisionPack(
        format,
        pack,
        quizQuestions || undefined,
        quizEvaluation || undefined
      );
    } catch (err: any) {
      setError(err.message || 'Export failed. Please try again.');
    } finally {
      setDownloadingFormat(null);
    }
  };

  const totalFormulas = pack.topics.reduce((sum, t) => sum + (t.formulas_or_rules?.length || 0), 0);
  const totalMistakes = pack.topics.reduce((sum, t) => sum + (t.common_mistakes?.length || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-800">
        {/* Subtle Decorative Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Export Revision Pack</h3>
              <p className="text-xs text-slate-500">Shareable, complete academic study bundle</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pack Contents Summary */}
        <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider block">
            Revision Pack Inclusions
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2 text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{pack.topics.length} Grounded Topic Summaries</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{pack.high_priority_count} High-Priority Exam Notes</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{totalFormulas} Formulas & Core Rules</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{totalMistakes} Common Pitfall Warnings</span>
            </div>
            {quizQuestions && quizQuestions.length > 0 && (
              <div className="flex items-center space-x-2 text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>5-Question Practice Recall Quiz</span>
              </div>
            )}
            {quizEvaluation && (
              <div className="flex items-center space-x-2 text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Weak-Area Micro-Revision Plan</span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Export Format Cards */}
        <div className="space-y-2.5 mb-6">
          {/* PDF */}
          <button
            onClick={() => handleExport('pdf')}
            disabled={downloadingFormat !== null}
            className="w-full p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 hover:shadow-sm transition-all flex items-center justify-between group text-left"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 font-bold text-xs font-mono group-hover:scale-105 transition-transform">
                PDF
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Publication-Ready PDF
                </h4>
                <p className="text-xs text-slate-500">
                  Formatted typography, tables, and formula callouts for printing & offline review.
                </p>
              </div>
            </div>
            <div>
              {downloadingFormat === 'pdf' ? (
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              ) : (
                <Download className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              )}
            </div>
          </button>

          {/* Word DOCX */}
          <button
            onClick={() => handleExport('docx')}
            disabled={downloadingFormat !== null}
            className="w-full p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 hover:shadow-sm transition-all flex items-center justify-between group text-left"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs font-mono group-hover:scale-105 transition-transform">
                DOCX
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Microsoft Word Document (.docx)
                </h4>
                <p className="text-xs text-slate-500">
                  Editable document with heading hierarchies and list bullets.
                </p>
              </div>
            </div>
            <div>
              {downloadingFormat === 'docx' ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : (
                <Download className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              )}
            </div>
          </button>

          {/* Markdown */}
          <button
            onClick={() => handleExport('markdown')}
            disabled={downloadingFormat !== null}
            className="w-full p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 hover:bg-purple-50/20 hover:shadow-sm transition-all flex items-center justify-between group text-left"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 font-bold text-xs font-mono group-hover:scale-105 transition-transform">
                MD
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                  GitHub-Flavored Markdown (.md)
                </h4>
                <p className="text-xs text-slate-500">
                  Clean portable markdown for Obsidian, Notion, and GitHub repos.
                </p>
              </div>
            </div>
            <div>
              {downloadingFormat === 'markdown' ? (
                <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
              ) : (
                <Download className="w-5 h-5 text-slate-400 group-hover:text-purple-600 transition-colors" />
              )}
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Clean student export &bull; No prompt leakage</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
