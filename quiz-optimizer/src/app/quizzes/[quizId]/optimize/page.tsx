/**
 * Quiz Optimization Page
 * 
 * Uses the 0/1 Knapsack Dynamic Programming algorithm to select
 * the optimal subset of questions that maximizes score within a time constraint.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Question, OptimizeResponse } from '@/lib/types';

export default function OptimizePage() {
  const params = useParams();
  const quizId = params.quizId as string;

  const [totalTime, setTotalTime] = useState<string>('');
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [totalTimeUsed, setTotalTimeUsed] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasOptimized, setHasOptimized] = useState(false);

  async function handleOptimize(e: React.FormEvent) {
    e.preventDefault();

    // Validate input
    const timeValue = parseInt(totalTime, 10);
    if (isNaN(timeValue) || timeValue <= 0) {
      setError('Please enter a valid positive number for total time');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasOptimized(false);

      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz_id: quizId,
          total_time: timeValue,
        }),
      });

      const data: OptimizeResponse = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to optimize questions');
        return;
      }

      setSelectedQuestions(data.selected_questions);
      setTotalScore(data.total_score);
      setTotalTimeUsed(data.total_time);
      setHasOptimized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <Link href={`/quizzes/${quizId}`} style={{ color: '#0070f3' }}>
        ← Back to Quiz
      </Link>

      <div style={{ marginTop: '1.5rem' }}>
        <h1>Quiz Optimization</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Enter your available time, and our algorithm will select the optimal questions
          to maximize your score using Dynamic Programming (0/1 Knapsack).
        </p>

        <form onSubmit={handleOptimize} style={{ marginBottom: '2rem' }}>
          <div
            style={{
              padding: '1.5rem',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              maxWidth: '500px',
            }}
          >
            <label
              htmlFor="totalTime"
              style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
            >
              Total Available Time (minutes)
            </label>
            <input
              id="totalTime"
              type="number"
              min="1"
              step="1"
              value={totalTime}
              onChange={(e) => setTotalTime(e.target.value)}
              placeholder="e.g., 20"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                marginBottom: '1rem',
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: loading ? '#ccc' : '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              {loading ? 'Optimizing...' : 'Optimize Questions'}
            </button>
          </div>
        </form>

        {error && (
          <div className="error" style={{ marginBottom: '2rem' }}>
            <p>Error: {error}</p>
          </div>
        )}

        {hasOptimized && (
          <div>
            {selectedQuestions.length === 0 ? (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  backgroundColor: '#fff7e6',
                  borderRadius: '8px',
                  border: '1px solid #ffd591',
                }}
              >
                <h2>No Questions Selected</h2>
                <p style={{ color: '#666' }}>
                  The available time is too short to complete any questions.
                  Try increasing your available time.
                </p>
              </div>
            ) : (
              <>
                <div
                  style={{
                    padding: '1.5rem',
                    backgroundColor: '#f6ffed',
                    borderRadius: '8px',
                    border: '1px solid #b7eb8f',
                    marginBottom: '2rem',
                  }}
                >
                  <h2 style={{ marginBottom: '1rem' }}>Optimization Results</h2>
                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div>
                      <strong>Questions Selected:</strong> {selectedQuestions.length}
                    </div>
                    <div>
                      <strong>Total Score:</strong> {totalScore} points
                    </div>
                    <div>
                      <strong>Time Used:</strong> {totalTimeUsed} minutes
                    </div>
                    <div>
                      <strong>Time Available:</strong> {totalTime} minutes
                    </div>
                  </div>
                </div>

                <h3>Selected Questions</h3>
                <p style={{ color: '#666', marginBottom: '1rem' }}>
                  These questions were selected to maximize your score within the time constraint:
                </p>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  {selectedQuestions.map((question, index) => (
                    <OptimizedQuestionCard
                      key={question.id}
                      question={question}
                      index={index}
                    />
                  ))}
                </div>

                <div
                  style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    backgroundColor: '#e6f7ff',
                    borderRadius: '8px',
                    border: '1px solid #91d5ff',
                  }}
                >
                  <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <strong>Algorithm Used:</strong> 0/1 Knapsack Dynamic Programming
                  </p>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>
                    This algorithm guarantees the optimal solution by considering all possible
                    combinations of questions and selecting the subset that maximizes score
                    without exceeding the time constraint.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

interface OptimizedQuestionCardProps {
  question: Question;
  index: number;
}

function OptimizedQuestionCard({ question, index }: OptimizedQuestionCardProps) {
  return (
    <div
      style={{
        padding: '1.5rem',
        border: '1px solid #91d5ff',
        borderRadius: '8px',
        backgroundColor: '#fafafa',
      }}
    >
      <h4 style={{ marginBottom: '0.5rem' }}>
        Question {index + 1}
      </h4>
      <p style={{ marginBottom: '1rem', fontSize: '1rem' }}>
        {question.question_text}
      </p>
      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          fontSize: '0.9rem',
          color: '#666',
        }}
      >
        <span>
          <strong>Score:</strong> {question.score} points
        </span>
        <span>
          <strong>Time Required:</strong> {question.time_required} minutes
        </span>
        <span>
          <strong>Efficiency:</strong> {(question.score / question.time_required).toFixed(2)} points/min
        </span>
      </div>
    </div>
  );
}
