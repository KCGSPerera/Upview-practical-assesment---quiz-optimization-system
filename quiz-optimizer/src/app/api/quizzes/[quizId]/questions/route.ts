/**
 * GET /api/quizzes/[quizId]/questions
 * 
 * Returns all questions for a specific quiz.
 * Validates that the quiz exists before returning questions.
 */

import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { QuestionsResponse } from '@/lib/types';

interface RouteParams {
  params: Promise<{
    quizId: string;
  }>;
}

export async function GET(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse<QuestionsResponse>> {
  try {
    const { quizId } = await params;

    // Validate quizId parameter
    if (!quizId || typeof quizId !== 'string' || quizId.trim() === '') {
      return NextResponse.json(
        {
          questions: [],
          quiz: {} as any, // Required by type but not meaningful here
          success: false,
          error: 'Invalid or missing quizId parameter',
        },
        { status: 400 }
      );
    }

    // Create server-side Supabase client
    const supabase = createServerSupabaseClient();

    // First, verify the quiz exists
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    // Handle quiz not found
    if (quizError || !quiz) {
      return NextResponse.json(
        {
          questions: [],
          quiz: {} as any,
          success: false,
          error: `Quiz with id '${quizId}' not found`,
        },
        { status: 404 }
      );
    }

    // Fetch questions for this quiz, ordered by question_order
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('question_order', { ascending: true });

    // Handle database errors
    if (questionsError) {
      console.error('Database error fetching questions:', questionsError);
      return NextResponse.json(
        {
          questions: [],
          quiz,
          success: false,
          error: 'Failed to fetch questions from database',
        },
        { status: 500 }
      );
    }

    // Handle null data (shouldn't happen, but type-safe)
    if (!questions) {
      return NextResponse.json(
        {
          questions: [],
          quiz,
          success: false,
          error: 'No data returned from database',
        },
        { status: 500 }
      );
    }

    // Success response
    return NextResponse.json(
      {
        questions,
        quiz,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    // Catch unexpected errors
    console.error('Unexpected error in GET /api/quizzes/[quizId]/questions:', error);
    
    return NextResponse.json(
      {
        questions: [],
        quiz: {} as any,
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
