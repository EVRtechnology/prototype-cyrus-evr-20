/**
 * Billings Score Calculation Utilities
 * Based on the EVR Billings Score algorithm
 */

import config from '../config';

/**
 * Calculate new score after successful suggestion
 * newScore = min(1.0, currentScore + (0.1 * (1 - currentScore)))
 */
export function calculateSuccessScore(currentScore: number): number {
  const increment = config.billings.successIncrement * (1 - currentScore);
  return Math.min(1.0, currentScore + increment);
}

/**
 * Calculate new score after failed suggestion
 * newScore = max(0.0, currentScore - (0.1 * currentScore))
 */
export function calculateFailureScore(currentScore: number): number {
  const decrement = config.billings.failureDecrement * currentScore;
  return Math.max(0.0, currentScore - decrement);
}

/**
 * Calculate new score after successfully helping someone (stake success)
 * newScore = min(1.0, currentScore + 0.02)
 */
export function calculateHelpSuccessScore(currentScore: number): number {
  return Math.min(1.0, currentScore + config.billings.helpSuccessIncrement);
}

/**
 * Calculate new score after failed help (stake failure)
 * newScore = max(0.0, currentScore - 0.05)
 */
export function calculateHelpFailureScore(currentScore: number): number {
  return Math.max(0.0, currentScore - config.billings.helpFailureDecrement);
}

/**
 * Calculate passive time-based score increment
 * newScore = min(1.0, currentScore + 0.001)
 * Applied every 5 minutes
 */
export function calculatePassiveScore(currentScore: number): number {
  return Math.min(1.0, currentScore + config.billings.passiveIncrement);
}

/**
 * Get initial Billings score for new participants
 */
export function getInitialScore(): number {
  return config.billings.initialScore;
}

/**
 * Ensure score is within valid range [0, 1]
 */
export function normalizeScore(score: number): number {
  return Math.max(0, Math.min(1, score));
}

/**
 * Format score for display (2 decimal places)
 */
export function formatScore(score: number): string {
  return score.toFixed(2);
}

/**
 * Calculate score percentage (0-100)
 */
export function scoreToPercentage(score: number): number {
  return Math.round(score * 100);
}
