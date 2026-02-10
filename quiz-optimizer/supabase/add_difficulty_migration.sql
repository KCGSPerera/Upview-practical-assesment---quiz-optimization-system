-- Migration: Add difficulty field to questions table
-- Run this migration after the initial schema.sql

-- Add difficulty column to questions table
ALTER TABLE questions 
ADD COLUMN difficulty VARCHAR(10) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard'));

-- Create index for filtering performance
CREATE INDEX idx_questions_difficulty ON questions(difficulty);

-- Update existing questions to have difficulty values (optional)
-- This is just an example - adjust based on your data
UPDATE questions SET difficulty = 'easy' WHERE time_required <= 5;
UPDATE questions SET difficulty = 'medium' WHERE time_required > 5 AND time_required <= 10;
UPDATE questions SET difficulty = 'hard' WHERE time_required > 10;
