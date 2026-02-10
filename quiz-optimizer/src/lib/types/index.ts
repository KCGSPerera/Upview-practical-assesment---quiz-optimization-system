// ============================================
// CORE DATABASE ENTITY TYPES
// ============================================

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  created_by: string | null;
  total_questions: number;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  score: number;
  time_required: number;
  question_order: number;
  difficulty: QuestionDifficulty;
  created_at: string;
  updated_at: string;
}

export interface Answer {
  id: string;
  user_id: string;
  quiz_id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  submitted_at: string;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

// GET /api/quizzes response
export interface QuizzesResponse {
  quizzes: Quiz[];
  success: boolean;
  error?: string;
}

// GET /api/quizzes/[quizId]/questions response
export interface QuestionsResponse {
  questions: Question[];
  quiz: Quiz;
  success: boolean;
  error?: string;
}

// POST /api/answers request
export interface SubmitAnswerRequest {
  user_id: string;
  quiz_id: string;
  question_id: string;
  answer_text: string;
  is_correct?: boolean;
}

// POST /api/answers response
export interface SubmitAnswerResponse {
  answer: Answer;
  success: boolean;
  error?: string;
}

// POST /api/optimize request
export interface OptimizeRequest {
  quiz_id: string;
  total_time: number;
}

// POST /api/optimize response
export interface OptimizeResponse {
  selected_questions: Question[];
  total_score: number;
  total_time: number;
  success: boolean;
  error?: string;
}

// ============================================
// OPTIMIZATION ALGORITHM TYPES
// ============================================

// Input for the knapsack algorithm
export interface KnapsackItem {
  id: string;
  value: number;     // score
  weight: number;    // time_required
  data: Question;    // full question object
}

// Output from the knapsack algorithm
export interface KnapsackResult {
  selected_items: KnapsackItem[];
  total_value: number;
  total_weight: number;
}

// ============================================
// UTILITY TYPES
// ============================================

// Generic API error response
export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
}

// Type guard for API errors
export function isApiError(response: unknown): response is ApiError {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    response.success === false &&
    'error' in response
  );
}

// Database insert types (without generated fields)
export type QuizInsert = Omit<Quiz, 'id' | 'created_at' | 'updated_at'>;
export type QuestionInsert = Omit<Question, 'id' | 'created_at' | 'updated_at'>;
export type AnswerInsert = Omit<Answer, 'id' | 'submitted_at'>;
