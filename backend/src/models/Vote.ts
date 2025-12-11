/**
 * Vote Model
 * Handles database operations for votes
 */

import pool from '../config/database';
import { Vote, CreateVoteInput } from '@evr/shared';

export class VoteModel {
  /**
   * Create a new vote
   */
  static async create(input: CreateVoteInput): Promise<Vote> {
    const query = `
      INSERT INTO votes (session_id, suggestion_id, voter_id, vote, round)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [input.sessionId, input.suggestionId, input.voterId, input.vote, input.round];
    const result = await pool.query(query, values);
    return this.mapRowToVote(result.rows[0]);
  }

  /**
   * Find vote by ID
   */
  static async findById(id: string): Promise<Vote | null> {
    const query = 'SELECT * FROM votes WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToVote(result.rows[0]) : null;
  }

  /**
   * Find vote by voter and suggestion (to check if already voted)
   */
  static async findByVoterAndSuggestion(voterId: string, suggestionId: string): Promise<Vote | null> {
    const query = 'SELECT * FROM votes WHERE voter_id = $1 AND suggestion_id = $2';
    const result = await pool.query(query, [voterId, suggestionId]);
    return result.rows[0] ? this.mapRowToVote(result.rows[0]) : null;
  }

  /**
   * Find all votes for a suggestion
   */
  static async findBySuggestion(suggestionId: string): Promise<Vote[]> {
    const query = `
      SELECT * FROM votes
      WHERE suggestion_id = $1
      ORDER BY timestamp ASC
    `;

    const result = await pool.query(query, [suggestionId]);
    return result.rows.map(this.mapRowToVote);
  }

  /**
   * Find all votes by a voter
   */
  static async findByVoter(voterId: string): Promise<Vote[]> {
    const query = `
      SELECT * FROM votes
      WHERE voter_id = $1
      ORDER BY timestamp DESC
    `;

    const result = await pool.query(query, [voterId]);
    return result.rows.map(this.mapRowToVote);
  }

  /**
   * Find all votes in a session
   */
  static async findBySession(sessionId: string, round?: number): Promise<Vote[]> {
    let query = 'SELECT * FROM votes WHERE session_id = $1';
    const values: any[] = [sessionId];

    if (round !== undefined) {
      query += ' AND round = $2';
      values.push(round);
    }

    query += ' ORDER BY timestamp ASC';

    const result = await pool.query(query, values);
    return result.rows.map(this.mapRowToVote);
  }

  /**
   * Get vote counts for a suggestion
   */
  static async getVoteCounts(suggestionId: string): Promise<{ for: number; against: number }> {
    const query = `
      SELECT
        vote,
        COUNT(*) as count
      FROM votes
      WHERE suggestion_id = $1
      GROUP BY vote
    `;

    const result = await pool.query(query, [suggestionId]);
    const counts = { for: 0, against: 0 };

    result.rows.forEach((row) => {
      if (row.vote === 'for') {
        counts.for = parseInt(row.count);
      } else if (row.vote === 'against') {
        counts.against = parseInt(row.count);
      }
    });

    return counts;
  }

  /**
   * Delete a vote
   */
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM votes WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Map database row to Vote object
   */
  private static mapRowToVote(row: any): Vote {
    return {
      id: row.id,
      sessionId: row.session_id,
      suggestionId: row.suggestion_id,
      voterId: row.voter_id,
      vote: row.vote,
      round: row.round,
      timestamp: new Date(row.timestamp),
    };
  }
}
