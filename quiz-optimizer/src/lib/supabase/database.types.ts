/**
 * Database Type Definitions
 * 
 * These types match the Supabase schema defined in supabase/schema.sql
 * They provide type safety for all database operations.
 * 
 * In a production app, these would be auto-generated using:
 * npx supabase gen types typescript --project-id <your-project-id>
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          created_by: string | null;
          total_questions: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          created_by?: string | null;
          total_questions?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          created_by?: string | null;
          total_questions?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          quiz_id: string;
          question_text: string;
          score: number;
          time_required: number;
          question_order: number;
          difficulty: 'easy' | 'medium' | 'hard';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          question_text: string;
          score: number;
          time_required: number;
          question_order?: number;
          difficulty?: 'easy' | 'medium' | 'hard';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          question_text?: string;
          score?: number;
          time_required?: number;
          question_order?: number;
          difficulty?: 'easy' | 'medium' | 'hard';
          created_at?: string;
          updated_at?: string;
        };
      };
      answers: {
        Row: {
          id: string;
          user_id: string;
          quiz_id: string;
          question_id: string;
          answer_text: string;
          is_correct: boolean;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quiz_id: string;
          question_id: string;
          answer_text: string;
          is_correct?: boolean;
          submitted_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          quiz_id?: string;
          question_id?: string;
          answer_text?: string;
          is_correct?: boolean;
          submitted_at?: string;
        };
      };
    };
  };
}
