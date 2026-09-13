export interface DocumentMetadata {
  file_id: string;
  filename: string;
  file_type: string;
  file_size_bytes: number;
  page_count: number;
  char_count: number;
  extracted_preview: string;
  total_units: number;
  processed_units: number;
  coverage_percentage: number;
}

export interface PersonalizationPreferences {
  course_name: string;
  study_goal: 'Quick Revision' | 'Exam Preparation' | 'Deep Understanding';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  exam_style: 'MCQ' | 'Short Answer' | 'Mixed';
  notes_length: 'Ultra Concise' | 'Balanced' | 'Detailed';
}

export interface StructuredPitfall {
  misconception: string;
  correct_understanding: string;
  why_it_matters: string;
}

export interface ComparisonItem {
  aspect: string;
  concept_a: string;
  concept_b: string;
  details?: string;
}

export interface TopicNote {
  id: string;
  topic_title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  priority_reason: string;
  importance_score: number;
  evidence_signals?: string[];
  summary: string;
  core_explanation?: string;
  key_concepts: string[];
  definitions: string[];
  procedures?: string[];
  formulas_or_rules: string[];
  examples?: string[];
  comparisons?: ComparisonItem[];
  advantages?: string[];
  limitations?: string[];
  applications?: string[];
  common_mistakes: string[];
  structured_pitfalls?: StructuredPitfall[];
  exam_focus_points: string[];
  source_reference: string;
  source_references?: string[];
  reviewed: boolean;
}

export interface RevisionPack {
  course_name: string;
  source_document_name: string;
  study_time_estimate: string;
  revision_readiness_estimate: number;
  high_priority_count: number;
  topics_count: number;
  total_units: number;
  processed_units: number;
  coverage_percentage: number;
  topics: TopicNote[];
  grounding_statement: string;
}

export interface QuizQuestion {
  id: string;
  question_type: 'MCQ' | 'SHORT_ANSWER';
  topic_title: string;
  question: string;
  options?: string[] | null;
  correct_option_index?: number | null;
  correct_answer: string;
  explanation: string;
  source_reference: string;
  difficulty: string;
}

export interface QuizSubmissionItem {
  question_id: string;
  user_answer: string;
  selected_option_index?: number | null;
}

export interface EvaluatedQuestion {
  question_id: string;
  question: string;
  topic_title: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  status: 'CORRECT' | 'PARTIAL' | 'INCORRECT';
  score_earned: number;
  feedback: string;
  missing_concepts: string[];
  explanation: string;
  source_reference: string;
}

export interface WeakTopic {
  topic_title: string;
  reason: string;
  recommended_revision_points: string[];
  source_reference: string;
}

export interface QuizEvaluationResult {
  score: number;
  total_questions: number;
  percentage: number;
  evaluated_questions: EvaluatedQuestion[];
  weak_topics: WeakTopic[];
  revise_this_next_summary: string;
  updated_readiness_estimate: number;
}
