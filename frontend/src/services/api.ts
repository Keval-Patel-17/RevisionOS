import {
  DocumentMetadata,
  PersonalizationPreferences,
  RevisionPack,
  QuizQuestion,
  QuizSubmissionItem,
  QuizEvaluationResult
} from '../types';

const API_BASE = '/api';

export async function uploadDocument(file: File): Promise<DocumentMetadata> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Failed to upload document');
  }

  return res.json();
}

export async function loadDemoDocument(): Promise<DocumentMetadata> {
  const res = await fetch(`${API_BASE}/demo`, {
    method: 'POST',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Demo load failed' }));
    throw new Error(err.detail || 'Failed to load demo document');
  }

  return res.json();
}

export async function generateRevision(
  file_id: string,
  prefs: PersonalizationPreferences
): Promise<RevisionPack> {
  const res = await fetch(`${API_BASE}/generate-revision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_id,
      course_name: prefs.course_name,
      study_goal: prefs.study_goal,
      difficulty: prefs.difficulty,
      exam_style: prefs.exam_style,
      notes_length: prefs.notes_length,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Generation failed' }));
    throw new Error(err.detail || 'Failed to generate revision workspace');
  }

  return res.json();
}

export async function generateQuiz(
  file_id: string,
  prefs: PersonalizationPreferences
): Promise<QuizQuestion[]> {
  const res = await fetch(`${API_BASE}/generate-quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_id,
      course_name: prefs.course_name,
      difficulty: prefs.difficulty,
      exam_style: prefs.exam_style,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Quiz generation failed' }));
    throw new Error(err.detail || 'Failed to generate practice quiz');
  }

  return res.json();
}

export async function evaluateQuiz(
  submissions: QuizSubmissionItem[],
  quiz_questions: QuizQuestion[]
): Promise<QuizEvaluationResult> {
  const res = await fetch(`${API_BASE}/quiz/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ submissions, quiz_questions }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Evaluation failed' }));
    throw new Error(err.detail || 'Failed to evaluate quiz');
  }

  return res.json();
}

export async function downloadRevisionPack(
  format: 'pdf' | 'docx' | 'markdown',
  revision_pack: RevisionPack,
  quiz_questions?: QuizQuestion[],
  quiz_evaluation?: QuizEvaluationResult
): Promise<void> {
  const res = await fetch(`${API_BASE}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      format,
      revision_pack,
      quiz_questions,
      quiz_evaluation,
    }),
  });

  if (!res.ok) {
    throw new Error('Export download failed');
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  const ext = format === 'markdown' ? 'md' : format;
  const safeName = revision_pack.course_name.replace(/[^a-zA-Z0-9_-]/g, '_');
  a.download = `${safeName}_RevisionOS_Pack.${ext}`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
