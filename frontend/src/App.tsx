import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Target, 
  Award, 
  FileDown, 
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  DocumentMetadata, 
  PersonalizationPreferences, 
  RevisionPack, 
  QuizQuestion, 
  QuizEvaluationResult 
} from './types';
import { 
  uploadDocument, 
  loadDemoDocument, 
  generateRevision 
} from './services/api';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Dropzone } from './components/upload/Dropzone';
import { PersonalizationModal } from './components/upload/PersonalizationModal';
import { ProgressSequence } from './components/processing/ProgressSequence';
import { OverviewHeader } from './components/dashboard/OverviewHeader';
import { TopicFilter } from './components/revision/TopicFilter';
import { TopicCard } from './components/revision/TopicCard';
import { QuizContainer } from './components/quiz/QuizContainer';
import { ExportModal } from './components/export/ExportModal';

export const App: React.FC = () => {
  // Application State
  const [currentTab, setCurrentTab] = useState<'upload' | 'revision' | 'quiz' | 'export'>('upload');
  const [metadata, setMetadata] = useState<DocumentMetadata | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [isPersonalizing, setIsPersonalizing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Revision Pack State
  const [revisionPack, setRevisionPack] = useState<RevisionPack | null>(null);
  const [userPreferences, setUserPreferences] = useState<PersonalizationPreferences>({
    course_name: 'Operating Systems',
    study_goal: 'Exam Preparation',
    difficulty: 'Intermediate',
    exam_style: 'Mixed',
    notes_length: 'Balanced',
  });

  // Revision Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [quizEvaluation, setQuizEvaluation] = useState<QuizEvaluationResult | null>(null);

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Compute live readiness score
  const computeReadiness = () => {
    if (!revisionPack || revisionPack.topics.length === 0) return 0;
    const reviewedCount = revisionPack.topics.filter(t => t.reviewed).length;
    const coverageScore = (reviewedCount / revisionPack.topics.length) * 40; // 40% coverage
    const quizScoreWeight = quizEvaluation ? (quizEvaluation.percentage / 100) * 60 : 0; // 60% quiz weight
    return Math.min(100, Math.round(coverageScore + quizScoreWeight));
  };

  const readinessEstimate = computeReadiness();
  const reviewedTopicsCount = revisionPack ? revisionPack.topics.filter(t => t.reviewed).length : 0;

  // File Upload Handlers
  const handleFileSelected = async (file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      const meta = await uploadDocument(file);
      setMetadata(meta);
      setUserPreferences(prev => ({
        ...prev,
        course_name: meta.filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ")
      }));
    } catch (err: any) {
      setError(err.message || 'File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTryDemo = async () => {
    setIsDemoLoading(true);
    setError(null);
    try {
      const meta = await loadDemoDocument();
      setMetadata(meta);
      setUserPreferences({
        course_name: 'Operating Systems (CPU Scheduling)',
        study_goal: 'Exam Preparation',
        difficulty: 'Intermediate',
        exam_style: 'Mixed',
        notes_length: 'Balanced',
      });
      // Directly open personalization modal for instant judge flow
      setIsPersonalizing(true);
    } catch (err: any) {
      setError(err.message || 'Failed to load demo asset');
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setMetadata(null);
    setError(null);
  };

  const handlePreferencesSubmit = async (prefs: PersonalizationPreferences) => {
    setUserPreferences(prefs);
    setIsPersonalizing(false);
    setIsProcessing(true);
    setError(null);

    try {
      const pack = await generateRevision(metadata!.file_id, prefs);
      setRevisionPack(pack);
      setCurrentTab('revision');
    } catch (err: any) {
      setError(err.message || 'Failed to generate revision pack');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleReviewed = (topicId: string) => {
    if (!revisionPack) return;
    const updatedTopics = revisionPack.topics.map(t => {
      if (t.id === topicId) {
        return { ...t, reviewed: !t.reviewed };
      }
      return t;
    });
    setRevisionPack({ ...revisionPack, topics: updatedTopics });
  };

  const handleReset = () => {
    setMetadata(null);
    setRevisionPack(null);
    setQuizQuestions(null);
    setQuizEvaluation(null);
    setCurrentTab('upload');
    setError(null);
  };

  // Filter topics
  const filteredTopics = (revisionPack?.topics || []).filter(topic => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = topic.topic_title.toLowerCase().includes(q);
      const matchesSummary = topic.summary.toLowerCase().includes(q);
      const matchesConcepts = topic.key_concepts.some(k => k.toLowerCase().includes(q));
      const matchesFormulas = topic.formulas_or_rules.some(f => f.toLowerCase().includes(f ? q : ''));
      if (!matchesTitle && !matchesSummary && !matchesConcepts && !matchesFormulas) {
        return false;
      }
    }

    // Priority filter
    if (selectedPriority !== 'ALL' && topic.priority !== selectedPriority) {
      return false;
    }

    // Status filter
    if (selectedStatus === 'NEEDS_REVIEW' && topic.reviewed) return false;
    if (selectedStatus === 'REVIEWED' && !topic.reviewed) return false;

    return true;
  });

  const priorityCounts = {
    total: revisionPack?.topics.length || 0,
    high: (revisionPack?.topics || []).filter(t => t.priority === 'HIGH').length,
    medium: (revisionPack?.topics || []).filter(t => t.priority === 'MEDIUM').length,
    low: (revisionPack?.topics || []).filter(t => t.priority === 'LOW').length,
    reviewed: reviewedTopicsCount,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'export') {
            setIsExportModalOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        hasPack={revisionPack !== null}
        readiness={readinessEstimate}
        onReset={handleReset}
        onTryDemo={handleTryDemo}
        isDemoLoading={isDemoLoading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Error notification banner */}
        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-700 flex items-center justify-between shadow-sm">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800 font-bold ml-4">Dismiss</button>
          </div>
        )}

        {/* Step 3: AI Processing Screen */}
        {isProcessing ? (
          <ProgressSequence courseName={userPreferences.course_name} />
        ) : !revisionPack ? (
          /* Step 1: Landing & Upload View */
          <div className="py-6 sm:py-12 space-y-12">
            {/* Hero Text */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Active Exam Revision Architecture</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Turn lecture material into <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700">exam-ready revision</span>.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Upload your lecture material. RevisionOS extracts the important concepts, builds concise notes, and creates a practice quiz grounded in your content.
              </p>
            </div>

            {/* Upload Area */}
            <Dropzone
              onFileSelected={handleFileSelected}
              metadata={metadata}
              onRemoveFile={handleRemoveFile}
              isLoading={isUploading}
              onProceed={() => setIsPersonalizing(true)}
              onTryDemo={handleTryDemo}
              isDemoLoading={isDemoLoading}
            />

            {/* 3 Core Value Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-6">
              <div className="bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow rounded-2xl p-6 relative overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">Strict Source Grounding</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Zero hallucinated outside theorems. Every topic, formula, and recall question explicitly traces to page and slide citations.
                </p>
              </div>

              <div className="bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow rounded-2xl p-6 relative overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-4">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">Smart Topic Prioritization</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Classifies concepts into HIGH, MEDIUM, and LOW revision priority using structural signals like definitions, formulas, and repetition.
                </p>
              </div>

              <div className="bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow rounded-2xl p-6 relative overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">Closed-Loop Active Recall</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  5-question practice quiz that detects weak areas and immediately creates a targeted 5-minute micro-revision plan.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Active Revision Workspace */
          <div>
            {/* Overview Dashboard Header */}
            <OverviewHeader
              pack={revisionPack}
              readiness={readinessEstimate}
              reviewedCount={reviewedTopicsCount}
              quizScore={quizEvaluation ? quizEvaluation.score : null}
              quizTotal={quizEvaluation ? quizEvaluation.total_questions : (quizQuestions?.length || 5)}
              onNavigateTab={(tab) => {
                if (tab === 'export') {
                  setIsExportModalOpen(true);
                } else {
                  setCurrentTab(tab);
                }
              }}
            />

            {/* Workflow View Switcher */}
            {currentTab === 'revision' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <TopicFilter
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedPriority={selectedPriority}
                  setSelectedPriority={setSelectedPriority}
                  selectedStatus={selectedStatus}
                  setSelectedStatus={setSelectedStatus}
                  counts={priorityCounts}
                />

                {filteredTopics.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 shadow-xs">
                    <p className="text-sm text-slate-500">No topics match your current filter or search criteria.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTopics.map((topic) => (
                      <TopicCard
                        key={topic.id}
                        topic={topic}
                        onToggleReviewed={handleToggleReviewed}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentTab === 'quiz' && (
              <QuizContainer
                fileId={metadata?.file_id || 'demo'}
                preferences={userPreferences}
                onEvaluationComplete={(result) => setQuizEvaluation(result)}
                onNavigateToExport={() => setIsExportModalOpen(true)}
                onNavigateToRevision={() => setCurrentTab('revision')}
                cachedQuestions={quizQuestions}
                setCachedQuestions={setQuizQuestions}
                cachedEvaluation={quizEvaluation}
                setCachedEvaluation={setQuizEvaluation}
              />
            )}
          </div>
        )}
      </main>

      {/* Step 2: Personalization Preferences Modal */}
      <PersonalizationModal
        isOpen={isPersonalizing}
        onClose={() => setIsPersonalizing(false)}
        onSubmit={handlePreferencesSubmit}
        defaultCourseName={userPreferences.course_name}
        isLoading={isProcessing}
      />

      {/* Export Revision Pack Modal */}
      {revisionPack && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          pack={revisionPack}
          quizQuestions={quizQuestions}
          quizEvaluation={quizEvaluation}
        />
      )}

      {/* Trust & Academic Disclaimer Footer */}
      <Footer />
    </div>
  );
};

export default App;
