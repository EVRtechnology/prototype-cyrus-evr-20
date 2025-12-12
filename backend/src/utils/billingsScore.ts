/**
 * Billings Score Calculation Utilities
 * Based on the EVR Billings Score algorithm
 *
 * SECURITY NOTICE:
 * This module implements the Billings Score calculation algorithm with
 * input validation to prevent score manipulation and ensure data integrity.
 *
 * Key security features:
 * - Input validation for score values (must be 0-1)
 * - Protection against NaN and Infinity values
 * - Automatic normalization to valid range
 * - Clear error messages for invalid inputs
 *
 * All score values must be in the range [0, 1] where:
 * - 0 = lowest trust/reliability
 * - 1 = highest trust/reliability
 */

import { z } from 'zod';
import config from '../config';

/**
 * Zod schema for validating score values
 *
 * SECURITY: Ensures scores are valid numbers in the range [0, 1]
 * and rejects NaN, Infinity, or out-of-range values.
 */
const ScoreSchema = z.number()
  .min(0, { message: 'Score must be between 0 and 1' })
  .max(1, { message: 'Score must be between 0 and 1' })
  .finite({ message: 'Score must be a finite number (not NaN or Infinity)' });

/**
 * Validate a score value
 *
 * @param score - The score to validate
 * @param paramName - Name of the parameter (for error messages)
 * @throws {Error} If the score is invalid
 */
function validateScore(score: number, paramName: string = 'score'): void {
  const result = ScoreSchema.safeParse(score);
  if (!result.success) {
    const errorMessage = result.error.errors[0].message;
    throw new Error(`Invalid ${paramName}: ${errorMessage} (received: ${score})`);
  }
}

/**
 * Calculate new score after successful suggestion
 *
 * Formula: newScore = min(1.0, currentScore + (0.1 * (1 - currentScore)))
 *
 * SECURITY: Validates input score to prevent manipulation
 *
 * @param currentScore - Current Billings score (0-1)
 * @returns New score after successful suggestion
 * @throws {Error} If currentScore is invalid
 */
export function calculateSuccessScore(currentScore: number): number {
  validateScore(currentScore, 'currentScore');
  const increment = config.billings.successIncrement * (1 - currentScore);
  return Math.min(1.0, currentScore + increment);
}

/**
 * Calculate new score after failed suggestion
 *
 * Formula: newScore = max(0.0, currentScore - (0.1 * currentScore))
 *
 * SECURITY: Validates input score to prevent manipulation
 *
 * @param currentScore - Current Billings score (0-1)
 * @returns New score after failed suggestion
 * @throws {Error} If currentScore is invalid
 */
export function calculateFailureScore(currentScore: number): number {
  validateScore(currentScore, 'currentScore');
  const decrement = config.billings.failureDecrement * currentScore;
  return Math.max(0.0, currentScore - decrement);
}

/**
 * Calculate new score after successfully helping someone (stake success)
 *
 * Formula: newScore = min(1.0, currentScore + 0.02)
 *
 * SECURITY: Validates input score to prevent manipulation
 *
 * @param currentScore - Current Billings score (0-1)
 * @returns New score after successful help
 * @throws {Error} If currentScore is invalid
 */
export function calculateHelpSuccessScore(currentScore: number): number {
  validateScore(currentScore, 'currentScore');
  return Math.min(1.0, currentScore + config.billings.helpSuccessIncrement);
}

/**
 * Calculate new score after failed help (stake failure)
 *
 * Formula: newScore = max(0.0, currentScore - 0.05)
 *
 * SECURITY: Validates input score to prevent manipulation
 *
 * @param currentScore - Current Billings score (0-1)
 * @returns New score after failed help
 * @throws {Error} If currentScore is invalid
 */
export function calculateHelpFailureScore(currentScore: number): number {
  validateScore(currentScore, 'currentScore');
  return Math.max(0.0, currentScore - config.billings.helpFailureDecrement);
}

/**
 * Calculate passive time-based score increment
 *
 * Formula: newScore = min(1.0, currentScore + 0.001)
 * Applied every 5 minutes
 *
 * SECURITY: Validates input score to prevent manipulation
 *
 * @param currentScore - Current Billings score (0-1)
 * @returns New score after passive increment
 * @throws {Error} If currentScore is invalid
 */
export function calculatePassiveScore(currentScore: number): number {
  validateScore(currentScore, 'currentScore');
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
 *
 * SECURITY: Validates input and clamps to valid range.
 * Use this when receiving scores from external sources that may be out of range.
 *
 * @param score - Score value to normalize
 * @returns Score clamped to [0, 1] range
 * @throws {Error} If score is NaN or Infinity
 */
export function normalizeScore(score: number): number {
  if (!Number.isFinite(score)) {
    throw new Error(`Invalid score: must be a finite number (received: ${score})`);
  }
  return Math.max(0, Math.min(1, score));
}

/**
 * Format score for display (2 decimal places)
 *
 * @param score - Score to format (0-1)
 * @returns Formatted score string
 * @throws {Error} If score is invalid
 */
export function formatScore(score: number): string {
  validateScore(score, 'score');
  return score.toFixed(2);
}

/**
 * Calculate score percentage (0-100)
 *
 * @param score - Score to convert (0-1)
 * @returns Percentage value (0-100)
 * @throws {Error} If score is invalid
 */
export function scoreToPercentage(score: number): number {
  validateScore(score, 'score');
  return Math.round(score * 100);
}
