/**
 * POST /api/users
 * 
 * Looks up or creates a user by email.
 * Returns the user ID for use in quiz attempts.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Request body validation schema
const UserLookupSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  full_name: z.string().optional(),
});

type UserLookupBody = z.infer<typeof UserLookupSchema>;

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body: unknown = await request.json();
    const validationResult = UserLookupSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return NextResponse.json(
        {
          user: null,
          success: false,
          error: 'Validation failed',
          details: errors,
        },
        { status: 400 }
      );
    }

    const validatedData: UserLookupBody = validationResult.data;

    // Create server-side Supabase client
    const supabase = createServerSupabaseClient();

    // First, try to find existing user by email
    const { data: existingUser, error: lookupError } = await supabase
      .from('users')
      .select('*')
      .eq('email', validatedData.email)
      .maybeSingle();

    if (lookupError) {
      console.error('Error looking up user:', lookupError);
      return NextResponse.json(
        {
          user: null,
          success: false,
          error: 'Failed to lookup user',
        },
        { status: 500 }
      );
    }

    // If user exists, return their info
    if (existingUser) {
      return NextResponse.json(
        {
          user: existingUser,
          success: true,
          isNewUser: false,
        },
        { status: 200 }
      );
    }

    // User doesn't exist, create new user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email: validatedData.email,
        full_name: validatedData.full_name || null,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json(
        {
          user: null,
          success: false,
          error: 'Failed to create user',
        },
        { status: 500 }
      );
    }

    // Return newly created user
    return NextResponse.json(
      {
        user: newUser,
        success: true,
        isNewUser: true,
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          user: null,
          success: false,
          error: 'Invalid JSON in request body',
        },
        { status: 400 }
      );
    }

    // Catch unexpected errors
    console.error('Unexpected error in POST /api/users:', error);
    
    return NextResponse.json(
      {
        user: null,
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
