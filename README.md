# Quiz Optimization System

A full-stack web application that uses **Dynamic Programming (0/1 Knapsack)** to optimize quiz question selection. Given a time constraint, the system recommends the optimal subset of questions that maximizes total score without exceeding available time.

Built as a technical assessment demonstrating proficiency in algorithm implementation, full-stack development, and clean code practices.

---

## Project Overview

The Quiz Optimization System allows users to:
- Browse available quizzes
- View questions with associated scores and time requirements
- Submit answers to questions
- **Optimize question selection** using a time constraint to maximize score

The optimization feature implements the classic **0/1 Knapsack problem** using Dynamic Programming, guaranteeing an optimal solution.

---

## Tech Stack

- **Next.js 16** (App Router) - React framework with server-side rendering
- **React 19** - UI library with hooks
- **TypeScript** - Strict type safety (no `any` types)
- **Supabase** - PostgreSQL database with real-time capabilities
- **Zod** - Runtime schema validation for API requests
- **CSS** - Minimal functional styling (no frameworks)

---

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### 1. Clone the Repository

```bash
cd quiz-optimizer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get your credentials from:
- Supabase Dashboard → Settings → API

### 4. Set Up the Database

1. Open your Supabase project's SQL Editor
2. Run the contents of `supabase/schema.sql` (creates tables, indexes, triggers)
3. **Optional:** Run `supabase/add_difficulty_migration.sql` to add difficulty filtering feature
4. Optionally run `supabase/seed.sql` for sample data (2 quizzes, 9 questions with difficulty levels)

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database Schema

### Tables

#### `users`
- `id` (UUID, PK)
- `email` (VARCHAR, UNIQUE)
- `full_name` (VARCHAR)
- Timestamps: `created_at`, `updated_at`

#### `quizzes`
- `id` (UUID, PK)
- `title` (VARCHAR, NOT NULL)
- `description` (TEXT)
- `created_by` (UUID, FK → users)
- `total_questions` (INTEGER)
- Timestamps: `created_at`, `updated_at`

#### `questions`
- `id` (UUID, PK)
- `quiz_id` (UUID, FK → quizzes, CASCADE)
- `question_text` (TEXT, NOT NULL)
- **`score`** (INTEGER, > 0) - Points for selecting this question
- **`time_required`** (INTEGER, > 0) - Time cost in minutes
- `difficulty` (VARCHAR, CHECK: easy|medium|hard) - Question difficulty level
- `question_order` (INTEGER)
- Timestamps: `created_at`, `updated_at`

#### `answers`
- `id` (UUID, PK)
- `user_id` (UUID, FK → users, CASCADE)
- `quiz_id` (UUID, FK → quizzes, CASCADE)
- `question_id` (UUID, FK → questions, CASCADE)
- `answer_text` (TEXT, NOT NULL)
- `is_correct` (BOOLEAN)
- `submitted_at` (TIMESTAMP)
- **UNIQUE constraint**: (user_id, question_id)

### Key Relationships

- **One-to-Many**: users → quizzes (a user can create multiple quizzes)
- **One-to-Many**: quizzes → questions (a quiz contains multiple questions)
- **Many-to-Many** (via answers): users ↔ questions

### Constraints

- Foreign keys with `ON DELETE CASCADE`
- CHECK constraints for positive scores and times
- UNIQUE constraints to prevent duplicate answers
- Indexes on all foreign keys for query performance

---

## API Endpoints

All endpoints return JSON with a `success` boolean and optional `error` string.

### `GET /api/quizzes`

Returns all available quizzes.

**Response:**
```typescript
{
  quizzes: Quiz[],
  success: boolean
}
```

### `GET /api/quizzes/[quizId]/questions`

Returns all questions for a specific quiz.

**Parameters:**
- `quizId` (URL param) - UUID of the quiz
- `difficulty` (query param, optional) - Filter by difficulty: `easy`, `medium`, or `hard`

**Response:**
```typescript
{
  quiz: Quiz,
  questions: Question[],
  success: boolean
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid difficulty parameter
- `404` - Quiz not found

### `POST /api/answers`

Submits a user's answer to a question.

**Request Body:**
```typescript
{
  user_id: string,       // UUID
  quiz_id: string,       // UUID
  question_id: string,   // UUID
  answer_text: string,
  is_correct?: boolean
}
```

**Response:**
```typescript
{
  answer: Answer,
  success: boolean
}
```

**Status Codes:**
- `201` - Answer created
- `400` - Validation error
- `409` - Duplicate answer (user already answered this question)
- `500` - Server error

### `POST /api/optimize`

**Core Feature**: Runs the 0/1 Knapsack DP algorithm to select optimal questions.

**Request Body:**
```typescript
{
  quiz_id: string,    // UUID
  total_time: number  // Available time in minutes (positive integer)
}
```

**Response:**
```typescript
{
  selected_questions: Question[],
  total_score: number,
  total_time: number,
  success: boolean
}
```

**Status Codes:**
- `200` - Success (may return empty array if no questions fit)
- `400` - Invalid input
- `404` - Quiz not found
- `500` - Server error

---

## Optimization Algorithm: 0/1 Knapsack Dynamic Programming

### Problem Definition

Given:
- A set of questions, each with a **score** (value) and **time_required** (weight)
- A **total_time** constraint (capacity)

Find:
- The subset of questions that **maximizes total score** without exceeding total time
- Each question can be selected **at most once** (0/1 constraint)

### Algorithm Approach

**File:** `src/lib/algorithms/knapsack.ts`

1. **Build DP Table**: Create a 2D array `dp[i][w]` where:
   - `i` = number of items considered (0 to n)
   - `w` = weight capacity (0 to total_time)
   - `dp[i][w]` = maximum value achievable using first `i` items with weight limit `w`

2. **Recurrence Relation**:
   ```
   dp[i][w] = max(
     dp[i-1][w],                      // Don't include item i
     dp[i-1][w - weight[i]] + value[i] // Include item i (if it fits)
   )
   ```

3. **Backtracking**: Traverse the DP table backwards to determine which items were selected.

### Complexity Analysis

- **Time Complexity**: O(n × W)
  - n = number of questions
  - W = total_time capacity
  
- **Space Complexity**: O(n × W)
  - For the DP table

### Why This Approach?

- **Optimality**: Guarantees the globally optimal solution (not a greedy heuristic)
- **Correctness**: Considers all possible combinations efficiently
- **Well-suited**: Quiz optimization is a perfect fit for the knapsack problem model

### Alternative Approaches (Not Used)

- **Greedy (by efficiency ratio)**: Faster but doesn't guarantee optimal results
- **Brute Force**: O(2^n) - too slow for even moderate n
- **Branch and Bound**: More complex implementation for similar results

---

## Frontend Pages

### 1. Quiz List (`/`)
- Displays all available quizzes
- Shows quiz metadata (title, description, question count)
- Links to individual quiz pages

### 2. Quiz Attempt (`/quizzes/[quizId]`)
- Displays all questions with scores and time requirements
- Allows users to submit answers (optional feature)
- Links to optimization page
- Shows quiz summary statistics

### 3. Optimization Result (`/quizzes/[quizId]/optimize`)
- Input form for available time
- Calls the optimization API
- Displays selected questions with:
  - Question text
  - Score and time metadata
  - Efficiency ratio (points/minute)
- Shows optimization summary (total score, time used)
- Algorithm explanation

---

## Assumptions and Trade-offs

### Authentication
**Assumption**: MVP uses a hardcoded demo user ID from seed data.

**Trade-off**: Simplified authentication to focus on core algorithm implementation. In production, would implement:
- Supabase Auth integration
- User registration/login
- Protected routes
- User-specific data isolation

### UI/UX
**Assumption**: Functional UI over visual polish.

**Trade-off**: No CSS framework (Tailwind, etc.) or component library. Uses minimal inline styles and semantic HTML. Prioritized:
- Code readability
- Type safety
- Functional correctness

### Answer Grading
**Assumption**: No automatic grading of answers.

**Trade-off**: The `is_correct` field exists in the schema but isn't validated server-side. In production:
- Would implement answer validation logic
- Store correct answers securely
- Calculate and display quiz scores

### Error Handling
**Assumption**: User-friendly error messages, console logging for debugging.

**Trade-off**: No production monitoring/logging service. Uses:
- Try-catch blocks
- Zod validation
- HTTP status codes
- Clear error messages

### Scalability
**Assumption**: Small to medium datasets (hundreds of questions).

**Trade-off**: The O(n × W) DP algorithm is efficient for typical quiz sizes but could be optimized for:
- Very large question sets (thousands)
- Very long time limits (hours)
- Using space-optimized DP (1D array instead of 2D)

### Testing
**Assumption**: Manual testing during development.

**Trade-off**: No automated test suite (unit, integration, E2E) to stay within time constraints. Production-ready code would include:
- Jest/Vitest for unit tests
- React Testing Library for components
- Playwright/Cypress for E2E tests
- API endpoint testing

---

## Optional Features

### Difficulty Filtering
An optional feature allows filtering quiz questions by difficulty level (easy, medium, hard). Users can select a difficulty from a dropdown on the Quiz Attempt page, which filters questions via the `GET /api/quizzes/[quizId]/questions?difficulty=` endpoint. This feature is fully backward compatible—when no filter is applied, all questions are returned. The core optimization algorithm (0/1 Knapsack) remains unchanged and operates on whatever questions are displayed. This demonstrates extensibility without breaking existing functionality.

---

## Key Design Decisions

1. **Next.js App Router**: Modern React Server Components for better performance
2. **TypeScript Strict Mode**: Zero `any` types for maximum type safety
3. **Server-Side Supabase Client**: Separate client/server instances to avoid state leakage
4. **Zod Validation**: Runtime type checking at API boundaries
5. **Pure Algorithm Function**: Isolated from UI/API for testability and reusability
6. **Detailed Comments**: Focused on explaining *why* (algorithm logic) not *what* (obvious code)

---

## Project Structure

```
quiz-optimizer/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── quizzes/route.ts
│   │   │   ├── quizzes/[quizId]/questions/route.ts
│   │   │   ├── answers/route.ts
│   │   │   └── optimize/route.ts
│   │   ├── quizzes/[quizId]/
│   │   │   ├── page.tsx
│   │   │   └── optimize/page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── lib/
│   │   ├── algorithms/
│   │   │   └── knapsack.ts
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── database.types.ts
│   │   └── types/
│   │       └── index.ts
├── supabase/
│   ├── schema.sql
│   └── seed.sql
├── .env.local
├── .env.example
└── package.json
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---


