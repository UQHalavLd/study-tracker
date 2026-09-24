// ============================================================
// TypeScript Tip Tanımları
// ============================================================

// --- Veritabanı Enum Tipleri ---
export type ExamType = 'tyt' | 'ayt' | 'custom';
export type BookStatus = 'active' | 'completed' | 'paused';
export type PlanStatus = 'draft' | 'active' | 'completed' | 'archived';
export type SeverityLevel = 'low' | 'medium' | 'high';
export type SubjectCategory = 'sozel' | 'sayisal' | 'esitagirlik' | 'dil' | 'genel';

// --- Veritabanı Tablo Tipleri ---

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  daily_study_hours: number;
  target_exam: ExamType;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  name: string;
  exam_type: ExamType;
  category: SubjectCategory;
  question_count: number;
  sort_order: number;
  created_at: string;
}

export interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string | null;
  isbn: string | null;
  cover_url: string | null;
  total_pages: number;
  current_page: number;
  subject_id: string | null;
  target_date: string | null;
  status: BookStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // İlişkisel
  subject?: Subject;
}

export interface MockExam {
  id: string;
  user_id: string;
  exam_type: ExamType;
  exam_name: string;
  exam_date: string;
  total_net: number | null;
  total_score: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // İlişkisel
  scores?: MockExamScore[];
}

export interface MockExamScore {
  id: string;
  mock_exam_id: string;
  subject_id: string;
  correct_count: number;
  wrong_count: number;
  empty_count: number;
  net: number;
  score: number | null;
  created_at: string;
  // İlişkisel
  subject?: Subject;
}

export interface StudyPlan {
  id: string;
  user_id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: PlanStatus;
  ai_prompt: string | null;
  ai_response: string | null;
  created_at: string;
  updated_at: string;
  // İlişkisel
  tasks?: StudyTask[];
}

export interface StudyTask {
  id: string;
  plan_id: string;
  user_id: string;
  book_id: string | null;
  subject_id: string | null;
  title: string;
  description: string | null;
  task_date: string;
  start_time: string | null;
  duration_minutes: number;
  page_start: number | null;
  page_end: number | null;
  is_completed: boolean;
  completed_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // İlişkisel
  book?: Book;
  subject?: Subject;
}

export interface WeakTopic {
  id: string;
  user_id: string;
  subject_id: string;
  topic_name: string;
  severity: SeverityLevel;
  detected_at: string;
  resolved: boolean;
  notes: string | null;
  // İlişkisel
  subject?: Subject;
}

// --- View Tipleri ---

export interface BookProgressSummary {
  id: string;
  user_id: string;
  title: string;
  total_pages: number;
  current_page: number;
  progress_percent: number;
  target_date: string | null;
  remaining_days: number | null;
  daily_page_target: number | null;
  status: BookStatus;
}

// --- Google Books API ---

export interface GoogleBookResult {
  id: string;
  title: string;
  authors: string[];
  pageCount: number;
  imageLinks?: {
    thumbnail: string;
    smallThumbnail: string;
  };
  isbn?: string;
}

// --- AI Plan Üretimi ---

export interface AIPlanRequest {
  books: Pick<Book, 'id' | 'title' | 'total_pages' | 'current_page' | 'target_date' | 'subject_id'>[];
  examScores: {
    subject_name: string;
    net: number;
    question_count: number;
  }[];
  weakTopics: Pick<WeakTopic, 'topic_name' | 'severity' | 'subject_id'>[];
  dailyStudyHours: number;
  startDate: string;
  endDate: string;
}

export interface AIPlanTask {
  title: string;
  description: string;
  task_date: string;
  start_time?: string;
  duration_minutes: number;
  book_id?: string;
  subject_id?: string;
  page_start?: number;
  page_end?: number;
  sort_order: number;
}

export interface AIPlanResponse {
  plan_title: string;
  tasks: AIPlanTask[];
  recommendations: string[];
}

// --- Dashboard Stats ---

export interface DashboardStats {
  totalBooks: number;
  completedBooks: number;
  totalPagesRead: number;
  averageProgress: number;
  totalExams: number;
  lastExamNet: number | null;
  activePlanCount: number;
  todayTaskCount: number;
  completedTodayTasks: number;
}

// --- Form Tipleri ---

export interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  cover_url: string;
  total_pages: number;
  current_page: number;
  subject_id: string;
  target_date: string;
  notes: string;
}

export interface ExamFormData {
  exam_type: ExamType;
  exam_name: string;
  exam_date: string;
  notes: string;
  scores: {
    subject_id: string;
    correct_count: number;
    wrong_count: number;
    empty_count: number;
  }[];
}
