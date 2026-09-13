import {
  DocumentMetadata,
  PersonalizationPreferences,
  RevisionPack,
  QuizQuestion,
  QuizSubmissionItem,
  QuizEvaluationResult
} from '../types';

const API_BASE = '/api';
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.pptx', '.txt'];
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = 60000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. The server took too long to respond. Please try again.');
    }
    throw err;
  }
}

async function handleApiResponse(res: Response, fallbackErrorMsg: string) {
  if (!res.ok) {
    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After');
      throw new Error(`Rate limit reached. Please slow down and wait ${retryAfter ? `${retryAfter}s` : 'a moment'} before trying again.`);
    }
    const err = await res.json().catch(() => ({ detail: fallbackErrorMsg }));
    throw new Error(err.detail || fallbackErrorMsg);
  }
  return res.json();
}

export async function uploadDocument(file: File): Promise<DocumentMetadata> {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(`Unsupported file type '${ext}'. Please upload a PDF, DOCX, PPTX, or TXT lecture document.`);
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 25MB limit.`);
  }

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetchWithTimeout(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  }, 45000);

  return handleApiResponse(res, 'Failed to upload and extract document contents.');
}

export async function loadDemoDocument(): Promise<DocumentMetadata> {
  const res = await fetchWithTimeout(`${API_BASE}/demo`, {
    method: 'POST',
  }, 30000);

  return handleApiResponse(res, 'Failed to load demo document asset.');
}

export async function generateRevision(
  file_id: string,
  prefs: PersonalizationPreferences
): Promise<RevisionPack> {
  const res = await fetchWithTimeout(`${API_BASE}/generate-revision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_id,
      course_name: prefs.course_name.trim().slice(0, 120),
      study_goal: prefs.study_goal.trim().slice(0, 60),
      difficulty: prefs.difficulty.trim().slice(0, 40),
      exam_style: prefs.exam_style.trim().slice(0, 40),
      notes_length: prefs.notes_length.trim().slice(0, 40),
    }),
  }, 90000);

  return handleApiResponse(res, 'Failed to generate revision workspace.');
}

export async function generateQuiz(
  file_id: string,
  prefs: PersonalizationPreferences
): Promise<QuizQuestion[]> {
  const res = await fetchWithTimeout(`${API_BASE}/generate-quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_id,
      course_name: prefs.course_name.trim().slice(0, 120),
      difficulty: prefs.difficulty.trim().slice(0, 40),
      exam_style: prefs.exam_style.trim().slice(0, 40),
    }),
  }, 90000);

  return handleApiResponse(res, 'Failed to generate practice quiz.');
}

export async function evaluateQuiz(
  submissions: QuizSubmissionItem[],
  quiz_questions: QuizQuestion[]
): Promise<QuizEvaluationResult> {
  const res = await fetchWithTimeout(`${API_BASE}/quiz/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ submissions, quiz_questions }),
  }, 45000);

  return handleApiResponse(res, 'Failed to evaluate quiz submissions.');
}

export async function downloadRevisionPack(
  format: 'pdf' | 'docx' | 'markdown',
  revision_pack: RevisionPack,
  quiz_questions?: QuizQuestion[],
  quiz_evaluation?: QuizEvaluationResult
): Promise<void> {
  const res = await fetchWithTimeout(`${API_BASE}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      format,
      revision_pack,
      quiz_questions,
      quiz_evaluation,
    }),
  }, 45000);

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error('Export rate limit reached. Please wait a moment.');
    }
    throw new Error('Export download failed. Please try again.');
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  const ext = format === 'markdown' ? 'md' : format;
  const safeName = revision_pack.course_name.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 50);
  a.download = `${safeName || 'RevisionOS'}_Revision_Pack.${ext}`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
