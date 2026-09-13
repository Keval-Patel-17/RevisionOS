import React, { useState } from 'react';
import { Sliders, X, Sparkles } from 'lucide-react';
import { PersonalizationPreferences } from '../../types';

interface PersonalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prefs: PersonalizationPreferences) => void;
  defaultCourseName?: string;
  isLoading: boolean;
}

export const PersonalizationModal: React.FC<PersonalizationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultCourseName = 'Operating Systems',
  isLoading,
}) => {
  const [courseName, setCourseName] = useState(defaultCourseName);
  const [studyGoal, setStudyGoal] = useState<'Quick Revision' | 'Exam Preparation' | 'Deep Understanding'>('Exam Preparation');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [examStyle, setExamStyle] = useState<'MCQ' | 'Short Answer' | 'Mixed'>('Mixed');
  const [notesLength, setNotesLength] = useState<'Ultra Concise' | 'Balanced' | 'Detailed'>('Balanced');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      course_name: courseName.trim() || 'Course Revision',
      study_goal: studyGoal,
      difficulty,
      exam_style: examStyle,
      notes_length: notesLength,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sliders className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Study Preferences</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Course Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Subject / Course Name
            </label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="e.g. Operating Systems, Computer Networks"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
              required
            />
          </div>

          {/* Study Goal */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Study Goal
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Quick Revision', 'Exam Preparation', 'Deep Understanding'] as const).map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setStudyGoal(goal)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                    studyGoal === goal
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty & Exam Style Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-semibold border text-center transition-all ${
                      difficulty === lvl
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Practice Quiz Style
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['MCQ', 'Short Answer', 'Mixed'] as const).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setExamStyle(style)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-semibold border text-center transition-all ${
                      examStyle === style
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes Length */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Notes Detail Density
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Ultra Concise', 'Balanced', 'Detailed'] as const).map((len) => (
                <button
                  key={len}
                  type="button"
                  onClick={() => setNotesLength(len)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                    notesLength === len
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/20 flex items-center space-x-2 group"
            >
              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>{isLoading ? 'Synthesizing...' : 'Generate Revision Pack'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
