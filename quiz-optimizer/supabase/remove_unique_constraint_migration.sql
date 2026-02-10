-- Migration: Remove unique constraint to allow multiple answer attempts
-- This allows users to reattempt questions and store all attempts

-- Drop the unique constraint that prevents multiple answers
ALTER TABLE answers DROP CONSTRAINT IF EXISTS unique_user_question_answer;

-- Add an index for better query performance when retrieving user answers
CREATE INDEX IF NOT EXISTS idx_answers_user_question ON answers(user_id, question_id, submitted_at DESC);

-- Add a comment explaining the change
COMMENT ON TABLE answers IS 'Stores all answer attempts. Users can submit multiple answers for the same question, and all attempts are preserved.';
