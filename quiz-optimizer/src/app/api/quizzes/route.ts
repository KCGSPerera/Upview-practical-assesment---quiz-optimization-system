/**
 * GET /api/quizzes
 * 
 * Returns all available quizzes in the system.
 * No authentication required for this MVP.
 */

import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { QuizzesResponse } from '@/lib/types';

export async function GET(): Promise<NextResponse<QuizzesResponse>> {
  try {
    // Create server-side Supabase client
    const supabase = createServerSupabaseClient();

    // Query all quizzes, ordered by creation date (newest first)
    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });

    // Handle database errors
    if (error) {
      console.error('Database error fetching quizzes:', error);
      return NextResponse.json(
        {
          quizzes: [],
          success: false,
          error: 'Failed to fetch quizzes from database',
        },
        { status: 500 }
      );
    }

    // Handle null data (shouldn't happen, but type-safe)
    if (!quizzes) {
      return NextResponse.json(
        {
          quizzes: [],
          success: false,
          error: 'No data returned from database',
        },
        { status: 500 }
      );
    }

    // Success response
    return NextResponse.json(
      {
        quizzes,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    // Catch unexpected errors
    console.error('Unexpected error in GET /api/quizzes:', error);
    
    return NextResponse.json(
      {
        quizzes: [],
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
