/**
 * 0/1 Knapsack Dynamic Programming Algorithm
 * 
 * Solves the classic optimization problem: Given a set of items, each with a weight
 * and value, determine which items to include to maximize total value without
 * exceeding a weight capacity.
 * 
 * Applied to quiz optimization:
 * - Items = Questions
 * - Weight = Time Required
 * - Value = Score
 * - Capacity = Total Available Time
 * 
 * Time Complexity: O(n * W) where n = number of items, W = capacity
 * Space Complexity: O(n * W) for the DP table
 */

import type { KnapsackItem, KnapsackResult, Question } from '../types';

/**
 * Solves the 0/1 Knapsack problem using dynamic programming
 * 
 * Each item can be selected at most once (0/1 constraint).
 * Returns the optimal subset that maximizes value without exceeding capacity.
 * 
 * @param items - Array of items with value (score) and weight (time)
 * @param capacity - Maximum total weight (time) allowed
 * @returns Object containing selected items, total value, and total weight
 */
export function knapsack(items: KnapsackItem[], capacity: number): KnapsackResult {
  const n = items.length;
  
  // Edge case: no items or no capacity
  if (n === 0 || capacity <= 0) {
    return {
      selected_items: [],
      total_value: 0,
      total_weight: 0,
    };
  }

  // Create DP table
  // dp[i][w] = maximum value achievable using first i items with weight limit w
  const dp: number[][] = Array(n + 1)
    .fill(0)
    .map(() => Array(capacity + 1).fill(0));

  // Build the DP table using bottom-up approach
  for (let i = 1; i <= n; i++) {
    const currentItem = items[i - 1];
    const itemWeight = currentItem.weight;
    const itemValue = currentItem.value;

    for (let w = 0; w <= capacity; w++) {
      // Option 1: Don't include current item
      dp[i][w] = dp[i - 1][w];

      // Option 2: Include current item (if it fits)
      if (itemWeight <= w) {
        const valueWithItem = dp[i - 1][w - itemWeight] + itemValue;
        dp[i][w] = Math.max(dp[i][w], valueWithItem);
      }
    }
  }

  // Backtrack to find which items were selected
  const selectedItems = backtrackSelection(dp, items, capacity);
  
  // Calculate totals
  const totalValue = selectedItems.reduce((sum, item) => sum + item.value, 0);
  const totalWeight = selectedItems.reduce((sum, item) => sum + item.weight, 0);

  return {
    selected_items: selectedItems,
    total_value: totalValue,
    total_weight: totalWeight,
  };
}

/**
 * Backtracks through the DP table to determine which items were selected
 * 
 * Works backwards from dp[n][capacity] to dp[0][0], checking whether
 * each item was included in the optimal solution.
 * 
 * @param dp - Completed DP table
 * @param items - Original items array
 * @param capacity - Original capacity constraint
 * @returns Array of selected items
 */
function backtrackSelection(
  dp: number[][],
  items: KnapsackItem[],
  capacity: number
): KnapsackItem[] {
  const selected: KnapsackItem[] = [];
  let w = capacity;
  let i = items.length;

  // Traverse backwards through the DP table
  while (i > 0 && w > 0) {
    // If value didn't come from the row above, this item was included
    if (dp[i][w] !== dp[i - 1][w]) {
      const selectedItem = items[i - 1];
      selected.push(selectedItem);
      
      // Move to the state before including this item
      w -= selectedItem.weight;
    }
    i--;
  }

  // Reverse to maintain original order
  return selected.reverse();
}

/**
 * Convenience wrapper for quiz optimization
 * 
 * Converts Questions to KnapsackItems, runs the algorithm,
 * and returns the selected questions with metadata.
 * 
 * @param questions - Array of quiz questions
 * @param totalTime - Total time available for the quiz
 * @returns Optimization result with selected questions
 */
export function optimizeQuestions(
  questions: Question[],
  totalTime: number
): KnapsackResult {
  // Validate inputs
  if (!Array.isArray(questions)) {
    throw new Error('Questions must be an array');
  }
  
  if (typeof totalTime !== 'number' || totalTime <= 0) {
    throw new Error('Total time must be a positive number');
  }

  // Convert questions to knapsack items
  const items: KnapsackItem[] = questions.map((q) => ({
    id: q.id,
    value: q.score,
    weight: q.time_required,
    data: q,
  }));

  // Run the knapsack algorithm
  return knapsack(items, totalTime);
}

/**
 * Validates that a solution is feasible
 * 
 * Checks that:
 * 1. Total weight doesn't exceed capacity
 * 2. All selected items are from the original set
 * 
 * @param result - Knapsack result to validate
 * @param capacity - Original capacity constraint
 * @returns true if valid, false otherwise
 */
export function validateSolution(
  result: KnapsackResult,
  capacity: number
): boolean {
  // Check weight constraint
  if (result.total_weight > capacity) {
    return false;
  }

  // Verify totals match
  const computedValue = result.selected_items.reduce(
    (sum, item) => sum + item.value,
    0
  );
  const computedWeight = result.selected_items.reduce(
    (sum, item) => sum + item.weight,
    0
  );

  return (
    computedValue === result.total_value &&
    computedWeight === result.total_weight
  );
}
