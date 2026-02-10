/**
 * POST /api/optimize
 * 
 * Optimizes question selection for a quiz using 0/1 Knapsack Dynamic Programming.
 * Given a quiz and total available time, returns the optimal subset of questions
 * that maximizes score without exceeding the time constraint.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { optimizeQuestions } from '@/lib/algorithms/knapsack';
import type { OptimizeResponse, Question } from '@/lib/types';

// Request body validation schema
const OptimizeRequestSchema = z.object({
  quiz_id: z.string().uuid('Quiz ID must be a valid UUID').min(1, 'Quiz ID is required'),
  total_time: z
    .number()
    .int('Total time must be an integer')
    .positive('Total time must be a positive number')
    .min(1, 'Total time must be at least 1 minute'),
});

type OptimizeRequestBody = z.infer<typeof OptimizeRequestSchema>;

export async function POST(request: Request): Promise<NextResponse<OptimizeResponse>> {
  try {
    // Parse and validate request body
    const body: unknown = await request.json();
    const validationResult = OptimizeRequestSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return NextResponse.json(
        {
          selected_questions: [],
          total_score: 0,
          total_time: 0,
          success: false,
          error: 'Validation failed',
          details: errors,
        } as any,
        { status: 400 }
      );
    }

    const { quiz_id, total_time } = validationResult.data;

    // Create server-side Supabase client
    const supabase = createServerSupabaseClient();

    // Verify the quiz exists
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('id, title')
      .eq('id', quiz_id)
      .single();

    if (quizError || !quiz) {
      return NextResponse.json(
        {
          selected_questions: [],
          total_score: 0,
          total_time: 0,
          success: false,
          error: `Quiz with id '${quiz_id}' not found`,
        },
        { status: 404 }
      );
    }

    // Fetch all questions for this quiz
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quiz_id)
      .order('question_order', { ascending: true });

    if (questionsError) {
      console.error('Database error fetching questions:', questionsError);
      return NextResponse.json(
        {
          selected_questions: [],
          total_score: 0,
          total_time: 0,
          success: false,
          error: 'Failed to fetch questions from database',
        },
        { status: 500 }
      );
    }

    // Handle quiz with no questions (valid case - return empty optimization)
    if (!questions || questions.length === 0) {
      return NextResponse.json(
        {
          selected_questions: [],
          total_score: 0,
          total_time: 0,
          success: true,
        },
        { status: 200 }
      );
    }

    // Run the 0/1 Knapsack optimization algorithm
    const result = optimizeQuestions(questions, total_time);

    // Extract the actual Question objects from KnapsackItems
    const selectedQuestions: Question[] = result.selected_items.map((item) => item.data);

    // Success response with optimization results
    return NextResponse.json(
      {
        selected_questions: selectedQuestions,
        total_score: result.total_value,
        total_time: result.total_weight,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          selected_questions: [],
          total_score: 0,
          total_time: 0,
          success: false,
          error: 'Invalid JSON in request body',
        },
        { status: 400 }
      );
    }

    // Catch unexpected errors (including algorithm errors)
    console.error('Unexpected error in POST /api/optimize:', error);
    
    return NextResponse.json(
      {
        selected_questions: [],
        total_score: 0,
        total_time: 0,
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
