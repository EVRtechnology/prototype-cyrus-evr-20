/**
 * Suggestion Types for EVR Billings Score System
 */

export type SuggestionStatus =
  | 'pending'
  | 'voting'
  | 'passed'
  | 'failed'
  | 'retry_pending'
  | 'retry_voting';

export interface Suggestion {
  id: string;
  sessionId: string;
  participantId: string;
  round: number;
  content: string;

  // Voting
  status: SuggestionStatus;
  votesFor: number;
  votesAgainst: number;
  requiredVotes: number; // Based on round (3, 9, 27, etc.)

  // Retry mechanism
  retryCount: number;
  supporters: string[]; // Participant IDs who staked scores
  needsSupporters: number; // Always 3

  createdAt: Date;
  votingStartedAt?: Date;
  votingEndedAt?: Date;
}

export interface CreateSuggestionInput {
  sessionId: string;
  participantId: string;
  round: number;
  content: string;
}

export interface UpdateSuggestionInput {
  status?: SuggestionStatus;
  votesFor?: number;
  votesAgainst?: number;
  supporters?: string[];
  votingStartedAt?: Date;
  votingEndedAt?: Date;
}
