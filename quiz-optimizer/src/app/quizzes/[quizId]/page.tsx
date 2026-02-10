/**
 * Quiz Attempt Page
 * 
 * Displays all questions for a specific quiz.
 * Users can view question details (score, time required) and optionally submit answers.
 * Includes a link to the optimization page.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Quiz, Question, QuestionsResponse } from '@/lib/types';

export default function QuizAttemptPage() {
  const params = useParams();
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (quizId) {
      fetchQuestions();
    }
  }, [quizId]);

  async function fetchQuestions() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/quizzes/${quizId}/questions`);
      const data: QuestionsResponse = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to fetch questions');
        return;
      }

      setQuiz(data.quiz);
      setQuestions(data.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main>
        <Link href="/" style={{ color: '#0070f3' }}>← Back to Quizzes</Link>
        <h1>Loading Quiz...</h1>
        <p>Please wait while we load the questions.</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <Link href="/" style={{ color: '#0070f3' }}>← Back to Quizzes</Link>
        <h1>Error</h1>
        <div className="error">
          <p>Error: {error}</p>
          <button onClick={fetchQuestions}>Retry</button>
        </div>
      </main>
    );
  }

  if (!quiz) {
    return (
      <main>
        <Link href="/" style={{ color: '#0070f3' }}>← Back to Quizzes</Link>
        <h1>Quiz Not Found</h1>
        <p>The requested quiz could not be found.</p>
      </main>
    );
  }

  const totalScore = questions.reduce((sum, q) => sum + q.score, 0);
  const totalTime = questions.reduce((sum, q) => sum + q.time_required, 0);

  return (
    <main>
      <Link href="/" style={{ color: '#0070f3' }}>← Back to Quizzes</Link>
      
      <div style={{ marginTop: '1.5rem' }}>
        <h1>{quiz.title}</h1>
        {quiz.description && (
          <p style={{ color: '#666', marginBottom: '1rem' }}>{quiz.description}</p>
        )}

        <div style={{ 
          display: 'flex', 
          gap: '2rem', 
          marginBottom: '1.5rem',
          padding: '1rem',
          backgroundColor: '#f0f0f0',
          borderRadius: '8px'
        }}>
          <div>
            <strong>Total Questions:</strong> {questions.length}
          </div>
          <div>
            <strong>Total Score:</strong> {totalScore} points
          </div>
          <div>
            <strong>Total Time:</strong> {totalTime} minutes
          </div>
        </div>

        {questions.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <p>No questions available for this quiz.</p>
          </div>
        ) : (
          <>
            <h2>Questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
              {questions.map((question, index) => (
                <QuestionCard key={question.id} question={question} index={index} />
              ))}
            </div>

            <div style={{ 
              marginTop: '2rem', 
              padding: '1.5rem', 
              backgroundColor: '#e6f7ff', 
              borderRadius: '8px',
              border: '1px solid #91d5ff'
            }}>
              <h3>Optimize Your Time</h3>
              <p style={{ marginBottom: '1rem' }}>
                Have limited time? Let our algorithm select the optimal questions to maximize your score!
              </p>
              <Link
                href={`/quizzes/${quizId}/optimize`}
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#0070f3',
                  color: 'white',
                  borderRadius: '5px',
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                Go to Optimization →
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

interface QuestionCardProps {
  question: Question;
  index: number;
}

function QuestionCard({ question, index }: QuestionCardProps) {
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!answer.trim()) {
      alert('Please enter an answer');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: '550e8400-e29b-41d4-a716-446655440000', // Demo user from seed data
          quiz_id: question.quiz_id,
          question_id: question.id,
          answer_text: answer,
          is_correct: false, // MVP: no auto-grading
        }),
      });

      const data = await response.json();

      if (!data.success) {
        alert(`Error: ${data.error}`);
        return;
      }

      setSubmitted(true);
      alert('Answer submitted successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        padding: '1.5rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: submitted ? '#f6ffed' : '#fafafa',
      }}
    >
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>
          Question {index + 1}
        </h3>
        <p style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
          {question.question_text}
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
          <span>
            <strong>Score:</strong> {question.score} points
          </span>
          <span>
            <strong>Time Required:</strong> {question.time_required} minutes
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter your answer here..."
          rows={4}
          disabled={submitted || submitting}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px',
            marginBottom: '0.5rem',
            resize: 'vertical',
          }}
        />
        <button
          type="submit"
          disabled={submitted || submitting}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: submitted ? '#52c41a' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: submitted ? 'default' : 'pointer',
            fontSize: '14px',
          }}
        >
          {submitting ? 'Submitting...' : submitted ? '✓ Submitted' : 'Submit Answer'}
        </button>
      </form>
    </div>
  );
}
