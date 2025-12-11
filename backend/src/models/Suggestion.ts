/**
 * Suggestion Model
 * Handles database operations for suggestions
 */

import pool from '../config/database';
import { Suggestion, CreateSuggestionInput, UpdateSuggestionInput } from '@evr/shared';

export class SuggestionModel {
  /**
   * Create a new suggestion
   */
  static async create(input: CreateSuggestionInput): Promise<Suggestion> {
    // Calculate required votes based on round (3^round)
    const requiredVotes = Math.pow(3, input.round);

    const query = `
      INSERT INTO suggestions (session_id, participant_id, round, content, required_votes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [input.sessionId, input.participantId, input.round, input.content, requiredVotes];
    const result = await pool.query(query, values);
    return this.mapRowToSuggestion(result.rows[0]);
  }

  /**
   * Find suggestion by ID
   */
  static async findById(id: string): Promise<Suggestion | null> {
    const query = 'SELECT * FROM suggestions WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToSuggestion(result.rows[0]) : null;
  }

  /**
   * Find all suggestions in a session
   */
  static async findBySession(sessionId: string, round?: number): Promise<Suggestion[]> {
    let query = 'SELECT * FROM suggestions WHERE session_id = $1';
    const values: any[] = [sessionId];

    if (round !== undefined) {
      query += ' AND round = $2';
      values.push(round);
    }

    query += ' ORDER BY created_at ASC';

    const result = await pool.query(query, values);
    return result.rows.map(this.mapRowToSuggestion);
  }

  /**
   * Find suggestions by participant
   */
  static async findByParticipant(participantId: string): Promise<Suggestion[]> {
    const query = `
      SELECT * FROM suggestions
      WHERE participant_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [participantId]);
    return result.rows.map(this.mapRowToSuggestion);
  }

  /**
   * Find suggestions by status
   */
  static async findByStatus(sessionId: string, status: string): Promise<Suggestion[]> {
    const query = `
      SELECT * FROM suggestions
      WHERE session_id = $1 AND status = $2
      ORDER BY created_at ASC
    `;

    const result = await pool.query(query, [sessionId, status]);
    return result.rows.map(this.mapRowToSuggestion);
  }

  /**
   * Update suggestion
   */
  static async update(id: string, input: UpdateSuggestionInput): Promise<Suggestion | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(input.status);
    }

    if (input.votesFor !== undefined) {
      fields.push(`votes_for = $${paramCount++}`);
      values.push(input.votesFor);
    }

    if (input.votesAgainst !== undefined) {
      fields.push(`votes_against = $${paramCount++}`);
      values.push(input.votesAgainst);
    }

    if (input.supporters !== undefined) {
      fields.push(`supporters = $${paramCount++}`);
      values.push(JSON.stringify(input.supporters));
    }

    if (input.votingStartedAt !== undefined) {
      fields.push(`voting_started_at = $${paramCount++}`);
      values.push(input.votingStartedAt);
    }

    if (input.votingEndedAt !== undefined) {
      fields.push(`voting_ended_at = $${paramCount++}`);
      values.push(input.votingEndedAt);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE suggestions
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] ? this.mapRowToSuggestion(result.rows[0]) : null;
  }

  /**
   * Increment vote count
   */
  static async incrementVote(id: string, voteType: 'for' | 'against'): Promise<Suggestion | null> {
    const column = voteType === 'for' ? 'votes_for' : 'votes_against';
    const query = `
      UPDATE suggestions
      SET ${column} = ${column} + 1
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToSuggestion(result.rows[0]) : null;
  }

  /**
   * Add supporter to suggestion
   */
  static async addSupporter(id: string, supporterId: string): Promise<Suggestion | null> {
    const query = `
      UPDATE suggestions
      SET supporters = supporters || $1::jsonb
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [JSON.stringify([supporterId]), id]);
    return result.rows[0] ? this.mapRowToSuggestion(result.rows[0]) : null;
  }

  /**
   * Increment retry count
   */
  static async incrementRetryCount(id: string): Promise<Suggestion | null> {
    const query = `
      UPDATE suggestions
      SET retry_count = retry_count + 1
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToSuggestion(result.rows[0]) : null;
  }

  /**
   * Delete a suggestion
   */
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM suggestions WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Map database row to Suggestion object
   */
  private static mapRowToSuggestion(row: any): Suggestion {
    const supporters = typeof row.supporters === 'string'
      ? JSON.parse(row.supporters)
      : row.supporters;

    return {
      id: row.id,
      sessionId: row.session_id,
      participantId: row.participant_id,
      round: row.round,
      content: row.content,
      status: row.status,
      votesFor: row.votes_for,
      votesAgainst: row.votes_against,
      requiredVotes: row.required_votes,
      retryCount: row.retry_count,
      supporters: supporters || [],
      needsSupporters: row.needs_supporters,
      createdAt: new Date(row.created_at),
      votingStartedAt: row.voting_started_at ? new Date(row.voting_started_at) : undefined,
      votingEndedAt: row.voting_ended_at ? new Date(row.voting_ended_at) : undefined,
    };
  }
}
