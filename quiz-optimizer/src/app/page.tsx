/**
 * Home Page - Quiz List
 * 
 * Displays all available quizzes in the system.
 * Users can click on a quiz to view its questions.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Quiz, QuizzesResponse } from '@/lib/types';

export default function HomePage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  async function fetchQuizzes() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/quizzes');
      const data: QuizzesResponse = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to fetch quizzes');
        return;
      }

      setQuizzes(data.quizzes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main>
        <h1>Quiz Optimization System</h1>
        <p>Loading quizzes...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>Quiz Optimization System</h1>
        <div className="error">
          <p>Error: {error}</p>
          <button onClick={fetchQuizzes}>Retry</button>
        </div>
      </main>
    );
  }

  if (quizzes.length === 0) {
    return (
      <main>
        <h1>Quiz Optimization System</h1>
        <p>No quizzes available at the moment.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Quiz Optimization System</h1>
      <p>Select a quiz to view questions and optimize your time.</p>

      <div style={{ marginTop: '2rem' }}>
        <h2>Available Quizzes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      </div>
    </main>
  );
}

interface QuizCardProps {
  quiz: Quiz;
}

function QuizCard({ quiz }: QuizCardProps) {
  return (
    <div
      style={{
        padding: '1.5rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#fafafa',
      }}
    >
      <h3 style={{ marginBottom: '0.5rem' }}>
        <Link
          href={`/quizzes/${quiz.id}`}
          style={{ color: '#0070f3', textDecoration: 'none' }}
        >
          {quiz.title}
        </Link>
      </h3>
      
      {quiz.description && (
        <p style={{ color: '#666', marginBottom: '0.5rem' }}>
          {quiz.description}
        </p>
      )}
      
      <p style={{ fontSize: '0.9rem', color: '#999' }}>
        Total Questions: {quiz.total_questions}
      </p>
      
      <Link
        href={`/quizzes/${quiz.id}`}
        style={{
          display: 'inline-block',
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#0070f3',
          color: 'white',
          borderRadius: '5px',
          textDecoration: 'none',
        }}
      >
        View Quiz →
      </Link>
    </div>
  );
}
