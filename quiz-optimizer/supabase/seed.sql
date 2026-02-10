-- Sample data for development and testing
-- Run this after schema.sql

-- Insert sample user
INSERT INTO users (id, email, full_name) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', 'Test User');

-- Insert sample quizzes
INSERT INTO quizzes (id, title, description, created_by, total_questions) VALUES
  ('650e8400-e29b-41d4-a716-446655440000', 'Data Structures Quiz', 'Test your knowledge of fundamental data structures', '550e8400-e29b-41d4-a716-446655440000', 5),
  ('650e8400-e29b-41d4-a716-446655440001', 'Algorithms Quiz', 'Challenge yourself with algorithm problems', '550e8400-e29b-41d4-a716-446655440000', 4);

-- Insert sample questions for Data Structures Quiz
-- Note: If using difficulty feature, ensure add_difficulty_migration.sql has been run first
INSERT INTO questions (quiz_id, question_text, score, time_required, question_order, difficulty) VALUES
  ('650e8400-e29b-41d4-a716-446655440000', 'What is the time complexity of binary search?', 10, 3, 1, 'easy'),
  ('650e8400-e29b-41d4-a716-446655440000', 'Explain the difference between a stack and a queue.', 15, 5, 2, 'easy'),
  ('650e8400-e29b-41d4-a716-446655440000', 'What is a linked list and when would you use it?', 20, 8, 3, 'medium'),
  ('650e8400-e29b-41d4-a716-446655440000', 'Describe how a hash table works.', 25, 10, 4, 'medium'),
  ('650e8400-e29b-41d4-a716-446655440000', 'What is a binary tree? Provide examples of tree traversal methods.', 30, 15, 5, 'hard');

-- Insert sample questions for Algorithms Quiz
INSERT INTO questions (quiz_id, question_text, score, time_required, question_order, difficulty) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'Implement bubble sort and analyze its complexity.', 20, 10, 1, 'medium'),
  ('650e8400-e29b-41d4-a716-446655440001', 'What is dynamic programming? Give an example.', 25, 12, 2, 'medium'),
  ('650e8400-e29b-41d4-a716-446655440001', 'Explain Dijkstra''s shortest path algorithm.', 30, 15, 3, 'hard'),
  ('650e8400-e29b-41d4-a716-446655440001', 'Solve the travelling salesman problem for 5 cities.', 40, 20, 4, 'hard');

-- Note: answers table is intentionally empty - populated during user interaction
