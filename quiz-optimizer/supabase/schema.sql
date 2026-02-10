-- Quiz Optimization System Database Schema
-- Clean, normalized structure with referential integrity

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- QUIZZES TABLE
-- ============================================
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  total_questions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT title_not_empty CHECK (LENGTH(TRIM(title)) > 0)
);

-- ============================================
-- QUESTIONS TABLE
-- ============================================
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  score INTEGER NOT NULL,
  time_required INTEGER NOT NULL,
  question_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints to ensure data integrity
  CONSTRAINT question_text_not_empty CHECK (LENGTH(TRIM(question_text)) > 0),
  CONSTRAINT score_positive CHECK (score > 0),
  CONSTRAINT time_positive CHECK (time_required > 0),
  CONSTRAINT unique_question_order UNIQUE (quiz_id, question_order)
);

-- ============================================
-- ANSWERS TABLE
-- ============================================
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one answer per user per question
  CONSTRAINT unique_user_question_answer UNIQUE (user_id, question_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_quizzes_created_by ON quizzes(created_by);
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_questions_quiz_order ON questions(quiz_id, question_order);
CREATE INDEX idx_answers_user_id ON answers(user_id);
CREATE INDEX idx_answers_quiz_id ON answers(quiz_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SCHEMA EXPLANATION
-- ============================================
-- 
-- RELATIONSHIPS:
-- 1. users ← quizzes (one-to-many): A user can create multiple quizzes
-- 2. quizzes ← questions (one-to-many): A quiz contains multiple questions
-- 3. users ← answers (one-to-many): A user can submit multiple answers
-- 4. questions ← answers (one-to-many): A question can have multiple user answers
-- 5. quizzes ← answers (one-to-many): Track which quiz the answer belongs to
--
-- KEY CONSTRAINTS:
-- - ON DELETE CASCADE: Deleting a quiz removes all its questions and answers
-- - UNIQUE constraints prevent duplicate entries
-- - CHECK constraints ensure data validity (positive scores/times, non-empty text)
-- - Foreign keys maintain referential integrity
--
-- OPTIMIZATION FIELDS:
-- - questions.score: Points earned for selecting this question
-- - questions.time_required: Time cost in minutes
-- - These two fields are the core inputs for the 0/1 Knapsack algorithm
