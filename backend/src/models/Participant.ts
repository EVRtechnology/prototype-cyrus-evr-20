/**
 * Participant Model
 * Handles database operations for participants
 */

import pool from '../config/database';
import { Participant, CreateParticipantInput, UpdateParticipantInput, ScoreHistoryEntry } from '@evr/shared';
import config from '../config';

export class ParticipantModel {
  /**
   * Create a new participant
   */
  static async create(input: CreateParticipantInput): Promise<Participant> {
    const username = input.username || `Participant #${Math.floor(Math.random() * 10000)}`;
    const initialScore = config.billings.initialScore;

    const query = `
      INSERT INTO participants (session_id, username, role, billings_score)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [input.sessionId, username, input.role, initialScore];
    const result = await pool.query(query, values);
    return this.mapRowToParticipant(result.rows[0]);
  }

  /**
   * Find participant by ID
   */
  static async findById(id: string): Promise<Participant | null> {
    const query = 'SELECT * FROM participants WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToParticipant(result.rows[0]) : null;
  }

  /**
   * Find all participants in a session
   */
  static async findBySession(sessionId: string, activeOnly: boolean = false): Promise<Participant[]> {
    let query = 'SELECT * FROM participants WHERE session_id = $1';
    if (activeOnly) {
      query += ' AND is_active = true';
    }
    query += ' ORDER BY joined_at ASC';

    const result = await pool.query(query, [sessionId]);
    return result.rows.map(this.mapRowToParticipant);
  }

  /**
   * Update participant
   */
  static async update(id: string, input: UpdateParticipantInput): Promise<Participant | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.username !== undefined) {
      fields.push(`username = $${paramCount++}`);
      values.push(input.username);
    }

    if (input.role !== undefined) {
      fields.push(`role = $${paramCount++}`);
      values.push(input.role);
    }

    if (input.hasSubmitted !== undefined) {
      fields.push(`has_submitted = $${paramCount++}`);
      values.push(input.hasSubmitted);
    }

    if (input.votesCompleted !== undefined) {
      fields.push(`votes_completed = $${paramCount++}`);
      values.push(input.votesCompleted);
    }

    if (input.isActive !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(input.isActive);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE participants
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] ? this.mapRowToParticipant(result.rows[0]) : null;
  }

  /**
   * Update participant's Billings Score
   */
  static async updateScore(
    id: string,
    newScore: number,
    round: number,
    reason: string
  ): Promise<Participant | null> {
    // Clamp score between 0 and 1
    const clampedScore = Math.max(0, Math.min(1, newScore));

    const historyEntry: ScoreHistoryEntry = {
      round,
      score: clampedScore,
      reason,
      timestamp: new Date(),
    };

    const query = `
      UPDATE participants
      SET
        billings_score = $1,
        score_history = score_history || $2::jsonb
      WHERE id = $3
      RETURNING *
    `;

    const values = [clampedScore, JSON.stringify(historyEntry), id];
    const result = await pool.query(query, values);
    return result.rows[0] ? this.mapRowToParticipant(result.rows[0]) : null;
  }

  /**
   * Set QR code for participant
   */
  static async setQRCode(id: string, qrCode: string, expiresAt: Date): Promise<Participant | null> {
    const query = `
      UPDATE participants
      SET qr_code = $1, qr_expires_at = $2
      WHERE id = $3
      RETURNING *
    `;

    const result = await pool.query(query, [qrCode, expiresAt, id]);
    return result.rows[0] ? this.mapRowToParticipant(result.rows[0]) : null;
  }

  /**
   * Clear QR code for participant
   */
  static async clearQRCode(id: string): Promise<Participant | null> {
    const query = `
      UPDATE participants
      SET qr_code = NULL, qr_expires_at = NULL
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToParticipant(result.rows[0]) : null;
  }

  /**
   * Get participant count by role for a session
   */
  static async getCountsByRole(sessionId: string): Promise<{ submitters: number; voters: number }> {
    const query = `
      SELECT
        role,
        COUNT(*) as count
      FROM participants
      WHERE session_id = $1 AND is_active = true
      GROUP BY role
    `;

    const result = await pool.query(query, [sessionId]);
    const counts = { submitters: 0, voters: 0 };

    result.rows.forEach((row) => {
      if (row.role === 'submitter') {
        counts.submitters = parseInt(row.count);
      } else if (row.role === 'voter') {
        counts.voters = parseInt(row.count);
      }
    });

    return counts;
  }

  /**
   * Delete a participant
   */
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM participants WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Map database row to Participant object
   */
  private static mapRowToParticipant(row: any): Participant {
    const scoreHistory = typeof row.score_history === 'string'
      ? JSON.parse(row.score_history)
      : row.score_history;

    return {
      id: row.id,
      sessionId: row.session_id,
      username: row.username,
      billingsScore: parseFloat(row.billings_score),
      role: row.role,
      hasSubmitted: row.has_submitted,
      votesCompleted: row.votes_completed,
      qrCode: row.qr_code || undefined,
      qrExpiresAt: row.qr_expires_at ? new Date(row.qr_expires_at) : undefined,
      scoreHistory: scoreHistory.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      })),
      joinedAt: new Date(row.joined_at),
      isActive: row.is_active,
    };
  }
}
