/**
 * Participant Types for EVR Billings Score System
 */

export type ParticipantRole = 'submitter' | 'voter';

export interface ScoreHistoryEntry {
  round: number;
  score: number;
  reason: string;
  timestamp: Date;
}

export interface Participant {
  id: string;
  sessionId: string;
  username: string; // or "Participant #X" if anonymous
  billingsScore: number; // 0-1, starts at 0.5
  role: ParticipantRole;

  // Current state
  hasSubmitted: boolean;
  votesCompleted: number;
  qrCode?: string; // Active QR code if displaying
  qrExpiresAt?: Date;

  // History
  scoreHistory: ScoreHistoryEntry[];

  joinedAt: Date;
  isActive: boolean;
}

export interface CreateParticipantInput {
  sessionId: string;
  username?: string;
  role: ParticipantRole;
}

export interface UpdateParticipantInput {
  username?: string;
  role?: ParticipantRole;
  hasSubmitted?: boolean;
  votesCompleted?: number;
  isActive?: boolean;
}

export interface QRCodeData {
  participantId: string;
  sessionId: string;
  billingsScore: number;
  expiresAt: string;
  signature: string; // HMAC for validation
}
