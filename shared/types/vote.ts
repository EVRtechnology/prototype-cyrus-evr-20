/**
 * Vote and Support Stake Types for EVR Billings Score System
 */

export type VoteChoice = 'for' | 'against';

export interface Vote {
  id: string;
  sessionId: string;
  suggestionId: string;
  voterId: string;
  vote: VoteChoice;
  round: number;
  timestamp: Date;
}

export interface CreateVoteInput {
  sessionId: string;
  suggestionId: string;
  voterId: string;
  vote: VoteChoice;
  round: number;
}

export type SupportOutcome = 'success' | 'failure';

export interface SupportStake {
  id: string;
  sessionId: string;
  suggestionId: string;
  supporterId: string;
  supporterScoreAtStake: number;
  stakedAt: Date;
  resolved: boolean;
  outcome?: SupportOutcome;
}

export interface CreateSupportStakeInput {
  sessionId: string;
  suggestionId: string;
  supporterId: string;
  supporterScoreAtStake: number;
}

export interface ResolveSupportStakeInput {
  outcome: SupportOutcome;
}
