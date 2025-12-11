/**
 * WebSocket Event Types for EVR Billings Score System
 */

import { Session, SessionStatus } from './session';
import { Participant } from './participant';
import { Suggestion } from './suggestion';
import { Vote } from './vote';

// Facilitator Events
export interface FacilitatorStatsEvent {
  sessionId: string;
  totalParticipants: number;
  activeParticipants: number;
  submitters: number;
  voters: number;
  currentPhase: SessionStatus;
  roundProgress: {
    submitted: number;
    totalSubmitters: number;
    votesCompleted: number;
    totalVotes: number;
  };
}

export interface ParticipantJoinedEvent {
  participant: Participant;
  sessionId: string;
  timestamp: Date;
}

export interface ParticipantLeftEvent {
  participantId: string;
  sessionId: string;
  timestamp: Date;
}

export interface PhaseChangedEvent {
  sessionId: string;
  oldPhase: SessionStatus;
  newPhase: SessionStatus;
  timestamp: Date;
}

export interface AlertEvent {
  sessionId: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: Date;
}

// Facilitator Commands
export interface PauseSessionCommand {
  sessionId: string;
}

export interface ResumeSessionCommand {
  sessionId: string;
}

export interface SkipPhaseCommand {
  sessionId: string;
}

export interface EndSessionCommand {
  sessionId: string;
}

export interface RemoveParticipantCommand {
  sessionId: string;
  participantId: string;
}

// Participant Events
export interface SuggestionSubmittedEvent {
  suggestion: Suggestion;
  sessionId: string;
  timestamp: Date;
}

export interface VoteCastEvent {
  vote: Vote;
  sessionId: string;
  timestamp: Date;
}

export interface ScoreUpdateEvent {
  participantId: string;
  oldScore: number;
  newScore: number;
  reason: string;
  round: number;
  timestamp: Date;
}

export interface VotingQueueEvent {
  participantId: string;
  suggestions: Suggestion[];
}

// Public Display Events
export interface PublicStatsEvent {
  sessionCode: string;
  sessionName: string;
  currentPhase: SessionStatus;
  currentRound: number;
  participantCount: number;
  progress: {
    phase: SessionStatus;
    percentage: number;
  };
}

export interface LiveVoteCountEvent {
  suggestionId: string;
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  requiredVotes: number;
}

export interface ResultsEvent {
  sessionId: string;
  round: number;
  passedSuggestions: Suggestion[];
  failedSuggestions: Suggestion[];
  scoreUpdates: ScoreUpdateEvent[];
}

// Socket Event Names
export const FacilitatorEvents = {
  STATS: 'facilitator:stats',
  PARTICIPANT_JOINED: 'facilitator:participant:joined',
  PARTICIPANT_LEFT: 'facilitator:participant:left',
  PHASE_CHANGED: 'facilitator:phase:changed',
  ALERT: 'facilitator:alert',
} as const;

export const FacilitatorCommands = {
  PAUSE: 'facilitator:pause',
  RESUME: 'facilitator:resume',
  SKIP_PHASE: 'facilitator:skip_phase',
  END_SESSION: 'facilitator:end_session',
  REMOVE_PARTICIPANT: 'facilitator:remove_participant',
} as const;

export const ParticipantEvents = {
  SUGGESTION_SUBMITTED: 'participant:suggestion:submitted',
  VOTE_CAST: 'participant:vote:cast',
  SCORE_UPDATE: 'participant:score:update',
  VOTING_QUEUE: 'participant:voting:queue',
  PHASE_CHANGED: 'participant:phase:changed',
} as const;

export const PublicEvents = {
  STATS: 'public:stats',
  LIVE_VOTE_COUNT: 'public:live_vote_count',
  RESULTS: 'public:results',
} as const;
