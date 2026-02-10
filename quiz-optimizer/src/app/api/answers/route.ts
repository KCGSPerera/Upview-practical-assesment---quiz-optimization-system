/**
 * POST /api/answers
 * 
 * Submits a user's answer to a specific question.
 * Enforces unique constraint: one answer per user per question.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { SubmitAnswerResponse } from '@/lib/types';

// Request body validation schema
const SubmitAnswerSchema = z.object({
  user_id: z.string().uuid('User ID must be a valid UUID').min(1, 'User ID is required'),
  quiz_id: z.string().uuid('Quiz ID must be a valid UUID').min(1, 'Quiz ID is required'),
  question_id: z.string().uuid('Question ID must be a valid UUID').min(1, 'Question ID is required'),
  answer_text: z.string().min(1, 'Answer text cannot be empty').max(10000, 'Answer text is too long'),
  is_correct: z.boolean().optional().default(false),
});

type SubmitAnswerBody = z.infer<typeof SubmitAnswerSchema>;

export async function POST(request: Request): Promise<NextResponse<SubmitAnswerResponse>> {
  try {
    // Parse and validate request body
    const body: unknown = await request.json();
    const validationResult = SubmitAnswerSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return NextResponse.json(
        {
          answer: {} as any,
          success: false,
          error: 'Validation failed',
          details: errors,
        } as any,
        { status: 400 }
      );
    }

    const validatedData: SubmitAnswerBody = validationResult.data;

    // Create server-side Supabase client
    const supabase = createServerSupabaseClient();

    // Verify that the question belongs to the specified quiz
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('quiz_id')
      .eq('id', validatedData.question_id)
      .single<{ quiz_id: string }>();

    if (questionError || !question) {
      return NextResponse.json(
        {
          answer: {} as any,
          success: false,
          error: 'Question not found',
        },
        { status: 404 }
      );
    }

    if (question.quiz_id !== validatedData.quiz_id) {
      return NextResponse.json(
        {
          answer: {} as any,
          success: false,
          error: 'Question does not belong to the specified quiz',
        },
        { status: 400 }
      );
    }

    // Insert the answer into the database
    const { data: answer, error: insertError } = await supabase
      .from('answers')
      .insert({
        user_id: validatedData.user_id,
        quiz_id: validatedData.quiz_id,
        question_id: validatedData.question_id,
        answer_text: validatedData.answer_text,
        is_correct: validatedData.is_correct,
      } as any)
      .select()
      .single();

    // Handle unique constraint violation (duplicate answer)
    if (insertError) {
      // PostgreSQL unique violation error code
      if (insertError.code === '23505') {
        return NextResponse.json(
          {
            answer: {} as any,
            success: false,
            error: 'You have already answered this question. Each question can only be answered once.',
          },
          { status: 409 }
        );
      }

      // Other database errors
      console.error('Database error inserting answer:', insertError);
      return NextResponse.json(
        {
          answer: {} as any,
          success: false,
          error: 'Failed to save answer to database',
        },
        { status: 500 }
      );
    }

    // Handle null data (shouldn't happen, but type-safe)
    if (!answer) {
      return NextResponse.json(
        {
          answer: {} as any,
          success: false,
          error: 'No data returned after insert',
        },
        { status: 500 }
      );
    }

    // Success response - 201 Created
    return NextResponse.json(
      {
        answer,
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          answer: {} as any,
          success: false,
          error: 'Invalid JSON in request body',
        },
        { status: 400 }
      );
    }

    // Catch unexpected errors
    console.error('Unexpected error in POST /api/answers:', error);
    
    return NextResponse.json(
      {
        answer: {} as any,
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
