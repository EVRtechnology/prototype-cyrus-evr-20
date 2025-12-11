/**
 * Session Types for EVR Billings Score System
 */

export type SessionStatus =
  | 'setup'
  | 'lobby'
  | 'submission'
  | 'voting'
  | 'results'
  | 'retry'
  | 'ended';

export type RetryFrequency = 'every' | 'every_n' | 'final_only';

export interface RetryConfig {
  frequency: RetryFrequency;
  everyNRounds?: number;
  supportCollectionTime: number; // minutes
}

export interface DisplayOptions {
  liveDashboard: boolean;
  retryQueue: boolean;
  finalResults: boolean;
}

export interface SessionConfig {
  maxParticipants: number;
  totalRounds: number;
  anonymousMode: boolean;
  retryConfig: RetryConfig;
  displayOptions: DisplayOptions;
}

export interface Session {
  id: string;
  code: string; // e.g., "ABCD-1234"
  name: string;
  facilitatorId: string;
  status: SessionStatus;
  config: SessionConfig;
  currentRound: number;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
}

export interface CreateSessionInput {
  name: string;
  facilitatorId: string;
  config?: Partial<SessionConfig>;
}

export interface UpdateSessionInput {
  name?: string;
  config?: Partial<SessionConfig>;
  status?: SessionStatus;
  currentRound?: number;
}
